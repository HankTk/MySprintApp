package com.edge.service;

/**
 * @author Hidenori Takaku
 */
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
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
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
        if (webSocketService != null) {
            webSocketService.broadcastWarehouseUpdate(created);
        }
        return created;
    }
    
    public Warehouse updateWarehouse(String id, Warehouse warehouseDetails) {
        Warehouse updated = warehouseRepository.updateWarehouse(id, warehouseDetails);
        if (webSocketService != null) {
            webSocketService.broadcastWarehouseUpdate(updated);
        }
        return updated;
    }
    
    public void deleteWarehouse(String id) {
        warehouseRepository.deleteWarehouse(id);
        if (webSocketService != null) {
            webSocketService.broadcastWarehouseDelete(id);
        }
    }
}

