package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Customer;
import com.edge.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<Customer> getAllCustomers() {
        return customerRepository.getAllCustomers();
    }
    
    public Optional<Customer> getCustomerById(String id) {
        return customerRepository.getCustomerById(id);
    }
    
    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepository.getCustomerByEmail(email);
    }
    
    public Optional<Customer> getCustomerByCustomerNumber(String customerNumber) {
        return customerRepository.getCustomerByCustomerNumber(customerNumber);
    }
    
    public Customer createCustomer(Customer customer) {
        Customer created = customerRepository.createCustomer(customer);
        if (webSocketService != null) {
            webSocketService.broadcastCustomerUpdate(created);
        }
        return created;
    }
    
    public Customer updateCustomer(String id, Customer customerDetails) {
        Customer updated = customerRepository.updateCustomer(id, customerDetails);
        if (webSocketService != null) {
            webSocketService.broadcastCustomerUpdate(updated);
        }
        return updated;
    }
    
    public void deleteCustomer(String id) {
        customerRepository.deleteCustomer(id);
        if (webSocketService != null) {
            webSocketService.broadcastCustomerDelete(id);
        }
    }
}

