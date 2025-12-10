package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.SFC;
import com.edge.entity.RMA;
import com.edge.repository.SFCRepository;
import com.edge.repository.RMARepository;
import com.edge.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class SFCService {
    
    @Autowired
    private SFCRepository sfcRepository;
    
    @Autowired
    private RMARepository rmaRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<SFC> getAllSFCs() {
        return sfcRepository.getAllSFCs();
    }
    
    public Optional<SFC> getSFCById(String id) {
        return sfcRepository.getSFCById(id);
    }
    
    public List<SFC> getSFCsByRMAId(String rmaId) {
        return sfcRepository.getSFCsByRMAId(rmaId);
    }
    
    public List<SFC> getSFCsByStatus(String status) {
        return sfcRepository.getSFCsByStatus(status);
    }
    
    /**
     * Create an SFC record from an RMA
     * This is typically called when an RMA is approved or when shop floor processing is initiated
     */
    public SFC createSFCFromRMA(String rmaId) {
        RMA rma = rmaRepository.getRMAById(rmaId)
            .orElseThrow(() -> new RuntimeException("RMA not found with id: " + rmaId));
        
        // Check if SFC already exists for this RMA
        List<SFC> existingSFCs = sfcRepository.getSFCsByRMAId(rmaId);
        if (!existingSFCs.isEmpty()) {
            // Return the first existing SFC (or could throw an exception)
            return existingSFCs.get(0);
        }
        
        // Create new SFC from RMA
        SFC sfc = new SFC();
        sfc.setRmaId(rma.getId());
        sfc.setRmaNumber(rma.getRmaNumber());
        sfc.setOrderId(rma.getOrderId());
        sfc.setOrderNumber(rma.getOrderNumber());
        sfc.setCustomerId(rma.getCustomerId());
        sfc.setCustomerName(rma.getCustomerName());
        sfc.setStatus("PENDING");
        sfc.setCreatedDate(LocalDateTime.now());
        
        // Enrich with customer information if needed
        if (sfc.getCustomerName() == null && sfc.getCustomerId() != null) {
            customerRepository.getCustomerById(sfc.getCustomerId()).ifPresent(customer -> {
                sfc.setCustomerName(customer.getFullName());
            });
        }
        
        SFC created = sfcRepository.createSFC(sfc);
        if (webSocketService != null) {
            webSocketService.broadcastSFCUpdate(created);
        }
        return created;
    }
    
    public SFC createSFC(SFC sfc) {
        // Enrich SFC with RMA information if rmaId is provided
        if (sfc.getRmaId() != null) {
            enrichSFCWithRMAInfo(sfc);
        }
        
        SFC created = sfcRepository.createSFC(sfc);
        if (webSocketService != null) {
            webSocketService.broadcastSFCUpdate(created);
        }
        return created;
    }
    
    public SFC updateSFC(String id, SFC sfcDetails) {
        SFC existingSFC = sfcRepository.getSFCById(id)
            .orElseThrow(() -> new RuntimeException("SFC not found with id: " + id));
        
        String oldStatus = existingSFC.getStatus();
        
        // Set started date when status changes to IN_PROGRESS
        if ("IN_PROGRESS".equals(sfcDetails.getStatus()) && !"IN_PROGRESS".equals(oldStatus)) {
            sfcDetails.setStartedDate(LocalDateTime.now());
        }
        
        // Set completed date when status changes to COMPLETED
        if ("COMPLETED".equals(sfcDetails.getStatus()) && !"COMPLETED".equals(oldStatus)) {
            sfcDetails.setCompletedDate(LocalDateTime.now());
        }
        
        SFC updated = sfcRepository.updateSFC(id, sfcDetails);
        
        // Broadcast update via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastSFCUpdate(updated);
        }
        
        return updated;
    }
    
    public void deleteSFC(String id) {
        sfcRepository.deleteSFC(id);
        
        // Broadcast deletion via WebSocket
        if (webSocketService != null) {
            webSocketService.broadcastSFCDelete(id);
        }
    }
    
    private void enrichSFCWithRMAInfo(SFC sfc) {
        if (sfc.getRmaId() != null) {
            rmaRepository.getRMAById(sfc.getRmaId()).ifPresent(rma -> {
                if (sfc.getRmaNumber() == null) {
                    sfc.setRmaNumber(rma.getRmaNumber());
                }
                if (sfc.getOrderId() == null) {
                    sfc.setOrderId(rma.getOrderId());
                }
                if (sfc.getOrderNumber() == null) {
                    sfc.setOrderNumber(rma.getOrderNumber());
                }
                if (sfc.getCustomerId() == null) {
                    sfc.setCustomerId(rma.getCustomerId());
                }
                if (sfc.getCustomerName() == null) {
                    sfc.setCustomerName(rma.getCustomerName());
                }
            });
        }
    }
}

