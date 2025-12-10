package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.PurchaseOrder;
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
public class PurchaseOrderRepository extends AbstractJsonRepository<PurchaseOrder> {
    private static final Logger logger = LoggerFactory.getLogger(PurchaseOrderRepository.class);
    private static final String DATA_FILE_NAME = "purchase_orders.json";
    private static final String DATA_DIR_NAME = "data";
    private static final String COUNTER_FILE_NAME = "po_counter.json";
    private static final String INVOICE_COUNTER_FILE_NAME = "po_invoice_counter.json";
    private static final long INITIAL_PO_NUMBER = 300000L;
    private static final long INITIAL_PO_INVOICE_NUMBER = 400000L;
    private java.nio.file.Path counterFilePath;
    private java.nio.file.Path invoiceCounterFilePath;

    public PurchaseOrderRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "purchase orders");
        try {
            java.nio.file.Path dataDir = java.nio.file.Paths.get(DATA_DIR_NAME);
            if (!java.nio.file.Files.exists(dataDir)) {
                java.nio.file.Files.createDirectories(dataDir);
            }
            counterFilePath = dataDir.resolve(COUNTER_FILE_NAME);
            invoiceCounterFilePath = dataDir.resolve(INVOICE_COUNTER_FILE_NAME);
        } catch (IOException e) {
            logger.error("Error initializing counter file path", e);
            throw new RuntimeException("Failed to initialize purchase order counter", e);
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
            logger.info("Data file is empty, starting with empty purchase order list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<PurchaseOrder>>() {});
            logger.info("Successfully loaded {} purchase orders from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(PurchaseOrder entity) {
        return entity.getId();
    }

    @Override
    protected void setId(PurchaseOrder entity, String id) {
        entity.setId(id);
    }

    public Optional<PurchaseOrder> getPurchaseOrderById(String id) {
        return findById(id);
    }

    public Optional<PurchaseOrder> getPurchaseOrderByOrderNumber(String orderNumber) {
        if (orderNumber == null || orderNumber.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(po -> orderNumber.equals(po.getOrderNumber())).findFirst();
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return findAll();
    }

    public List<PurchaseOrder> getPurchaseOrdersBySupplierId(String supplierId) {
        if (supplierId == null || supplierId.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(po -> supplierId.equals(po.getSupplierId()))
            .collect(Collectors.toList());
    }

    public List<PurchaseOrder> getPurchaseOrdersByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(po -> status.equals(po.getStatus()))
            .collect(Collectors.toList());
    }

    public PurchaseOrder createPurchaseOrder(PurchaseOrder po) {
        if (po == null) throw new IllegalArgumentException("Purchase Order cannot be null");
        
        // Generate order number if not provided
        if (po.getOrderNumber() == null || po.getOrderNumber().trim().isEmpty()) {
            String newOrderNumber = generateNextOrderNumber();
            po.setOrderNumber(newOrderNumber);
            logger.info("Generated order number: {}", newOrderNumber);
        } else if (getPurchaseOrderByOrderNumber(po.getOrderNumber()).isPresent()) {
            throw new PurchaseOrderAlreadyExistsException("Purchase Order with number " + po.getOrderNumber() + " already exists");
        }
        
        // Calculate totals before saving
        po.calculateTotals();
        return save(po);
    }
    
    private synchronized String generateNextOrderNumber() {
        try {
            long currentCounter = readCounter();
            long nextOrderNumber = currentCounter + 1;
            writeCounter(nextOrderNumber);
            logger.info("Generated order number: {} (counter updated from {} to {})", 
                nextOrderNumber, currentCounter, nextOrderNumber);
            return String.valueOf(nextOrderNumber);
        } catch (IOException e) {
            logger.error("Error generating order number", e);
            throw new RuntimeException("Failed to generate order number", e);
        }
    }
    
    private long readCounter() throws IOException {
        if (!java.nio.file.Files.exists(counterFilePath)) {
            long initialValue = INITIAL_PO_NUMBER;
            writeCounter(initialValue);
            logger.info("Initialized purchase order counter file with value: {}", initialValue);
            return initialValue;
        }
        
        try {
            String content = new String(java.nio.file.Files.readAllBytes(counterFilePath)).trim();
            if (content.isEmpty()) {
                long initialValue = INITIAL_PO_NUMBER;
                writeCounter(initialValue);
                logger.info("Counter file was empty, initialized with value: {}", initialValue);
                return initialValue;
            }
            
            long counterValue = Long.parseLong(content);
            if (counterValue < INITIAL_PO_NUMBER) {
                counterValue = INITIAL_PO_NUMBER;
                writeCounter(counterValue);
                logger.info("Counter value was below initial value, reset to: {}", counterValue);
            }
            return counterValue;
        } catch (NumberFormatException e) {
            logger.warn("Counter file contains invalid data, resetting to initial value: {}", INITIAL_PO_NUMBER);
            long initialValue = INITIAL_PO_NUMBER;
            writeCounter(initialValue);
            return initialValue;
        }
    }
    
    private void writeCounter(long value) throws IOException {
        java.nio.file.Files.write(counterFilePath, String.valueOf(value).getBytes());
    }
    
    public synchronized String generateNextInvoiceNumber() {
        try {
            long currentCounter = readInvoiceCounter();
            long nextInvoiceNumber = currentCounter + 1;
            writeInvoiceCounter(nextInvoiceNumber);
            logger.info("Generated invoice number: {} (counter updated from {} to {})", 
                nextInvoiceNumber, currentCounter, nextInvoiceNumber);
            return String.valueOf(nextInvoiceNumber);
        } catch (IOException e) {
            logger.error("Error generating invoice number", e);
            throw new RuntimeException("Failed to generate invoice number", e);
        }
    }
    
    private long readInvoiceCounter() throws IOException {
        if (!java.nio.file.Files.exists(invoiceCounterFilePath)) {
            long initialValue = INITIAL_PO_INVOICE_NUMBER;
            writeInvoiceCounter(initialValue);
            logger.info("Initialized purchase order invoice counter file with value: {}", initialValue);
            return initialValue;
        }
        
        try {
            String content = new String(java.nio.file.Files.readAllBytes(invoiceCounterFilePath)).trim();
            if (content.isEmpty()) {
                long initialValue = INITIAL_PO_INVOICE_NUMBER;
                writeInvoiceCounter(initialValue);
                logger.info("Invoice counter file was empty, initialized with value: {}", initialValue);
                return initialValue;
            }
            
            long counterValue = Long.parseLong(content);
            if (counterValue < INITIAL_PO_INVOICE_NUMBER) {
                counterValue = INITIAL_PO_INVOICE_NUMBER;
                writeInvoiceCounter(counterValue);
                logger.info("Invoice counter value was below initial value, reset to: {}", counterValue);
            }
            return counterValue;
        } catch (NumberFormatException e) {
            logger.warn("Invoice counter file contains invalid data, resetting to initial value: {}", INITIAL_PO_INVOICE_NUMBER);
            long initialValue = INITIAL_PO_INVOICE_NUMBER;
            writeInvoiceCounter(initialValue);
            return initialValue;
        }
    }
    
    private void writeInvoiceCounter(long value) throws IOException {
        java.nio.file.Files.write(invoiceCounterFilePath, String.valueOf(value).getBytes());
    }

    public PurchaseOrder updatePurchaseOrder(String id, PurchaseOrder poDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Purchase Order ID cannot be null or empty");
        if (poDetails == null)
            throw new IllegalArgumentException("Purchase Order details cannot be null");

        PurchaseOrder existingPO = findById(id).orElseThrow(() -> 
            new PurchaseOrderNotFoundException("Purchase Order not found with id: " + id));
        
        logger.info("updatePurchaseOrder called - ID: {}, incoming status: {}, existing status: {}", 
            id, poDetails.getStatus(), existingPO.getStatus());

        if (poDetails.getOrderNumber() != null && !poDetails.getOrderNumber().trim().isEmpty()) {
            Optional<PurchaseOrder> numberCheck = getPurchaseOrderByOrderNumber(poDetails.getOrderNumber());
            if (numberCheck.isPresent() && !id.equals(numberCheck.get().getId())) {
                throw new PurchaseOrderAlreadyExistsException("Purchase Order with number " + poDetails.getOrderNumber() + " already exists");
            }
        }

        // Update fields
        if (poDetails.getOrderNumber() != null) {
            existingPO.setOrderNumber(poDetails.getOrderNumber());
        }
        if (poDetails.getSupplierId() != null) {
            existingPO.setSupplierId(poDetails.getSupplierId());
        }
        if (poDetails.getShippingAddressId() != null) {
            existingPO.setShippingAddressId(poDetails.getShippingAddressId());
        }
        if (poDetails.getBillingAddressId() != null) {
            existingPO.setBillingAddressId(poDetails.getBillingAddressId());
        }
        if (poDetails.getOrderDate() != null) {
            existingPO.setOrderDate(poDetails.getOrderDate());
        }
        if (poDetails.getExpectedDeliveryDate() != null) {
            existingPO.setExpectedDeliveryDate(poDetails.getExpectedDeliveryDate());
        }
        if (poDetails.getStatus() != null) {
            logger.info("Updating purchase order status from '{}' to '{}' for PO ID: {}", 
                existingPO.getStatus(), poDetails.getStatus(), id);
            existingPO.setStatus(poDetails.getStatus());
        }
        if (poDetails.getItems() != null) {
            existingPO.setItems(poDetails.getItems());
        }
        if (poDetails.getTax() != null) {
            existingPO.setTax(poDetails.getTax());
        }
        if (poDetails.getShippingCost() != null) {
            existingPO.setShippingCost(poDetails.getShippingCost());
        }
        if (poDetails.getNotes() != null) {
            existingPO.setNotes(poDetails.getNotes());
        }
        if (poDetails.getInvoiceNumber() != null) {
            existingPO.setInvoiceNumber(poDetails.getInvoiceNumber());
        }
        if (poDetails.getInvoiceDate() != null) {
            existingPO.setInvoiceDate(poDetails.getInvoiceDate());
        }
        if (poDetails.getJsonData() != null) {
            existingPO.setJsonData(poDetails.getJsonData());
        }
        
        // Recalculate totals
        existingPO.calculateTotals();
        
        saveItems();
        logger.info("Updated purchase order with ID: {}, status: {}", id, existingPO.getStatus());
        
        return existingPO;
    }

    public void deletePurchaseOrder(String id) {
        deleteById(id);
    }

    public static class PurchaseOrderNotFoundException extends EntityNotFoundException {
        public PurchaseOrderNotFoundException(String message) { super(message); }
    }

    public static class PurchaseOrderAlreadyExistsException extends EntityAlreadyExistsException {
        public PurchaseOrderAlreadyExistsException(String message) { super(message); }
    }
}

