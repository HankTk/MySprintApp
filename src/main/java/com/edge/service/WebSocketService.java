package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Address;
import com.edge.entity.Customer;
import com.edge.entity.Inventory;
import com.edge.entity.Order;
import com.edge.entity.Product;
import com.edge.entity.PurchaseOrder;
import com.edge.entity.RMA;
import com.edge.entity.SFC;
import com.edge.entity.User;
import com.edge.entity.Vendor;
import com.edge.entity.Warehouse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send entity update to all connected clients
     */
    public void broadcastEntityUpdate(String entityType, Object entity) {
        try {
            String topic = "/topic/" + entityType.toLowerCase() + "s/update";
            logger.info("Broadcasting {} update: {}", entityType, getEntityId(entity));
            messagingTemplate.convertAndSend(topic, entity);
        } catch (Exception e) {
            logger.error("Error broadcasting {} update", entityType, e);
        }
    }
    
    /**
     * Send entity deletion notification to all connected clients
     */
    public void broadcastEntityDelete(String entityType, String entityId) {
        try {
            String topic = "/topic/" + entityType.toLowerCase() + "s/delete";
            logger.info("Broadcasting {} deletion: {}", entityType, entityId);
            messagingTemplate.convertAndSend(topic, entityId);
        } catch (Exception e) {
            logger.error("Error broadcasting {} deletion", entityType, e);
        }
    }
    
    // Convenience methods for each entity type
    public void broadcastOrderUpdate(Order order) {
        broadcastEntityUpdate("order", order);
    }
    
    public void broadcastOrderDelete(String orderId) {
        broadcastEntityDelete("order", orderId);
    }
    
    public void broadcastCustomerUpdate(Customer customer) {
        broadcastEntityUpdate("customer", customer);
    }
    
    public void broadcastCustomerDelete(String customerId) {
        broadcastEntityDelete("customer", customerId);
    }
    
    public void broadcastProductUpdate(Product product) {
        broadcastEntityUpdate("product", product);
    }
    
    public void broadcastProductDelete(String productId) {
        broadcastEntityDelete("product", productId);
    }
    
    public void broadcastAddressUpdate(Address address) {
        broadcastEntityUpdate("address", address);
    }
    
    public void broadcastAddressDelete(String addressId) {
        broadcastEntityDelete("address", addressId);
    }
    
    public void broadcastUserUpdate(User user) {
        broadcastEntityUpdate("user", user);
    }
    
    public void broadcastUserDelete(String userId) {
        broadcastEntityDelete("user", userId);
    }
    
    public void broadcastPurchaseOrderUpdate(PurchaseOrder po) {
        broadcastEntityUpdate("purchaseOrder", po);
    }
    
    public void broadcastPurchaseOrderDelete(String poId) {
        broadcastEntityDelete("purchaseOrder", poId);
    }
    
    public void broadcastVendorUpdate(Vendor vendor) {
        broadcastEntityUpdate("vendor", vendor);
    }
    
    public void broadcastVendorDelete(String vendorId) {
        broadcastEntityDelete("vendor", vendorId);
    }
    
    public void broadcastWarehouseUpdate(Warehouse warehouse) {
        broadcastEntityUpdate("warehouse", warehouse);
    }
    
    public void broadcastWarehouseDelete(String warehouseId) {
        broadcastEntityDelete("warehouse", warehouseId);
    }
    
    public void broadcastInventoryUpdate(Inventory inventory) {
        broadcastEntityUpdate("inventory", inventory);
    }
    
    public void broadcastInventoryDelete(String inventoryId) {
        broadcastEntityDelete("inventory", inventoryId);
    }
    
    public void broadcastRMAUpdate(RMA rma) {
        broadcastEntityUpdate("rma", rma);
    }
    
    public void broadcastRMADelete(String rmaId) {
        broadcastEntityDelete("rma", rmaId);
    }
    
    public void broadcastSFCUpdate(SFC sfc) {
        broadcastEntityUpdate("sfc", sfc);
    }
    
    public void broadcastSFCDelete(String sfcId) {
        broadcastEntityDelete("sfc", sfcId);
    }
    
    private String getEntityId(Object entity) {
        if (entity instanceof Order) {
            return ((Order) entity).getId();
        } else if (entity instanceof Customer) {
            return ((Customer) entity).getId();
        } else if (entity instanceof Product) {
            return ((Product) entity).getId();
        } else if (entity instanceof Address) {
            return ((Address) entity).getId();
        } else if (entity instanceof User) {
            return ((User) entity).getId();
        } else if (entity instanceof PurchaseOrder) {
            return ((PurchaseOrder) entity).getId();
        } else if (entity instanceof Vendor) {
            return ((Vendor) entity).getId();
        } else if (entity instanceof Warehouse) {
            return ((Warehouse) entity).getId();
        } else if (entity instanceof Inventory) {
            return ((Inventory) entity).getId();
        } else if (entity instanceof RMA) {
            return ((RMA) entity).getId();
        } else if (entity instanceof SFC) {
            return ((SFC) entity).getId();
        }
        return "unknown";
    }
}

