package com.edge.service;

/**
 * @author Hidenori Takaku
 */
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
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
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
        if (webSocketService != null) {
            webSocketService.broadcastVendorUpdate(created);
        }
        return created;
    }
    
    public Vendor updateVendor(String id, Vendor vendorDetails) {
        Vendor updated = vendorRepository.updateVendor(id, vendorDetails);
        if (webSocketService != null) {
            webSocketService.broadcastVendorUpdate(updated);
        }
        return updated;
    }
    
    public void deleteVendor(String id) {
        vendorRepository.deleteVendor(id);
        if (webSocketService != null) {
            webSocketService.broadcastVendorDelete(id);
        }
    }
}

