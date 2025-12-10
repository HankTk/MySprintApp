package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Warehouse;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class WarehouseRepository extends AbstractJsonRepository<Warehouse> {
    private static final Logger logger = LoggerFactory.getLogger(WarehouseRepository.class);
    private static final String DATA_FILE_NAME = "warehouses.json";
    private static final String DATA_DIR_NAME = "data";

    public WarehouseRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "warehouses");
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty warehouse list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Warehouse>>() {});
            logger.info("Successfully loaded {} warehouses from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Warehouse entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Warehouse entity, String id) {
        entity.setId(id);
    }

    public Optional<Warehouse> getWarehouseById(String id) {
        return findById(id);
    }

    public Optional<Warehouse> getWarehouseByCode(String warehouseCode) {
        if (warehouseCode == null || warehouseCode.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(warehouse -> warehouseCode.equals(warehouse.getWarehouseCode())).findFirst();
    }

    public List<Warehouse> getAllWarehouses() {
        return findAll();
    }

    public List<Warehouse> getActiveWarehouses() {
        return items.stream()
            .filter(warehouse -> warehouse.isActive())
            .collect(java.util.stream.Collectors.toList());
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        if (warehouse == null) throw new IllegalArgumentException("Warehouse cannot be null");
        if (warehouse.getWarehouseCode() != null && !warehouse.getWarehouseCode().trim().isEmpty() && 
            getWarehouseByCode(warehouse.getWarehouseCode()).isPresent()) {
            throw new WarehouseAlreadyExistsException("Warehouse with code " + warehouse.getWarehouseCode() + " already exists");
        }
        return save(warehouse);
    }

    public Warehouse updateWarehouse(String id, Warehouse warehouseDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Warehouse ID cannot be null or empty");
        if (warehouseDetails == null)
            throw new IllegalArgumentException("Warehouse details cannot be null");

        Warehouse existingWarehouse = findById(id).orElseThrow(() -> 
            new WarehouseNotFoundException("Warehouse not found with id: " + id));

        if (warehouseDetails.getWarehouseCode() != null && !warehouseDetails.getWarehouseCode().trim().isEmpty()) {
            Optional<Warehouse> codeCheck = getWarehouseByCode(warehouseDetails.getWarehouseCode());
            if (codeCheck.isPresent() && !id.equals(codeCheck.get().getId())) {
                throw new WarehouseAlreadyExistsException("Warehouse with code " + warehouseDetails.getWarehouseCode() + " already exists");
            }
        }

        // Update fields
        existingWarehouse.setWarehouseCode(warehouseDetails.getWarehouseCode());
        existingWarehouse.setWarehouseName(warehouseDetails.getWarehouseName());
        existingWarehouse.setAddress(warehouseDetails.getAddress());
        existingWarehouse.setDescription(warehouseDetails.getDescription());
        existingWarehouse.setActive(warehouseDetails.isActive());
        existingWarehouse.setJsonData(warehouseDetails.getJsonData());
        
        saveItems();
        logger.info("Updated warehouse with ID: {}", id);
        return existingWarehouse;
    }

    public void deleteWarehouse(String id) {
        deleteById(id);
    }

    public static class WarehouseNotFoundException extends EntityNotFoundException {
        public WarehouseNotFoundException(String message) { super(message); }
    }

    public static class WarehouseAlreadyExistsException extends EntityAlreadyExistsException {
        public WarehouseAlreadyExistsException(String message) { super(message); }
    }
}

