package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class Product {
    private String id;
    private String productCode;
    private String productName;
    private String description;
    private BigDecimal unitPrice;
    private BigDecimal cost; // Product cost for General Ledger
    private String unitOfMeasure;
    private boolean active;
    private Map<String, Object> jsonData;
}

