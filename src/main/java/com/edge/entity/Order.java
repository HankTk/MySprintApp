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
public class Order {
    private String id;
    private String orderNumber;
    private String customerId;
    private String shippingAddressId;
    private String billingAddressId;
    private LocalDateTime orderDate;
    private LocalDateTime shipDate;
    private String status; // "DRAFT", "PENDING_APPROVAL", "APPROVED", "SHIPPING_INSTRUCTED", "SHIPPED", "INVOICED", "PAID", "CANCELLED"
    private String invoiceNumber; // Invoice number linked to customer for A/R processing
    private LocalDateTime invoiceDate; // Invoice date
    private List<OrderItem> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private BigDecimal total;
    private String notes;
    private Map<String, Object> jsonData;

    public Order() {
        this.items = new ArrayList<>();
        this.status = "DRAFT";
        this.orderDate = LocalDateTime.now();
    }

    public void calculateTotals() {
        if (items == null) {
            items = new ArrayList<>();
        }
        
        // Calculate subtotal from items
        subtotal = items.stream()
            .filter(item -> item.getLineTotal() != null)
            .map(OrderItem::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Default tax and shipping to zero if null
        if (tax == null) {
            tax = BigDecimal.ZERO;
        }
        if (shippingCost == null) {
            shippingCost = BigDecimal.ZERO;
        }
        
        // Calculate total
        total = subtotal.add(tax).add(shippingCost);
    }
}

