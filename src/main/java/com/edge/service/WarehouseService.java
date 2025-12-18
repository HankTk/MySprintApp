package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.config.DataChangeNotification;
import com.edge.entity.Warehouse;
import com.edge.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class WarehouseService {
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    private static final String DATA_TYPE_ID = "warehouses";
    
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.getAllWarehouses();
    }
    
    public Optional<Warehouse> getWarehouseById(String id) {
        return warehouseRepository.getWarehouseById(id);
    }
    
    public Optional<Warehouse> getWarehouseByCode(String warehouseCode) {
        return warehouseRepository.getWarehouseByCode(warehouseCode);
    }
    
    public List<Warehouse> getActiveWarehouses() {
        return warehouseRepository.getActiveWarehouses();
    }
    
    public Warehouse createWarehouse(Warehouse warehouse) {
        Warehouse created = warehouseRepository.createWarehouse(warehouse);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.CREATE, DATA_TYPE_ID, created);
        return created;
    }
    
    public Warehouse updateWarehouse(String id, Warehouse warehouseDetails) {
        Warehouse updated = warehouseRepository.updateWarehouse(id, warehouseDetails);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, updated);
        return updated;
    }
    
    public void deleteWarehouse(String id) {
        Optional<Warehouse> warehouseToDelete = warehouseRepository.getWarehouseById(id);
        warehouseRepository.deleteWarehouse(id);
        if (warehouseToDelete.isPresent()) {
            notificationService.notifyDataChange(DataChangeNotification.ChangeType.DELETE, DATA_TYPE_ID, warehouseToDelete.get());
        }
    }
}

