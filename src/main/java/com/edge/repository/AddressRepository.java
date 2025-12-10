package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Address;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class AddressRepository extends AbstractJsonRepository<Address> {
    private static final Logger logger = LoggerFactory.getLogger(AddressRepository.class);
    private static final String DATA_FILE_NAME = "addresses.json";
    private static final String DATA_DIR_NAME = "data";

    public AddressRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "addresses");
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty address list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Address>>() {});
            logger.info("Successfully loaded {} addresses from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Address entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Address entity, String id) {
        entity.setId(id);
    }

    public Optional<Address> getAddressById(String id) {
        return findById(id);
    }

    public List<Address> getAllAddresses() {
        return findAll();
    }

    public List<Address> getAddressesByCustomerId(String customerId) {
        // This method is now handled by AddressService to avoid circular dependency
        // Keeping for backward compatibility but should use AddressService instead
        if (customerId == null || customerId.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        // Fallback to old method for backward compatibility
        return items.stream()
            .filter(address -> customerId.equals(address.getCustomerId()))
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

    public Address createAddress(Address address) {
        if (address == null) throw new IllegalArgumentException("Address cannot be null");
        return save(address);
    }

    public Address updateAddress(String id, Address addressDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Address ID cannot be null or empty");
        if (addressDetails == null)
            throw new IllegalArgumentException("Address details cannot be null");

        Address existingAddress = findById(id).orElseThrow(() -> 
            new AddressNotFoundException("Address not found with id: " + id));

        // Update fields (customerId and customerIds are no longer used - managed by Customer entity)
        existingAddress.setAddressType(addressDetails.getAddressType());
        existingAddress.setStreetAddress1(addressDetails.getStreetAddress1());
        existingAddress.setStreetAddress2(addressDetails.getStreetAddress2());
        existingAddress.setCity(addressDetails.getCity());
        existingAddress.setState(addressDetails.getState());
        existingAddress.setPostalCode(addressDetails.getPostalCode());
        existingAddress.setCountry(addressDetails.getCountry());
        existingAddress.setContactName(addressDetails.getContactName());
        existingAddress.setContactPhone(addressDetails.getContactPhone());
        existingAddress.setDefaultAddress(addressDetails.getDefaultAddress());
        existingAddress.setJsonData(addressDetails.getJsonData());
        
        saveItems();
        logger.info("Updated address with ID: {}", id);
        return existingAddress;
    }

    public void deleteAddress(String id) {
        deleteById(id);
    }

    public static class AddressNotFoundException extends EntityNotFoundException {
        public AddressNotFoundException(String message) { super(message); }
    }
}

