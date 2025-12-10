package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Inventory;
import com.edge.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class InventoryService {
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<Inventory> getAllInventory() {
        return inventoryRepository.getAllInventory();
    }
    
    public Optional<Inventory> getInventoryById(String id) {
        return inventoryRepository.getInventoryById(id);
    }
    
    public Optional<Inventory> getInventoryByProductAndWarehouse(String productId, String warehouseId) {
        return inventoryRepository.getInventoryByProductAndWarehouse(productId, warehouseId);
    }
    
    public List<Inventory> getInventoryByProductId(String productId) {
        return inventoryRepository.getInventoryByProductId(productId);
    }
    
    public List<Inventory> getInventoryByWarehouseId(String warehouseId) {
        return inventoryRepository.getInventoryByWarehouseId(warehouseId);
    }
    
    public Inventory createOrUpdateInventory(String productId, String warehouseId, Integer quantity) {
        Inventory inventory = inventoryRepository.createOrUpdateInventory(productId, warehouseId, quantity);
        if (webSocketService != null) {
            webSocketService.broadcastInventoryUpdate(inventory);
        }
        return inventory;
    }
    
    public Inventory adjustInventory(String productId, String warehouseId, Integer quantityChange) {
        Inventory inventory = inventoryRepository.adjustInventory(productId, warehouseId, quantityChange);
        if (webSocketService != null) {
            webSocketService.broadcastInventoryUpdate(inventory);
        }
        return inventory;
    }
    
    public Inventory createInventory(Inventory inventory) {
        Inventory created = inventoryRepository.createInventory(inventory);
        if (webSocketService != null) {
            webSocketService.broadcastInventoryUpdate(created);
        }
        return created;
    }
    
    public Inventory updateInventory(String id, Inventory inventoryDetails) {
        Inventory updated = inventoryRepository.updateInventory(id, inventoryDetails);
        if (webSocketService != null) {
            webSocketService.broadcastInventoryUpdate(updated);
        }
        return updated;
    }
    
    public void deleteInventory(String id) {
        inventoryRepository.deleteInventory(id);
        if (webSocketService != null) {
            webSocketService.broadcastInventoryDelete(id);
        }
    }
}

