package com.edge.entity;

import lombok.Data;
import java.util.Map;

@Data
public class User {
    
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private Map<String, Object> jsonData;
    
    // Method to get full name
    public String getFullName() {
        return lastName + " " + firstName;
    }
}
