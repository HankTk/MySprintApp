package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.config.DataChangeNotification;
import com.edge.entity.Vendor;
import com.edge.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class VendorService {
    
    @Autowired
    private VendorRepository vendorRepository;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    private static final String DATA_TYPE_ID = "vendors";
    
    public List<Vendor> getAllVendors() {
        return vendorRepository.getAllVendors();
    }
    
    public Optional<Vendor> getVendorById(String id) {
        return vendorRepository.getVendorById(id);
    }
    
    public Optional<Vendor> getVendorByEmail(String email) {
        return vendorRepository.getVendorByEmail(email);
    }
    
    public Optional<Vendor> getVendorByVendorNumber(String vendorNumber) {
        return vendorRepository.getVendorByVendorNumber(vendorNumber);
    }
    
    public Vendor createVendor(Vendor vendor) {
        Vendor created = vendorRepository.createVendor(vendor);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.CREATE, DATA_TYPE_ID, created);
        return created;
    }
    
    public Vendor updateVendor(String id, Vendor vendorDetails) {
        Vendor updated = vendorRepository.updateVendor(id, vendorDetails);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, updated);
        return updated;
    }
    
    public void deleteVendor(String id) {
        Optional<Vendor> vendorToDelete = vendorRepository.getVendorById(id);
        vendorRepository.deleteVendor(id);
        if (vendorToDelete.isPresent()) {
            notificationService.notifyDataChange(DataChangeNotification.ChangeType.DELETE, DATA_TYPE_ID, vendorToDelete.get());
        }
    }
}

