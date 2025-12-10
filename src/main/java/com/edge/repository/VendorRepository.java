package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Vendor;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class VendorRepository extends AbstractJsonRepository<Vendor> {
    private static final Logger logger = LoggerFactory.getLogger(VendorRepository.class);
    private static final String DATA_FILE_NAME = "vendors.json";
    private static final String DATA_DIR_NAME = "data";

    public VendorRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "vendors");
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty vendor list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Vendor>>() {});
            logger.info("Successfully loaded {} vendors from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Vendor entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Vendor entity, String id) {
        entity.setId(id);
    }

    public Optional<Vendor> getVendorByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(vendor -> email.equals(vendor.getEmail())).findFirst();
    }

    public Optional<Vendor> getVendorByVendorNumber(String vendorNumber) {
        if (vendorNumber == null || vendorNumber.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(vendor -> vendorNumber.equals(vendor.getVendorNumber())).findFirst();
    }

    public Optional<Vendor> getVendorById(String id) {
        return findById(id);
    }

    public List<Vendor> getAllVendors() {
        return findAll();
    }

    public Vendor createVendor(Vendor vendor) {
        if (vendor == null) throw new IllegalArgumentException("Vendor cannot be null");
        if (vendor.getEmail() != null && !vendor.getEmail().trim().isEmpty() && 
            getVendorByEmail(vendor.getEmail()).isPresent()) {
            throw new VendorAlreadyExistsException("Vendor with email " + vendor.getEmail() + " already exists");
        }
        if (vendor.getVendorNumber() != null && !vendor.getVendorNumber().trim().isEmpty() && 
            getVendorByVendorNumber(vendor.getVendorNumber()).isPresent()) {
            throw new VendorAlreadyExistsException("Vendor with vendor number " + vendor.getVendorNumber() + " already exists");
        }
        return save(vendor);
    }

    public Vendor updateVendor(String id, Vendor vendorDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Vendor ID cannot be null or empty");
        if (vendorDetails == null)
            throw new IllegalArgumentException("Vendor details cannot be null");

        Vendor existingVendor = findById(id).orElseThrow(() -> 
            new VendorNotFoundException("Vendor not found with id: " + id));
        
        if (vendorDetails.getEmail() != null && !vendorDetails.getEmail().trim().isEmpty()) {
            Optional<Vendor> emailCheck = getVendorByEmail(vendorDetails.getEmail());
            if (emailCheck.isPresent() && !id.equals(emailCheck.get().getId())) {
                throw new VendorAlreadyExistsException("Vendor with email " + vendorDetails.getEmail() + " already exists");
            }
        }

        // Update fields
        existingVendor.setVendorNumber(vendorDetails.getVendorNumber());
        existingVendor.setCompanyName(vendorDetails.getCompanyName());
        existingVendor.setFirstName(vendorDetails.getFirstName());
        existingVendor.setLastName(vendorDetails.getLastName());
        existingVendor.setEmail(vendorDetails.getEmail());
        existingVendor.setPhone(vendorDetails.getPhone());
        
        // Update jsonData, preserving addressIds if not provided
        if (vendorDetails.getJsonData() != null) {
            java.util.Map<String, Object> newJsonData = new java.util.HashMap<>(vendorDetails.getJsonData());
            // If addressIds is in the new jsonData, use it; otherwise preserve existing
            if (!newJsonData.containsKey("addressIds") && existingVendor.getJsonData() != null && 
                existingVendor.getJsonData().containsKey("addressIds")) {
                newJsonData.put("addressIds", existingVendor.getJsonData().get("addressIds"));
            }
            existingVendor.setJsonData(new java.util.HashMap<>(newJsonData));
        } else if (existingVendor.getJsonData() != null && existingVendor.getJsonData().containsKey("addressIds")) {
            // Preserve existing addressIds if jsonData is null in update
            java.util.Map<String, Object> jsonData = new java.util.HashMap<>();
            jsonData.put("addressIds", existingVendor.getJsonData().get("addressIds"));
            existingVendor.setJsonData(jsonData);
        } else {
            existingVendor.setJsonData(vendorDetails.getJsonData());
        }
        
        saveItems();
        logger.info("Updated vendor with ID: {}", id);
        return existingVendor;
    }

    public void deleteVendor(String id) {
        deleteById(id);
    }

    public static class VendorNotFoundException extends EntityNotFoundException {
        public VendorNotFoundException(String message) { super(message); }
    }

    public static class VendorAlreadyExistsException extends EntityAlreadyExistsException {
        public VendorAlreadyExistsException(String message) { super(message); }
    }
}

