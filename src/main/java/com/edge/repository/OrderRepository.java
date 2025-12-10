package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Order;
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
public class OrderRepository extends AbstractJsonRepository<Order> {
    private static final Logger logger = LoggerFactory.getLogger(OrderRepository.class);
    private static final String DATA_FILE_NAME = "orders.json";
    private static final String DATA_DIR_NAME = "data";
    private static final String COUNTER_FILE_NAME = "order_counter.json";
    private static final String INVOICE_COUNTER_FILE_NAME = "invoice_counter.json";
    private static final long INITIAL_ORDER_NUMBER = 100000L;
    private static final long INITIAL_INVOICE_NUMBER = 200000L;
    private java.nio.file.Path counterFilePath;
    private java.nio.file.Path invoiceCounterFilePath;

    public OrderRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "orders");
        try {
            java.nio.file.Path dataDir = java.nio.file.Paths.get(DATA_DIR_NAME);
            if (!java.nio.file.Files.exists(dataDir)) {
                java.nio.file.Files.createDirectories(dataDir);
            }
            counterFilePath = dataDir.resolve(COUNTER_FILE_NAME);
            invoiceCounterFilePath = dataDir.resolve(INVOICE_COUNTER_FILE_NAME);
        } catch (IOException e) {
            logger.error("Error initializing counter file path", e);
            throw new RuntimeException("Failed to initialize order counter", e);
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
            logger.info("Data file is empty, starting with empty order list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Order>>() {});
            logger.info("Successfully loaded {} orders from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Order entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Order entity, String id) {
        entity.setId(id);
    }

    public Optional<Order> getOrderById(String id) {
        return findById(id);
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        if (orderNumber == null || orderNumber.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(order -> orderNumber.equals(order.getOrderNumber())).findFirst();
    }

    public List<Order> getAllOrders() {
        return findAll();
    }

    public List<Order> getOrdersByCustomerId(String customerId) {
        if (customerId == null || customerId.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(order -> customerId.equals(order.getCustomerId()))
            .collect(Collectors.toList());
    }

    public List<Order> getOrdersByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return items.stream()
            .filter(order -> status.equals(order.getStatus()))
            .collect(Collectors.toList());
    }

    public Order createOrder(Order order) {
        if (order == null) throw new IllegalArgumentException("Order cannot be null");
        
        // Generate order number if not provided
        if (order.getOrderNumber() == null || order.getOrderNumber().trim().isEmpty()) {
            String newOrderNumber = generateNextOrderNumber();
            order.setOrderNumber(newOrderNumber);
            logger.info("Generated order number: {}", newOrderNumber);
        } else if (getOrderByOrderNumber(order.getOrderNumber()).isPresent()) {
            throw new OrderAlreadyExistsException("Order with number " + order.getOrderNumber() + " already exists");
        }
        
        // Calculate totals before saving
        order.calculateTotals();
        return save(order);
    }
    
    private synchronized String generateNextOrderNumber() {
        try {
            // Read current counter value from file
            long currentCounter = readCounter();
            
            // Increment the counter
            long nextOrderNumber = currentCounter + 1;
            
            // Update counter file with the new value
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
        // If counter file doesn't exist, initialize it with the initial value
        if (!java.nio.file.Files.exists(counterFilePath)) {
            long initialValue = INITIAL_ORDER_NUMBER;
            writeCounter(initialValue);
            logger.info("Initialized order counter file with value: {}", initialValue);
            return initialValue;
        }
        
        // Read the counter value from file
        try {
            String content = new String(java.nio.file.Files.readAllBytes(counterFilePath)).trim();
            if (content.isEmpty()) {
                // File exists but is empty, initialize with initial value
                long initialValue = INITIAL_ORDER_NUMBER;
                writeCounter(initialValue);
                logger.info("Counter file was empty, initialized with value: {}", initialValue);
                return initialValue;
            }
            
            long counterValue = Long.parseLong(content);
            // Ensure counter is at least INITIAL_ORDER_NUMBER
            if (counterValue < INITIAL_ORDER_NUMBER) {
                counterValue = INITIAL_ORDER_NUMBER;
                writeCounter(counterValue);
                logger.info("Counter value was below initial value, reset to: {}", counterValue);
            }
            return counterValue;
        } catch (NumberFormatException e) {
            // File contains invalid data, reset to initial value
            logger.warn("Counter file contains invalid data, resetting to initial value: {}", INITIAL_ORDER_NUMBER);
            long initialValue = INITIAL_ORDER_NUMBER;
            writeCounter(initialValue);
            return initialValue;
        }
    }
    
    private void writeCounter(long value) throws IOException {
        java.nio.file.Files.write(counterFilePath, String.valueOf(value).getBytes());
    }
    
    public synchronized String generateNextInvoiceNumber() {
        try {
            // Read current invoice counter value from file
            long currentCounter = readInvoiceCounter();
            
            // Increment the counter
            long nextInvoiceNumber = currentCounter + 1;
            
            // Update counter file with the new value
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
        // If counter file doesn't exist, initialize it with the initial value
        if (!java.nio.file.Files.exists(invoiceCounterFilePath)) {
            long initialValue = INITIAL_INVOICE_NUMBER;
            writeInvoiceCounter(initialValue);
            logger.info("Initialized invoice counter file with value: {}", initialValue);
            return initialValue;
        }
        
        // Read the counter value from file
        try {
            String content = new String(java.nio.file.Files.readAllBytes(invoiceCounterFilePath)).trim();
            if (content.isEmpty()) {
                // File exists but is empty, initialize with initial value
                long initialValue = INITIAL_INVOICE_NUMBER;
                writeInvoiceCounter(initialValue);
                logger.info("Invoice counter file was empty, initialized with value: {}", initialValue);
                return initialValue;
            }
            
            long counterValue = Long.parseLong(content);
            // Ensure counter is at least INITIAL_INVOICE_NUMBER
            if (counterValue < INITIAL_INVOICE_NUMBER) {
                counterValue = INITIAL_INVOICE_NUMBER;
                writeInvoiceCounter(counterValue);
                logger.info("Invoice counter value was below initial value, reset to: {}", counterValue);
            }
            return counterValue;
        } catch (NumberFormatException e) {
            // File contains invalid data, reset to initial value
            logger.warn("Invoice counter file contains invalid data, resetting to initial value: {}", INITIAL_INVOICE_NUMBER);
            long initialValue = INITIAL_INVOICE_NUMBER;
            writeInvoiceCounter(initialValue);
            return initialValue;
        }
    }
    
    private void writeInvoiceCounter(long value) throws IOException {
        java.nio.file.Files.write(invoiceCounterFilePath, String.valueOf(value).getBytes());
    }

    public Order updateOrder(String id, Order orderDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Order ID cannot be null or empty");
        if (orderDetails == null)
            throw new IllegalArgumentException("Order details cannot be null");

        Order existingOrder = findById(id).orElseThrow(() -> 
            new OrderNotFoundException("Order not found with id: " + id));
        
        logger.info("updateOrder called - ID: {}, incoming status: {}, existing status: {}", 
            id, orderDetails.getStatus(), existingOrder.getStatus());
        logger.info("Full orderDetails object: {}", orderDetails);

        if (orderDetails.getOrderNumber() != null && !orderDetails.getOrderNumber().trim().isEmpty()) {
            Optional<Order> numberCheck = getOrderByOrderNumber(orderDetails.getOrderNumber());
            if (numberCheck.isPresent() && !id.equals(numberCheck.get().getId())) {
                throw new OrderAlreadyExistsException("Order with number " + orderDetails.getOrderNumber() + " already exists");
            }
        }

        // Update fields
        if (orderDetails.getOrderNumber() != null) {
            existingOrder.setOrderNumber(orderDetails.getOrderNumber());
        }
        if (orderDetails.getCustomerId() != null) {
            existingOrder.setCustomerId(orderDetails.getCustomerId());
        }
        if (orderDetails.getShippingAddressId() != null) {
            existingOrder.setShippingAddressId(orderDetails.getShippingAddressId());
        }
        if (orderDetails.getBillingAddressId() != null) {
            existingOrder.setBillingAddressId(orderDetails.getBillingAddressId());
        }
        if (orderDetails.getOrderDate() != null) {
            existingOrder.setOrderDate(orderDetails.getOrderDate());
        }
        if (orderDetails.getShipDate() != null) {
            existingOrder.setShipDate(orderDetails.getShipDate());
        }
        // Always update status if provided (even if it's the same value)
        String incomingStatus = orderDetails.getStatus();
        if (incomingStatus != null) {
            logger.info("Updating order status from '{}' to '{}' for order ID: {}", 
                existingOrder.getStatus(), incomingStatus, id);
            existingOrder.setStatus(incomingStatus);
            logger.info("Status updated successfully. Current status: {}", existingOrder.getStatus());
        } else {
            logger.warn("Status is null in orderDetails for order ID: {}", id);
        }
        if (orderDetails.getItems() != null) {
            existingOrder.setItems(orderDetails.getItems());
        }
        if (orderDetails.getTax() != null) {
            existingOrder.setTax(orderDetails.getTax());
        }
        if (orderDetails.getShippingCost() != null) {
            existingOrder.setShippingCost(orderDetails.getShippingCost());
        }
        if (orderDetails.getNotes() != null) {
            existingOrder.setNotes(orderDetails.getNotes());
        }
        if (orderDetails.getInvoiceNumber() != null) {
            existingOrder.setInvoiceNumber(orderDetails.getInvoiceNumber());
        }
        if (orderDetails.getInvoiceDate() != null) {
            existingOrder.setInvoiceDate(orderDetails.getInvoiceDate());
        }
        if (orderDetails.getJsonData() != null) {
            existingOrder.setJsonData(orderDetails.getJsonData());
        }
        
        // Recalculate totals
        existingOrder.calculateTotals();
        
        saveItems();
        logger.info("Updated order with ID: {}, status: {}", id, existingOrder.getStatus());
        
        // Note: WebSocket broadcast will be handled by OrderService to avoid circular dependency
        return existingOrder;
    }

    public void deleteOrder(String id) {
        deleteById(id);
    }

    public static class OrderNotFoundException extends EntityNotFoundException {
        public OrderNotFoundException(String message) { super(message); }
    }

    public static class OrderAlreadyExistsException extends EntityAlreadyExistsException {
        public OrderAlreadyExistsException(String message) { super(message); }
    }
}

