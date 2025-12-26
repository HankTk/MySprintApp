package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.config.DataChangeNotification;
import com.edge.entity.Customer;
import com.edge.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CustomerService
{
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    private static final String DATA_TYPE_ID = "customers";
    
    public List<Customer> getAllCustomers()
    {
        return customerRepository.getAllCustomers();
    }
    
    public Optional<Customer> getCustomerById(String id)
    {
        return customerRepository.getCustomerById(id);
    }
    
    public Optional<Customer> getCustomerByEmail(String email)
    {
        return customerRepository.getCustomerByEmail(email);
    }
    
    public Optional<Customer> getCustomerByCustomerNumber(String customerNumber)
    {
        return customerRepository.getCustomerByCustomerNumber(customerNumber);
    }
    
    public Customer createCustomer(Customer customer)
    {
        Customer created = customerRepository.createCustomer(customer);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.CREATE, DATA_TYPE_ID, created);
        return created;
    }
    
    public Customer updateCustomer(String id, Customer customerDetails)
    {
        Customer updated = customerRepository.updateCustomer(id, customerDetails);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, updated);
        return updated;
    }
    
    public void deleteCustomer(String id)
    {
        Optional<Customer> customerToDelete = customerRepository.getCustomerById(id);
        customerRepository.deleteCustomer(id);
        if (customerToDelete.isPresent())
        {
            notificationService.notifyDataChange(DataChangeNotification.ChangeType.DELETE, DATA_TYPE_ID, customerToDelete.get());
        }
    }
}

