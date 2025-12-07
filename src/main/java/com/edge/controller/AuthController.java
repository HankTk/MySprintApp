package com.edge.controller;

import com.edge.entity.User;
import com.edge.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Component
@RestController
@RequestMapping("/api/auth")
public class AuthController
{
    @Autowired
    private AuthService authService;

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials)
    {
        String userid = credentials.get("userid");
        String password = credentials.get("password");

        if (userid == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID and password are required"));
        }

        try {
            User user = authService.authenticate(userid, password);
            if (user != null) {
                // Return user without password
                User userResponse = new User();
                userResponse.setId(user.getId());
                userResponse.setUserid(user.getUserid());
                userResponse.setFirstName(user.getFirstName());
                userResponse.setLastName(user.getLastName());
                userResponse.setEmail(user.getEmail());
                userResponse.setRole(user.getRole());
                userResponse.setJsonData(user.getJsonData());
                return ResponseEntity.ok(userResponse);
            } else {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid user ID or password"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/check-users", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Map<String, Boolean>> checkUsers()
    {
        boolean hasUsers = authService.hasUsers();
        return ResponseEntity.ok(Map.of("hasUsers", hasUsers));
    }
}
