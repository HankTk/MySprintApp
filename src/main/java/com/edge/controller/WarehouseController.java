package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Warehouse;
import com.edge.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {
    
    @Autowired
    private WarehouseService warehouseService;
    
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }
    
    @GetMapping(value = "/active", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<Warehouse>> getActiveWarehouses() {
        return ResponseEntity.ok(warehouseService.getActiveWarehouses());
    }
    
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable String id) {
        return warehouseService.getWarehouseById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        try {
            Warehouse created = warehouseService.createWarehouse(warehouse);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable String id, @RequestBody Warehouse warehouse) {
        try {
            Warehouse updated = warehouseService.updateWarehouse(id, warehouse);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable String id) {
        try {
            warehouseService.deleteWarehouse(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

