package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.config.DataChangeNotification;
import com.edge.entity.Address;
import com.edge.entity.Customer;
import com.edge.entity.Vendor;
import com.edge.repository.AddressRepository;
import com.edge.repository.CustomerRepository;
import com.edge.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class AddressService {
    
    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private VendorRepository vendorRepository;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    private static final String DATA_TYPE_ID = "addresses";
    
    public List<Address> getAllAddresses() {
        return addressRepository.getAllAddresses();
    }
    
    public Optional<Address> getAddressById(String id) {
        return addressRepository.getAddressById(id);
    }
    
    public List<Address> getAddressesByCustomerId(String customerId) {
        if (customerId == null || customerId.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        // Get customer to retrieve addressIds
        Optional<Customer> customerOpt = customerRepository.getCustomerById(customerId);
        if (!customerOpt.isPresent()) {
            return java.util.Collections.emptyList();
        }
        
        Customer customer = customerOpt.get();
        List<String> addressIds = null;
        
        // Get addressIds from customer's jsonData
        if (customer.getJsonData() != null && customer.getJsonData().containsKey("addressIds")) {
            Object addressIdsObj = customer.getJsonData().get("addressIds");
            if (addressIdsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> ids = (List<String>) addressIdsObj;
                addressIds = ids;
            }
        }
        
        if (addressIds == null || addressIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        // Create a final copy for use in lambda
        final List<String> finalAddressIds = new java.util.ArrayList<>(addressIds);
        
        // Get all addresses and filter by IDs
        List<Address> allAddresses = addressRepository.getAllAddresses();
        return allAddresses.stream()
            .filter(address -> address.getId() != null && finalAddressIds.contains(address.getId()))
            .collect(Collectors.toList());
    }
    
    public List<Address> getAddressesByCustomerIdAndType(String customerId, String addressType) {
        // Get addresses by customer ID first
        List<Address> addresses = getAddressesByCustomerId(customerId);
        
        // Filter by address type if specified
        if (addressType == null || addressType.trim().isEmpty()) {
            return addresses;
        }
        
        return addresses.stream()
            .filter(address -> addressType.equals(address.getAddressType()))
            .collect(Collectors.toList());
    }
    
    public List<Address> getAddressesByVendorId(String vendorId) {
        if (vendorId == null || vendorId.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        // Get vendor to retrieve addressIds
        Optional<Vendor> vendorOpt = vendorRepository.getVendorById(vendorId);
        if (!vendorOpt.isPresent()) {
            return java.util.Collections.emptyList();
        }
        
        Vendor vendor = vendorOpt.get();
        List<String> addressIds = null;
        
        // Get addressIds from vendor's jsonData
        if (vendor.getJsonData() != null && vendor.getJsonData().containsKey("addressIds")) {
            Object addressIdsObj = vendor.getJsonData().get("addressIds");
            if (addressIdsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> ids = (List<String>) addressIdsObj;
                addressIds = ids;
            }
        }
        
        if (addressIds == null || addressIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        // Create a final copy for use in lambda
        final List<String> finalAddressIds = new java.util.ArrayList<>(addressIds);
        
        // Get all addresses and filter by IDs
        List<Address> allAddresses = addressRepository.getAllAddresses();
        return allAddresses.stream()
            .filter(address -> address.getId() != null && finalAddressIds.contains(address.getId()))
            .collect(Collectors.toList());
    }
    
    public Address createAddress(Address address) {
        Address created = addressRepository.createAddress(address);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.CREATE, DATA_TYPE_ID, created);
        return created;
    }
    
    public Address updateAddress(String id, Address addressDetails) {
        Address updated = addressRepository.updateAddress(id, addressDetails);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, updated);
        return updated;
    }
    
    public void deleteAddress(String id) {
        // Remove this address ID from all customers that reference it
        List<Customer> allCustomers = customerRepository.getAllCustomers();
        for (Customer customer : allCustomers) {
            List<String> addressIds = null;
            if (customer.getJsonData() != null && customer.getJsonData().containsKey("addressIds")) {
                Object addressIdsObj = customer.getJsonData().get("addressIds");
                if (addressIdsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> ids = (List<String>) addressIdsObj;
                    addressIds = new java.util.ArrayList<>(ids);
                }
            }
            
            if (addressIds != null && addressIds.contains(id)) {
                addressIds.remove(id);
                // Update customer with updated addressIds
                if (customer.getJsonData() == null) {
                    customer.setJsonData(new java.util.HashMap<>());
                }
                customer.getJsonData().put("addressIds", addressIds);
                customerRepository.updateCustomer(customer.getId(), customer);
            }
        }
        
        // Delete the address
        Optional<Address> addressToDelete = addressRepository.getAddressById(id);
        addressRepository.deleteAddress(id);
        if (addressToDelete.isPresent()) {
            notificationService.notifyDataChange(DataChangeNotification.ChangeType.DELETE, DATA_TYPE_ID, addressToDelete.get());
        }
    }
}

