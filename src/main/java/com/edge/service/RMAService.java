package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.RMA;
import com.edge.entity.RMAItem;
import com.edge.entity.Product;
import com.edge.entity.Warehouse;
import com.edge.repository.RMARepository;
import com.edge.repository.OrderRepository;
import com.edge.repository.ProductRepository;
import com.edge.repository.CustomerRepository;
import com.edge.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class RMAService {
    
    @Autowired
    private RMARepository rmaRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<RMA> getAllRMAs() {
        return rmaRepository.getAllRMAs();
    }
    
    public Optional<RMA> getRMAById(String id) {
        return rmaRepository.getRMAById(id);
    }
    
    public Optional<RMA> getRMAByRMANumber(String rmaNumber) {
        return rmaRepository.getRMAByRMANumber(rmaNumber);
    }
    
    public List<RMA> getRMAsByOrderId(String orderId) {
        return rmaRepository.getRMAsByOrderId(orderId);
    }
    
    public List<RMA> getRMAsByCustomerId(String customerId) {
        return rmaRepository.getRMAsByCustomerId(customerId);
    }
    
    public List<RMA> getRMAsByStatus(String status) {
        return rmaRepository.getRMAsByStatus(status);
    }
    
    public RMA createRMA(RMA rma) {
        // Enrich RMA with order and customer information
        enrichRMAWithOrderInfo(rma);
        enrichRMAItems(rma);
        
        RMA created = rmaRepository.createRMA(rma);
        if (webSocketService != null) {
            webSocketService.broadcastRMAUpdate(created);
        }
        return created;
    }
    
    public RMA updateRMA(String id, RMA rmaDetails) {
        System.out.println("RMAService.updateRMA - ID: " + id + ", Status: " + rmaDetails.getStatus());
        
        // Get existing RMA to check status change
        RMA existingRMA = rmaRepository.getRMAById(id)
            .orElseThrow(() -> new RuntimeException("RMA not found with id: " + id));
        String newStatus = rmaDetails.getStatus();
        boolean wasReceived = isReceivedStatus(existingRMA);
        boolean willBeReceived = "RECEIVED".equals(newStatus);
        boolean willBeProcessed = "PROCESSED".equals(newStatus);
        boolean willBeCancelled = "CANCELLED".equals(newStatus);
        
        // Enrich RMA items with product information
        enrichRMAItems(rmaDetails);
        
        // Set received date when status changes to RECEIVED or PROCESSED
        if (willBeReceived && !wasReceived) {
            // Status changing to RECEIVED for the first time
            rmaDetails.setReceivedDate(LocalDateTime.now());
        } else if (willBeProcessed && !wasReceived && rmaDetails.getReceivedDate() == null) {
            // Status changing directly to PROCESSED (skipping RECEIVED)
            // Set receivedDate to indicate items were received
            rmaDetails.setReceivedDate(LocalDateTime.now());
        }
        
        RMA updated = rmaRepository.updateRMA(id, rmaDetails);
        System.out.println("RMAService.updateRMA - Updated status: " + updated.getStatus());
        
        // Handle inventory adjustments based on status changes
        if (willBeReceived && !wasReceived) {
            // Status changed to RECEIVED - increase inventory
            increaseInventoryForRMA(updated);
        } else if (willBeProcessed && !wasReceived) {
            // Status changed directly to PROCESSED (skipping RECEIVED) - increase inventory
            // This handles the case where RMA is marked as PROCESSED without going through RECEIVED
            increaseInventoryForRMA(updated);
        } else if (willBeCancelled && wasReceived) {
            // Status changed to CANCELLED after being received - rollback inventory
            decreaseInventoryForRMA(existingRMA);
        }
        
        // Broadcast update via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastRMAUpdate(updated);
        }
        
        return updated;
    }
    
    public RMA addRMAItem(String rmaId, String productId, Integer quantity, String reason) {
        RMA rma = rmaRepository.getRMAById(rmaId)
            .orElseThrow(() -> new RuntimeException("RMA not found with id: " + rmaId));
        
        Product product = productRepository.getProductById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Check if item already exists
        Optional<RMAItem> existingItem = rma.getItems().stream()
            .filter(item -> productId.equals(item.getProductId()))
            .findFirst();
        
        if (existingItem.isPresent()) {
            // Update quantity
            RMAItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.setReturnedQuantity(item.getQuantity()); // Initially, returned quantity equals requested quantity
            item.calculateLineTotal();
        } else {
            // Create new item
            RMAItem newItem = new RMAItem();
            newItem.setId(java.util.UUID.randomUUID().toString());
            newItem.setProductId(product.getId());
            newItem.setProductCode(product.getProductCode());
            newItem.setProductName(product.getProductName());
            newItem.setQuantity(quantity);
            newItem.setReturnedQuantity(quantity); // Initially, returned quantity equals requested quantity
            newItem.setUnitPrice(product.getUnitPrice());
            newItem.setReason(reason != null ? reason : "");
            newItem.setCondition("USED"); // Default condition
            newItem.calculateLineTotal();
            rma.getItems().add(newItem);
        }
        
        rma.calculateTotals();
        return rmaRepository.updateRMA(rmaId, rma);
    }
    
    public RMA updateRMAItemQuantity(String rmaId, String itemId, Integer quantity) {
        RMA rma = rmaRepository.getRMAById(rmaId)
            .orElseThrow(() -> new RuntimeException("RMA not found with id: " + rmaId));
        
        RMAItem item = rma.getItems().stream()
            .filter(i -> itemId.equals(i.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("RMA item not found with id: " + itemId));
        
        item.setQuantity(quantity);
        if (item.getReturnedQuantity() == null || item.getReturnedQuantity() > quantity) {
            item.setReturnedQuantity(quantity); // Adjust returned quantity if needed
        }
        item.calculateLineTotal();
        rma.calculateTotals();
        
        return rmaRepository.updateRMA(rmaId, rma);
    }
    
    public RMA updateRMAItemReturnedQuantity(String rmaId, String itemId, Integer returnedQuantity) {
        RMA rma = rmaRepository.getRMAById(rmaId)
            .orElseThrow(() -> new RuntimeException("RMA not found with id: " + rmaId));
        
        RMAItem item = rma.getItems().stream()
            .filter(i -> itemId.equals(i.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("RMA item not found with id: " + itemId));
        
        item.setReturnedQuantity(returnedQuantity);
        item.calculateLineTotal();
        rma.calculateTotals();
        
        return rmaRepository.updateRMA(rmaId, rma);
    }
    
    public RMA updateRMAItemCondition(String rmaId, String itemId, String condition) {
        RMA rma = rmaRepository.getRMAById(rmaId)
            .orElseThrow(() -> new RuntimeException("RMA not found with id: " + rmaId));
        
        RMAItem item = rma.getItems().stream()
            .filter(i -> itemId.equals(i.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("RMA item not found with id: " + itemId));
        
        item.setCondition(condition);
        rma.calculateTotals();
        
        RMA updated = rmaRepository.updateRMA(rmaId, rma);
        
        // Broadcast update via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastRMAUpdate(updated);
        }
        
        return updated;
    }
    
    public RMA removeRMAItem(String rmaId, String itemId) {
        RMA rma = rmaRepository.getRMAById(rmaId)
            .orElseThrow(() -> new RuntimeException("RMA not found with id: " + rmaId));
        
        boolean removed = rma.getItems().removeIf(item -> itemId.equals(item.getId()));
        if (!removed) {
            throw new RuntimeException("RMA item not found with id: " + itemId);
        }
        
        rma.calculateTotals();
        return rmaRepository.updateRMA(rmaId, rma);
    }
    
    public void deleteRMA(String id) {
        rmaRepository.deleteRMA(id);
        
        // Broadcast deletion via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastRMADelete(id);
        }
    }
    
    private void enrichRMAWithOrderInfo(RMA rma) {
        if (rma.getOrderId() != null) {
            orderRepository.getOrderById(rma.getOrderId()).ifPresent(order -> {
                rma.setOrderNumber(order.getOrderNumber());
                if (rma.getCustomerId() == null && order.getCustomerId() != null) {
                    rma.setCustomerId(order.getCustomerId());
                    customerRepository.getCustomerById(order.getCustomerId()).ifPresent(customer -> {
                        rma.setCustomerName(customer.getFullName());
                    });
                }
            });
        } else if (rma.getCustomerId() != null) {
            customerRepository.getCustomerById(rma.getCustomerId()).ifPresent(customer -> {
                rma.setCustomerName(customer.getFullName());
            });
        }
    }
    
    private void enrichRMAItems(RMA rma) {
        if (rma.getItems() != null) {
            for (RMAItem item : rma.getItems()) {
                if (item.getProductId() != null) {
                    productRepository.getProductById(item.getProductId()).ifPresent(product -> {
                        item.setProductCode(product.getProductCode());
                        item.setProductName(product.getProductName());
                        if (item.getUnitPrice() == null) {
                            item.setUnitPrice(product.getUnitPrice());
                        }
                        if (item.getReturnedQuantity() == null && item.getQuantity() != null) {
                            item.setReturnedQuantity(item.getQuantity());
                        }
                        item.calculateLineTotal();
                    });
                }
            }
        }
    }
    
    /**
     * Checks if an RMA has been received (status is RECEIVED or PROCESSED and has receivedDate)
     */
    private boolean isReceivedStatus(RMA rma) {
        if (rma == null) return false;
        String status = rma.getStatus();
        return ("RECEIVED".equals(status) || "PROCESSED".equals(status)) 
            && rma.getReceivedDate() != null;
    }
    
    /**
     * Increases inventory when RMA items are received/restocked
     */
    private void increaseInventoryForRMA(RMA rma) {
        if (rma.getItems() == null || rma.getItems().isEmpty()) {
            return;
        }
        
        // Get default warehouse (first active warehouse, or first warehouse if none active)
        List<Warehouse> warehouses = warehouseRepository.getActiveWarehouses();
        if (warehouses.isEmpty()) {
            warehouses = warehouseRepository.getAllWarehouses();
        }
        
        if (warehouses.isEmpty()) {
            System.out.println("Warning: No warehouses found. Cannot increase inventory for RMA " + rma.getId());
            return;
        }
        
        Warehouse defaultWarehouse = warehouses.get(0);
        String warehouseId = defaultWarehouse.getId();
        
        // Increase inventory for each RMA item (restock returned items)
        for (RMAItem item : rma.getItems()) {
            if (item.getProductId() != null && item.getReturnedQuantity() != null && item.getReturnedQuantity() > 0) {
                try {
                    inventoryService.adjustInventory(item.getProductId(), warehouseId, item.getReturnedQuantity());
                    System.out.println("Increased inventory (restocked) for product " + item.getProductId() + 
                        " by " + item.getReturnedQuantity() + " in warehouse " + warehouseId + " for RMA " + rma.getRmaNumber());
                } catch (Exception e) {
                    System.err.println("Error increasing inventory for product " + item.getProductId() + 
                        " in RMA " + rma.getRmaNumber() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
    }
    
    /**
     * Decreases inventory when RMA is cancelled after items were received (rollback restock)
     */
    private void decreaseInventoryForRMA(RMA rma) {
        if (rma.getItems() == null || rma.getItems().isEmpty()) {
            return;
        }
        
        // Get default warehouse (first active warehouse, or first warehouse if none active)
        List<Warehouse> warehouses = warehouseRepository.getActiveWarehouses();
        if (warehouses.isEmpty()) {
            warehouses = warehouseRepository.getAllWarehouses();
        }
        
        if (warehouses.isEmpty()) {
            System.out.println("Warning: No warehouses found. Cannot decrease inventory for RMA " + rma.getId());
            return;
        }
        
        Warehouse defaultWarehouse = warehouses.get(0);
        String warehouseId = defaultWarehouse.getId();
        
        // Decrease inventory for each RMA item (rollback restock)
        for (RMAItem item : rma.getItems()) {
            if (item.getProductId() != null && item.getReturnedQuantity() != null && item.getReturnedQuantity() > 0) {
                try {
                    // Use negative quantity to decrease inventory
                    inventoryService.adjustInventory(item.getProductId(), warehouseId, -item.getReturnedQuantity());
                    System.out.println("Decreased inventory (rollback) for product " + item.getProductId() + 
                        " by " + item.getReturnedQuantity() + " in warehouse " + warehouseId + " for cancelled RMA " + rma.getRmaNumber());
                } catch (Exception e) {
                    System.err.println("Error decreasing inventory for product " + item.getProductId() + 
                        " in RMA " + rma.getRmaNumber() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
    }
}

