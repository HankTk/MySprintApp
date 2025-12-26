package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.config.DataChangeNotification;
import com.edge.entity.Inventory;
import com.edge.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class InventoryService
{
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    private static final String DATA_TYPE_ID = "inventory";
    
    public List<Inventory> getAllInventory()
    {
        return inventoryRepository.getAllInventory();
    }
    
    public Optional<Inventory> getInventoryById(String id)
    {
        return inventoryRepository.getInventoryById(id);
    }
    
    public Optional<Inventory> getInventoryByProductAndWarehouse(String productId, String warehouseId)
    {
        return inventoryRepository.getInventoryByProductAndWarehouse(productId, warehouseId);
    }
    
    public List<Inventory> getInventoryByProductId(String productId)
    {
        return inventoryRepository.getInventoryByProductId(productId);
    }
    
    public List<Inventory> getInventoryByWarehouseId(String warehouseId)
    {
        return inventoryRepository.getInventoryByWarehouseId(warehouseId);
    }
    
    public Inventory createOrUpdateInventory(String productId, String warehouseId, Integer quantity)
 {
        Inventory inventory = inventoryRepository.createOrUpdateInventory(productId, warehouseId, quantity);
        // Determine if this is a create or update based on whether inventory existed
        Optional<Inventory> existing = inventoryRepository.getInventoryByProductAndWarehouse(productId, warehouseId);
        DataChangeNotification.ChangeType changeType = existing.isPresent() 
            ? DataChangeNotification.ChangeType.UPDATE 
            : DataChangeNotification.ChangeType.CREATE;
        notificationService.notifyDataChange(changeType, DATA_TYPE_ID, inventory);
        return inventory;
    }
    
    public Inventory adjustInventory(String productId, String warehouseId, Integer quantityChange)
 {
        Inventory inventory = inventoryRepository.adjustInventory(productId, warehouseId, quantityChange);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, inventory);
        return inventory;
    }
    
    public Inventory createInventory(Inventory inventory)
 {
        Inventory created = inventoryRepository.createInventory(inventory);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.CREATE, DATA_TYPE_ID, created);
        return created;
    }
    
    public Inventory updateInventory(String id, Inventory inventoryDetails)
 {
        Inventory updated = inventoryRepository.updateInventory(id, inventoryDetails);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, updated);
        return updated;
    }
    
    public void deleteInventory(String id)
 {
        Optional<Inventory> inventoryToDelete = inventoryRepository.getInventoryById(id);
        inventoryRepository.deleteInventory(id);
        if (inventoryToDelete.isPresent())
        {
            notificationService.notifyDataChange(DataChangeNotification.ChangeType.DELETE, DATA_TYPE_ID, inventoryToDelete.get());
        }
    }
}

