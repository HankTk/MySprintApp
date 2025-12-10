package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Inventory;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class InventoryRepository extends AbstractJsonRepository<Inventory> {
    private static final Logger logger = LoggerFactory.getLogger(InventoryRepository.class);
    private static final String DATA_FILE_NAME = "inventory.json";
    private static final String DATA_DIR_NAME = "data";

    public InventoryRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "inventory");
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty inventory list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Inventory>>() {});
            logger.info("Successfully loaded {} inventory records from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Inventory entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Inventory entity, String id) {
        entity.setId(id);
    }

    public Optional<Inventory> getInventoryById(String id) {
        return findById(id);
    }

    public Optional<Inventory> getInventoryByProductAndWarehouse(String productId, String warehouseId) {
        if (productId == null || warehouseId == null) return Optional.empty();
        return items.stream()
            .filter(inv -> productId.equals(inv.getProductId()) && warehouseId.equals(inv.getWarehouseId()))
            .findFirst();
    }

    public List<Inventory> getAllInventory() {
        return findAll();
    }

    public List<Inventory> getInventoryByProductId(String productId) {
        if (productId == null) return new java.util.ArrayList<>();
        return items.stream()
            .filter(inv -> productId.equals(inv.getProductId()))
            .collect(Collectors.toList());
    }

    public List<Inventory> getInventoryByWarehouseId(String warehouseId) {
        if (warehouseId == null) return new java.util.ArrayList<>();
        return items.stream()
            .filter(inv -> warehouseId.equals(inv.getWarehouseId()))
            .collect(Collectors.toList());
    }

    public Inventory createOrUpdateInventory(String productId, String warehouseId, Integer quantity) {
        if (productId == null || warehouseId == null) {
            throw new IllegalArgumentException("Product ID and Warehouse ID cannot be null");
        }
        
        Optional<Inventory> existing = getInventoryByProductAndWarehouse(productId, warehouseId);
        if (existing.isPresent()) {
            Inventory inv = existing.get();
            inv.setQuantity(quantity != null ? quantity : 0);
            saveItems();
            logger.info("Updated inventory for product {} in warehouse {} to quantity {}", productId, warehouseId, quantity);
            return inv;
        } else {
            Inventory newInventory = new Inventory();
            newInventory.setProductId(productId);
            newInventory.setWarehouseId(warehouseId);
            newInventory.setQuantity(quantity != null ? quantity : 0);
            Inventory saved = save(newInventory);
            logger.info("Created inventory for product {} in warehouse {} with quantity {}", productId, warehouseId, quantity);
            return saved;
        }
    }

    public Inventory adjustInventory(String productId, String warehouseId, Integer quantityChange) {
        if (productId == null || warehouseId == null) {
            throw new IllegalArgumentException("Product ID and Warehouse ID cannot be null");
        }
        
        Optional<Inventory> existing = getInventoryByProductAndWarehouse(productId, warehouseId);
        int currentQuantity = existing.map(Inventory::getQuantity).orElse(0);
        int newQuantity = currentQuantity + (quantityChange != null ? quantityChange : 0);
        
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Inventory quantity cannot be negative");
        }
        
        return createOrUpdateInventory(productId, warehouseId, newQuantity);
    }

    public Inventory createInventory(Inventory inventory) {
        if (inventory == null) throw new IllegalArgumentException("Inventory cannot be null");
        return save(inventory);
    }

    public Inventory updateInventory(String id, Inventory inventoryDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Inventory ID cannot be null or empty");
        if (inventoryDetails == null)
            throw new IllegalArgumentException("Inventory details cannot be null");

        Inventory existingInventory = findById(id).orElseThrow(() -> 
            new InventoryNotFoundException("Inventory not found with id: " + id));

        if (inventoryDetails.getQuantity() != null && inventoryDetails.getQuantity() < 0) {
            throw new IllegalArgumentException("Inventory quantity cannot be negative");
        }

        // Update fields
        if (inventoryDetails.getProductId() != null) {
            existingInventory.setProductId(inventoryDetails.getProductId());
        }
        if (inventoryDetails.getWarehouseId() != null) {
            existingInventory.setWarehouseId(inventoryDetails.getWarehouseId());
        }
        if (inventoryDetails.getQuantity() != null) {
            existingInventory.setQuantity(inventoryDetails.getQuantity());
        }
        existingInventory.setJsonData(inventoryDetails.getJsonData());
        
        saveItems();
        logger.info("Updated inventory with ID: {}", id);
        return existingInventory;
    }

    public void deleteInventory(String id) {
        deleteById(id);
    }

    public static class InventoryNotFoundException extends EntityNotFoundException {
        public InventoryNotFoundException(String message) { super(message); }
    }
}

