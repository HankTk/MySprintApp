package com.edge.controller;

import com.edge.entity.User;
import com.edge.service.AuthService;
import com.edge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Component
@RestController
@RequestMapping("/api/users")
public class UserController
{

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthService authService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<User> getAllUsers()
    {
        return userService.getAllUsers();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> getUserById(@PathVariable String id)
    {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/email/{email}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email)
    {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<?> createUser(@RequestBody User user)
    {
        // 1. When no users exist (initial user setup) - no authentication required, but role must be Admin
        // 2. When users exist - authentication is required
        boolean hasUsers = authService.hasUsers();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = authentication != null && 
                                  authentication.isAuthenticated() && 
                                  !authentication.getName().equals("anonymousUser");
        
        if (hasUsers && !isAuthenticated)
        {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "User creation requires authentication when users already exist."));
        }
        
        // For initial user creation (when no users exist), enforce Admin role
        if (!hasUsers)
        {
            if (user.getRole() == null || !user.getRole().equalsIgnoreCase("Admin"))
            {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Initial user creation must have Admin role."));
            }
        }
        
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userDetails)
    {
        System.out.println("Request body: " + userDetails);
        try
        {
            User updatedUser = userService.updateUser(id, userDetails);
            System.out.println("User updated successfully");
            return ResponseEntity.ok(updatedUser);
        }
        catch (RuntimeException e)
        {
            System.err.println("Update error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id)
    {
        try
        {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        }
        catch (RuntimeException e)
        {
            e.printStackTrace();
            System.err.println("Delete error: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

}
