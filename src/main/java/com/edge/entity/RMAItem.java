package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RMAItem {
    private String id;
    private String productId;
    private String productCode;
    private String productName;
    private Integer quantity;
    private Integer returnedQuantity; // Quantity actually returned
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private String reason; // Reason for return
    private String condition; // Condition of returned item (e.g., "NEW", "USED", "DAMAGED")
    
    public void calculateLineTotal() {
        if (returnedQuantity != null && unitPrice != null) {
            lineTotal = unitPrice.multiply(BigDecimal.valueOf(returnedQuantity));
        }
    }
}

