package com.edge.entity;

/**
 * @author Hidenori Takaku
 */
import lombok.Data;
import java.util.Map;

@Data
public class Vendor {
    private String id;
    private String vendorNumber;
    private String companyName;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Map<String, Object> jsonData;

    public String getFullName() {
        if (companyName != null && !companyName.trim().isEmpty()) {
            return companyName;
        }
        return (lastName != null ? lastName : "") + " " + (firstName != null ? firstName : "").trim();
    }
}

