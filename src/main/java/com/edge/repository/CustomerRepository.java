package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Customer;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class CustomerRepository extends AbstractJsonRepository<Customer> {
    private static final Logger logger = LoggerFactory.getLogger(CustomerRepository.class);
    private static final String DATA_FILE_NAME = "customers.json";
    private static final String DATA_DIR_NAME = "data";

    public CustomerRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "customers");
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty customer list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Customer>>() {});
            logger.info("Successfully loaded {} customers from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Customer entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Customer entity, String id) {
        entity.setId(id);
    }

    public Optional<Customer> getCustomerByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(customer -> email.equals(customer.getEmail())).findFirst();
    }

    public Optional<Customer> getCustomerByCustomerNumber(String customerNumber) {
        if (customerNumber == null || customerNumber.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(customer -> customerNumber.equals(customer.getCustomerNumber())).findFirst();
    }

    public Optional<Customer> getCustomerById(String id) {
        return findById(id);
    }

    public List<Customer> getAllCustomers() {
        return findAll();
    }

    public Customer createCustomer(Customer customer) {
        if (customer == null) throw new IllegalArgumentException("Customer cannot be null");
        if (customer.getEmail() != null && !customer.getEmail().trim().isEmpty() && 
            getCustomerByEmail(customer.getEmail()).isPresent()) {
            throw new CustomerAlreadyExistsException("Customer with email " + customer.getEmail() + " already exists");
        }
        if (customer.getCustomerNumber() != null && !customer.getCustomerNumber().trim().isEmpty() && 
            getCustomerByCustomerNumber(customer.getCustomerNumber()).isPresent()) {
            throw new CustomerAlreadyExistsException("Customer with customer number " + customer.getCustomerNumber() + " already exists");
        }
        return save(customer);
    }

    public Customer updateCustomer(String id, Customer customerDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Customer ID cannot be null or empty");
        if (customerDetails == null)
            throw new IllegalArgumentException("Customer details cannot be null");

        Customer existingCustomer = findById(id).orElseThrow(() -> 
            new CustomerNotFoundException("Customer not found with id: " + id));
        
        if (customerDetails.getEmail() != null && !customerDetails.getEmail().trim().isEmpty()) {
            Optional<Customer> emailCheck = getCustomerByEmail(customerDetails.getEmail());
            if (emailCheck.isPresent() && !id.equals(emailCheck.get().getId())) {
                throw new CustomerAlreadyExistsException("Customer with email " + customerDetails.getEmail() + " already exists");
            }
        }

        // Update fields
        existingCustomer.setCustomerNumber(customerDetails.getCustomerNumber());
        existingCustomer.setCompanyName(customerDetails.getCompanyName());
        existingCustomer.setFirstName(customerDetails.getFirstName());
        existingCustomer.setLastName(customerDetails.getLastName());
        existingCustomer.setEmail(customerDetails.getEmail());
        existingCustomer.setPhone(customerDetails.getPhone());
        
        // Update jsonData, preserving addressIds if not provided
        if (customerDetails.getJsonData() != null) {
            java.util.Map<String, Object> newJsonData = new java.util.HashMap<>(customerDetails.getJsonData());
            // If addressIds is in the new jsonData, use it; otherwise preserve existing
            if (!newJsonData.containsKey("addressIds") && existingCustomer.getJsonData() != null && 
                existingCustomer.getJsonData().containsKey("addressIds")) {
                newJsonData.put("addressIds", existingCustomer.getJsonData().get("addressIds"));
            }
            existingCustomer.setJsonData(new java.util.HashMap<>(newJsonData));
        } else if (existingCustomer.getJsonData() != null && existingCustomer.getJsonData().containsKey("addressIds")) {
            // Preserve existing addressIds if jsonData is null in update
            java.util.Map<String, Object> jsonData = new java.util.HashMap<>();
            jsonData.put("addressIds", existingCustomer.getJsonData().get("addressIds"));
            existingCustomer.setJsonData(jsonData);
        } else {
            existingCustomer.setJsonData(customerDetails.getJsonData());
        }
        
        saveItems();
        logger.info("Updated customer with ID: {}", id);
        return existingCustomer;
    }

    public void deleteCustomer(String id) {
        deleteById(id);
    }

    public static class CustomerNotFoundException extends EntityNotFoundException {
        public CustomerNotFoundException(String message) { super(message); }
    }

    public static class CustomerAlreadyExistsException extends EntityAlreadyExistsException {
        public CustomerAlreadyExistsException(String message) { super(message); }
    }
}

