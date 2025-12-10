package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItem {
    private String id;
    private String productId;
    private String productCode;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    
    public void calculateLineTotal() {
        if (quantity != null && unitPrice != null) {
            lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}

