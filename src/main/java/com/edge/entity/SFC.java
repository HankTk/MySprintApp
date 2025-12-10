package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class SFC {
    private String id;
    private String sfcNumber; // Auto-generated SFC number
    private String rmaId; // Reference to RMA
    private String rmaNumber; // RMA number for display
    private String orderId; // Reference to original order
    private String orderNumber; // Order number for display
    private String customerId;
    private String customerName; // For display
    private LocalDateTime createdDate; // When SFC was created
    private LocalDateTime startedDate; // When processing started
    private LocalDateTime completedDate; // When processing completed
    private String status; // "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"
    private String assignedTo; // User ID assigned to process this SFC
    private String notes;
    private Map<String, Object> jsonData;

    public SFC() {
        this.status = "PENDING";
        this.createdDate = LocalDateTime.now();
    }
}

