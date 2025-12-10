package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.SFC;
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
public class SFCRepository extends AbstractJsonRepository<SFC> {
    private static final Logger logger = LoggerFactory.getLogger(SFCRepository.class);
    private static final String DATA_FILE_NAME = "sfcs.json";
    private static final String DATA_DIR_NAME = "data";
    private static final String COUNTER_FILE_NAME = "sfc_counter.json";
    private static final long INITIAL_SFC_NUMBER = 600000L;
    private java.nio.file.Path counterFilePath;

    public SFCRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "sfcs");
        try {
            java.nio.file.Path dataDir = java.nio.file.Paths.get(DATA_DIR_NAME);
            if (!java.nio.file.Files.exists(dataDir)) {
                java.nio.file.Files.createDirectories(dataDir);
            }
            counterFilePath = dataDir.resolve(COUNTER_FILE_NAME);
        } catch (IOException e) {
            logger.error("Error initializing counter file path", e);
            throw new RuntimeException("Failed to initialize SFC counter", e);
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
            logger.info("Data file is empty, starting with empty SFC list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<SFC>>() {});
            logger.info("Successfully loaded {} SFCs from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(SFC entity) {
        return entity.getId();
    }

    @Override
    protected void setId(SFC entity, String id) {
        entity.setId(id);
    }

    public Optional<SFC> getSFCById(String id) {
        return findById(id);
    }

    public Optional<SFC> getSFCBySFCNumber(String sfcNumber) {
        if (sfcNumber == null || sfcNumber.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(sfc -> sfcNumber.equals(sfc.getSfcNumber())).findFirst();
    }

    public List<SFC> getAllSFCs() {
        return findAll();
    }

    public List<SFC> getSFCsByRMAId(String rmaId) {
        if (rmaId == null || rmaId.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(sfc -> rmaId.equals(sfc.getRmaId()))
            .collect(Collectors.toList());
    }

    public List<SFC> getSFCsByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(sfc -> status.equals(sfc.getStatus()))
            .collect(Collectors.toList());
    }

    public SFC createSFC(SFC sfc) {
        if (sfc == null) throw new IllegalArgumentException("SFC cannot be null");
        
        // Generate SFC number if not provided
        if (sfc.getSfcNumber() == null || sfc.getSfcNumber().trim().isEmpty()) {
            String newSFCNumber = generateNextSFCNumber();
            sfc.setSfcNumber(newSFCNumber);
            logger.info("Generated SFC number: {}", newSFCNumber);
        } else if (getSFCBySFCNumber(sfc.getSfcNumber()).isPresent()) {
            throw new SFCAlreadyExistsException("SFC with number " + sfc.getSfcNumber() + " already exists");
        }
        
        return save(sfc);
    }
    
    private synchronized String generateNextSFCNumber() {
        try {
            long currentCounter = readCounter();
            long nextSFCNumber = currentCounter + 1;
            writeCounter(nextSFCNumber);
            logger.info("Generated SFC number: {} (counter updated from {} to {})", 
                nextSFCNumber, currentCounter, nextSFCNumber);
            return String.valueOf(nextSFCNumber);
        } catch (IOException e) {
            logger.error("Error generating SFC number", e);
            throw new RuntimeException("Failed to generate SFC number", e);
        }
    }
    
    private long readCounter() throws IOException {
        if (!java.nio.file.Files.exists(counterFilePath)) {
            long initialValue = INITIAL_SFC_NUMBER;
            writeCounter(initialValue);
            logger.info("Initialized SFC counter file with value: {}", initialValue);
            return initialValue;
        }
        
        try {
            String content = new String(java.nio.file.Files.readAllBytes(counterFilePath)).trim();
            if (content.isEmpty()) {
                long initialValue = INITIAL_SFC_NUMBER;
                writeCounter(initialValue);
                logger.info("Counter file was empty, initialized with value: {}", initialValue);
                return initialValue;
            }
            
            long counterValue = Long.parseLong(content);
            if (counterValue < INITIAL_SFC_NUMBER) {
                counterValue = INITIAL_SFC_NUMBER;
                writeCounter(counterValue);
                logger.info("Counter value was below initial value, reset to: {}", counterValue);
            }
            return counterValue;
        } catch (NumberFormatException e) {
            logger.warn("Counter file contains invalid data, resetting to initial value: {}", INITIAL_SFC_NUMBER);
            long initialValue = INITIAL_SFC_NUMBER;
            writeCounter(initialValue);
            return initialValue;
        }
    }
    
    private void writeCounter(long value) throws IOException {
        java.nio.file.Files.write(counterFilePath, String.valueOf(value).getBytes());
    }

    public SFC updateSFC(String id, SFC sfcDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("SFC ID cannot be null or empty");
        if (sfcDetails == null)
            throw new IllegalArgumentException("SFC details cannot be null");

        SFC existingSFC = findById(id).orElseThrow(() -> 
            new SFCNotFoundException("SFC not found with id: " + id));

        if (sfcDetails.getSfcNumber() != null && !sfcDetails.getSfcNumber().trim().isEmpty()) {
            Optional<SFC> numberCheck = getSFCBySFCNumber(sfcDetails.getSfcNumber());
            if (numberCheck.isPresent() && !id.equals(numberCheck.get().getId())) {
                throw new SFCAlreadyExistsException("SFC with number " + sfcDetails.getSfcNumber() + " already exists");
            }
        }

        // Update fields
        if (sfcDetails.getSfcNumber() != null) {
            existingSFC.setSfcNumber(sfcDetails.getSfcNumber());
        }
        if (sfcDetails.getRmaId() != null) {
            existingSFC.setRmaId(sfcDetails.getRmaId());
        }
        if (sfcDetails.getRmaNumber() != null) {
            existingSFC.setRmaNumber(sfcDetails.getRmaNumber());
        }
        if (sfcDetails.getOrderId() != null) {
            existingSFC.setOrderId(sfcDetails.getOrderId());
        }
        if (sfcDetails.getOrderNumber() != null) {
            existingSFC.setOrderNumber(sfcDetails.getOrderNumber());
        }
        if (sfcDetails.getCustomerId() != null) {
            existingSFC.setCustomerId(sfcDetails.getCustomerId());
        }
        if (sfcDetails.getCustomerName() != null) {
            existingSFC.setCustomerName(sfcDetails.getCustomerName());
        }
        if (sfcDetails.getStartedDate() != null) {
            existingSFC.setStartedDate(sfcDetails.getStartedDate());
        }
        if (sfcDetails.getCompletedDate() != null) {
            existingSFC.setCompletedDate(sfcDetails.getCompletedDate());
        }
        if (sfcDetails.getStatus() != null) {
            existingSFC.setStatus(sfcDetails.getStatus());
        }
        if (sfcDetails.getAssignedTo() != null) {
            existingSFC.setAssignedTo(sfcDetails.getAssignedTo());
        }
        if (sfcDetails.getNotes() != null) {
            existingSFC.setNotes(sfcDetails.getNotes());
        }
        if (sfcDetails.getJsonData() != null) {
            existingSFC.setJsonData(sfcDetails.getJsonData());
        }
        
        saveItems();
        logger.info("Updated SFC with ID: {}, status: {}", id, existingSFC.getStatus());
        
        return existingSFC;
    }

    public void deleteSFC(String id) {
        deleteById(id);
    }

    public static class SFCNotFoundException extends EntityNotFoundException {
        public SFCNotFoundException(String message) { super(message); }
    }

    public static class SFCAlreadyExistsException extends EntityAlreadyExistsException {
        public SFCAlreadyExistsException(String message) { super(message); }
    }
}

