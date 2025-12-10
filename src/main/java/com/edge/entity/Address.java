package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.util.Map;

@Data
public class Address {
    private String id;
    private String customerId; // Link to customer by ID
    private String addressType; // "SHIPPING" or "BILLING"
    private String streetAddress1;
    private String streetAddress2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String contactName;
    private String contactPhone;
    private Boolean defaultAddress;
    private Map<String, Object> jsonData;
}

