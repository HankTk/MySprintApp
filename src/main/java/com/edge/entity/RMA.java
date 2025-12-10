package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
public class RMA {
    private String id;
    private String rmaNumber;
    private String orderId; // Reference to original order
    private String orderNumber; // Order number for display
    private String customerId;
    private String customerName; // For display
    private LocalDateTime rmaDate;
    private LocalDateTime receivedDate; // When items were received
    private String status; // "DRAFT", "PENDING_APPROVAL", "APPROVED", "RECEIVED", "PROCESSED", "CANCELLED"
    private List<RMAItem> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal restockingFee; // Fee for processing return
    private BigDecimal total; // Total refund amount
    private String notes;
    private Map<String, Object> jsonData;

    public RMA() {
        this.items = new ArrayList<>();
        this.status = "DRAFT";
        this.rmaDate = LocalDateTime.now();
    }

    public void calculateTotals() {
        if (items == null) {
            items = new ArrayList<>();
        }
        
        // Calculate subtotal from items
        subtotal = items.stream()
            .filter(item -> item.getLineTotal() != null)
            .map(RMAItem::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Default tax and restocking fee to zero if null
        if (tax == null) {
            tax = BigDecimal.ZERO;
        }
        if (restockingFee == null) {
            restockingFee = BigDecimal.ZERO;
        }
        
        // Calculate total (subtotal - restocking fee, tax is typically not refunded)
        total = subtotal.subtract(restockingFee);
    }
}

