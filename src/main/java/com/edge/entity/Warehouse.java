package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.util.Map;

@Data
public class Warehouse {
    private String id;
    private String warehouseCode;
    private String warehouseName;
    private String address;
    private String description;
    private boolean active;
    private Map<String, Object> jsonData;
}

