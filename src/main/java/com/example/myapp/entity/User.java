package com.example.myapp.entity;

import java.util.Map;

public class User {
    
    private String id;
    
    private String firstName;
    
    private String lastName;
    
    private String email;
    
    private Map<String, Object> jsonData;
    
    // コンストラクタ
    public User() {}
    
    public User(String firstName, String lastName, String email, Map<String, Object> jsonData) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.jsonData = jsonData;
    }
    
    // ゲッターとセッター
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Map<String, Object> getJsonData() {
        return jsonData;
    }
    
    public void setJsonData(Map<String, Object> jsonData) {
        this.jsonData = jsonData;
    }
    
    // フルネームを取得するメソッド
    public String getFullName() {
        return lastName + " " + firstName;
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", jsonData=" + jsonData +
                '}';
    }
}
