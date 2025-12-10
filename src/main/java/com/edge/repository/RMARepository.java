package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.RMA;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class RMARepository extends AbstractJsonRepository<RMA> {
    private static final Logger logger = LoggerFactory.getLogger(RMARepository.class);
    private static final String DATA_FILE_NAME = "rmas.json";
    private static final String DATA_DIR_NAME = "data";
    private static final String COUNTER_FILE_NAME = "rma_counter.json";
    private static final long INITIAL_RMA_NUMBER = 500000L;
    private java.nio.file.Path counterFilePath;

    public RMARepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "rmas");
        try {
            java.nio.file.Path dataDir = java.nio.file.Paths.get(DATA_DIR_NAME);
            if (!java.nio.file.Files.exists(dataDir)) {
                java.nio.file.Files.createDirectories(dataDir);
            }
            counterFilePath = dataDir.resolve(COUNTER_FILE_NAME);
        } catch (IOException e) {
            logger.error("Error initializing counter file path", e);
            throw new RuntimeException("Failed to initialize RMA counter", e);
        }
    }

    @Override
    protected ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty RMA list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<RMA>>() {});
            logger.info("Successfully loaded {} RMAs from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(RMA entity) {
        return entity.getId();
    }

    @Override
    protected void setId(RMA entity, String id) {
        entity.setId(id);
    }

    public Optional<RMA> getRMAById(String id) {
        return findById(id);
    }

    public Optional<RMA> getRMAByRMANumber(String rmaNumber) {
        if (rmaNumber == null || rmaNumber.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(rma -> rmaNumber.equals(rma.getRmaNumber())).findFirst();
    }

    public List<RMA> getAllRMAs() {
        return findAll();
    }

    public List<RMA> getRMAsByOrderId(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(rma -> orderId.equals(rma.getOrderId()))
            .collect(Collectors.toList());
    }

    public List<RMA> getRMAsByCustomerId(String customerId) {
        if (customerId == null || customerId.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(rma -> customerId.equals(rma.getCustomerId()))
            .collect(Collectors.toList());
    }

    public List<RMA> getRMAsByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(rma -> status.equals(rma.getStatus()))
            .collect(Collectors.toList());
    }

    public RMA createRMA(RMA rma) {
        if (rma == null) throw new IllegalArgumentException("RMA cannot be null");
        
        // Generate RMA number if not provided
        if (rma.getRmaNumber() == null || rma.getRmaNumber().trim().isEmpty()) {
            String newRMANumber = generateNextRMANumber();
            rma.setRmaNumber(newRMANumber);
            logger.info("Generated RMA number: {}", newRMANumber);
        } else if (getRMAByRMANumber(rma.getRmaNumber()).isPresent()) {
            throw new RMAAlreadyExistsException("RMA with number " + rma.getRmaNumber() + " already exists");
        }
        
        // Calculate totals before saving
        rma.calculateTotals();
        return save(rma);
    }
    
    private synchronized String generateNextRMANumber() {
        try {
            long currentCounter = readCounter();
            long nextRMANumber = currentCounter + 1;
            writeCounter(nextRMANumber);
            logger.info("Generated RMA number: {} (counter updated from {} to {})", 
                nextRMANumber, currentCounter, nextRMANumber);
            return String.valueOf(nextRMANumber);
        } catch (IOException e) {
            logger.error("Error generating RMA number", e);
            throw new RuntimeException("Failed to generate RMA number", e);
        }
    }
    
    private long readCounter() throws IOException {
        if (!java.nio.file.Files.exists(counterFilePath)) {
            long initialValue = INITIAL_RMA_NUMBER;
            writeCounter(initialValue);
            logger.info("Initialized RMA counter file with value: {}", initialValue);
            return initialValue;
        }
        
        try {
            String content = new String(java.nio.file.Files.readAllBytes(counterFilePath)).trim();
            if (content.isEmpty()) {
                long initialValue = INITIAL_RMA_NUMBER;
                writeCounter(initialValue);
                logger.info("Counter file was empty, initialized with value: {}", initialValue);
                return initialValue;
            }
            
            long counterValue = Long.parseLong(content);
            if (counterValue < INITIAL_RMA_NUMBER) {
                counterValue = INITIAL_RMA_NUMBER;
                writeCounter(counterValue);
                logger.info("Counter value was below initial value, reset to: {}", counterValue);
            }
            return counterValue;
        } catch (NumberFormatException e) {
            logger.warn("Counter file contains invalid data, resetting to initial value: {}", INITIAL_RMA_NUMBER);
            long initialValue = INITIAL_RMA_NUMBER;
            writeCounter(initialValue);
            return initialValue;
        }
    }
    
    private void writeCounter(long value) throws IOException {
        java.nio.file.Files.write(counterFilePath, String.valueOf(value).getBytes());
    }

    public RMA updateRMA(String id, RMA rmaDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("RMA ID cannot be null or empty");
        if (rmaDetails == null)
            throw new IllegalArgumentException("RMA details cannot be null");

        RMA existingRMA = findById(id).orElseThrow(() -> 
            new RMANotFoundException("RMA not found with id: " + id));
        
        logger.info("updateRMA called - ID: {}, incoming status: {}, existing status: {}", 
            id, rmaDetails.getStatus(), existingRMA.getStatus());

        if (rmaDetails.getRmaNumber() != null && !rmaDetails.getRmaNumber().trim().isEmpty()) {
            Optional<RMA> numberCheck = getRMAByRMANumber(rmaDetails.getRmaNumber());
            if (numberCheck.isPresent() && !id.equals(numberCheck.get().getId())) {
                throw new RMAAlreadyExistsException("RMA with number " + rmaDetails.getRmaNumber() + " already exists");
            }
        }

        // Update fields
        if (rmaDetails.getRmaNumber() != null) {
            existingRMA.setRmaNumber(rmaDetails.getRmaNumber());
        }
        if (rmaDetails.getOrderId() != null) {
            existingRMA.setOrderId(rmaDetails.getOrderId());
        }
        if (rmaDetails.getOrderNumber() != null) {
            existingRMA.setOrderNumber(rmaDetails.getOrderNumber());
        }
        if (rmaDetails.getCustomerId() != null) {
            existingRMA.setCustomerId(rmaDetails.getCustomerId());
        }
        if (rmaDetails.getCustomerName() != null) {
            existingRMA.setCustomerName(rmaDetails.getCustomerName());
        }
        if (rmaDetails.getRmaDate() != null) {
            existingRMA.setRmaDate(rmaDetails.getRmaDate());
        }
        if (rmaDetails.getReceivedDate() != null) {
            existingRMA.setReceivedDate(rmaDetails.getReceivedDate());
        }
        if (rmaDetails.getStatus() != null) {
            logger.info("Updating RMA status from '{}' to '{}' for RMA ID: {}", 
                existingRMA.getStatus(), rmaDetails.getStatus(), id);
            existingRMA.setStatus(rmaDetails.getStatus());
        }
        if (rmaDetails.getItems() != null) {
            existingRMA.setItems(rmaDetails.getItems());
        }
        if (rmaDetails.getTax() != null) {
            existingRMA.setTax(rmaDetails.getTax());
        }
        if (rmaDetails.getRestockingFee() != null) {
            existingRMA.setRestockingFee(rmaDetails.getRestockingFee());
        }
        if (rmaDetails.getNotes() != null) {
            existingRMA.setNotes(rmaDetails.getNotes());
        }
        if (rmaDetails.getJsonData() != null) {
            existingRMA.setJsonData(rmaDetails.getJsonData());
        }
        
        // Recalculate totals
        existingRMA.calculateTotals();
        
        saveItems();
        logger.info("Updated RMA with ID: {}, status: {}", id, existingRMA.getStatus());
        
        return existingRMA;
    }

    public void deleteRMA(String id) {
        deleteById(id);
    }

    public static class RMANotFoundException extends EntityNotFoundException {
        public RMANotFoundException(String message) { super(message); }
    }

    public static class RMAAlreadyExistsException extends EntityAlreadyExistsException {
        public RMAAlreadyExistsException(String message) { super(message); }
    }
}

