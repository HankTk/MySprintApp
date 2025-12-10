package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Inventory;
import com.edge.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;
    
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }
    
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable String id) {
        return inventoryService.getInventoryById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping(value = "/product/{productId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<Inventory>> getInventoryByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }
    
    @GetMapping(value = "/warehouse/{warehouseId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<Inventory>> getInventoryByWarehouseId(@PathVariable String warehouseId) {
        return ResponseEntity.ok(inventoryService.getInventoryByWarehouseId(warehouseId));
    }
    
    @GetMapping(value = "/product/{productId}/warehouse/{warehouseId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Inventory> getInventoryByProductAndWarehouse(
            @PathVariable String productId,
            @PathVariable String warehouseId) {
        return inventoryService.getInventoryByProductAndWarehouse(productId, warehouseId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Inventory> createInventory(@RequestBody Inventory inventory) {
        try {
            Inventory created = inventoryService.createInventory(inventory);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Inventory> updateInventory(@PathVariable String id, @RequestBody Inventory inventory) {
        try {
            Inventory updated = inventoryService.updateInventory(id, inventory);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping(value = "/adjust", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Inventory> adjustInventory(@RequestBody AdjustInventoryRequest request) {
        try {
            Inventory updated = inventoryService.adjustInventory(
                request.getProductId(),
                request.getWarehouseId(),
                request.getQuantityChange()
            );
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable String id) {
        try {
            inventoryService.deleteInventory(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    public static class AdjustInventoryRequest {
        private String productId;
        private String warehouseId;
        private Integer quantityChange;
        
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public String getWarehouseId() { return warehouseId; }
        public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }
        
        public Integer getQuantityChange() { return quantityChange; }
        public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }
    }
}

