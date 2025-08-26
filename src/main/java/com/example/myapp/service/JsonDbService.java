package com.example.myapp.service;

import com.example.myapp.entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
// import org.springframework.core.io.ClassPathResource; // Used for sample data loading but not needed now
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
// import java.io.InputStream; // Used for sample data loading but not needed now
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.UUID;

@Service
public class JsonDbService {
    
    private static final String DATA_FILE_NAME = "users.json";
    private static final String DATA_DIR_NAME = "data";
    // Sample data is not used
    // private static final String SAMPLE_DATA_PATH = "sample-users.json";
    
    private final ObjectMapper objectMapper;
    // AtomicLong is not needed since we use UUID
    // private final AtomicLong idCounter = new AtomicLong(1);
    private List<User> users = new ArrayList<>();
    
    public JsonDbService() {
        // ObjectMapper configuration
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        System.out.println("JsonDbService constructor called");
        loadUsers();
    }
    
    private void loadUsers() {
        System.out.println("=== loadUsers called ===");
        
        try {
            // Check file with absolute path
            Path currentDir = Paths.get("").toAbsolutePath();
            Path dataDir = currentDir.resolve(DATA_DIR_NAME);
            Path dataFile = dataDir.resolve(DATA_FILE_NAME);
            
            System.out.println("Current directory: " + currentDir);
            System.out.println("Data directory: " + dataDir);
            System.out.println("Data file path: " + dataFile);
            System.out.println("Data file exists: " + Files.exists(dataFile));
            System.out.println("Data file is readable: " + Files.isReadable(dataFile));
            System.out.println("Data file size: " + (Files.exists(dataFile) ? Files.size(dataFile) : "N/A"));
            
            if (Files.exists(dataFile)) {
                System.out.println("Data file exists, attempting to read...");
                
                try {
                    // Load from existing data file
                    String content = new String(Files.readAllBytes(dataFile));
                    System.out.println("Data file content length: " + content.length());
                    System.out.println("Data file content preview: " + content.substring(0, Math.min(200, content.length())));
                    
                    // JSON syntax check
                    if (content.trim().isEmpty()) {
                        System.out.println("Data file is empty, starting with empty user list");
                        users = new ArrayList<>();
                        return;
                    }
                    
                                            // Attempt to load with ObjectMapper
                    users = objectMapper.readValue(dataFile.toFile(), new TypeReference<List<User>>() {});
                    System.out.println("Successfully loaded " + users.size() + " users from data file");
                    
                                            // ID counter setup is not needed since we use UUID
                    System.out.println("Loaded " + users.size() + " users with UUIDs");
                    
                    System.out.println("Data file loading completed successfully");
                    return;
                    
                } catch (Exception e) {
                    System.err.println("Error reading data file: " + e.getClass().getSimpleName() + ": " + e.getMessage());
                    e.printStackTrace();
                    System.out.println("Will start with empty user list instead");
                    users = new ArrayList<>();
                    return;
                }
            } else {
                System.out.println("Data file does not exist, starting with empty user list");
                users = new ArrayList<>();
            }
        } catch (Exception e) {
            System.err.println("Unexpected error in loadUsers: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            System.out.println("Starting with empty user list instead");
            users = new ArrayList<>();
        }
    }
    

    
    private void saveUsers() {
        System.out.println("=== saveUsers called ===");
        try {
            Path currentDir = Paths.get("").toAbsolutePath();
            Path dataDir = currentDir.resolve(DATA_DIR_NAME);
            Path dataFile = dataDir.resolve(DATA_FILE_NAME);
            
            System.out.println("Save - Current directory: " + currentDir);
            System.out.println("Save - Data directory: " + dataDir);
            System.out.println("Save - Data file path: " + dataFile);
            System.out.println("Save - Data directory exists: " + Files.exists(dataDir));
            System.out.println("Save - Data file exists before save: " + Files.exists(dataFile));
            
            // Create directory if it doesn't exist
            if (!Files.exists(dataDir)) {
                Files.createDirectories(dataDir);
                System.out.println("Created data directory: " + dataDir);
            }
            
            // Number of users before saving
            System.out.println("Save - Users to save: " + users.size());
            
            objectMapper.writeValue(dataFile.toFile(), users);
            System.out.println("Save - File written successfully");
            
            // Verification after saving
            System.out.println("Save - Data file exists after save: " + Files.exists(dataFile));
            System.out.println("Save - Data file size after save: " + Files.size(dataFile));
            System.out.println("Saved " + users.size() + " users to: " + dataFile);
        } catch (IOException e) {
            System.err.println("Failed to save users: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Unexpected error in saveUsers: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<User> getAllUsers() {
        System.out.println("getAllUsers called, returning " + users.size() + " users");
        return new ArrayList<>(users);
    }
    
    public Optional<User> getUserById(String id) {
        return users.stream()
            .filter(user -> user.getId().equals(id))
            .findFirst();
    }
    
    public User getUserByEmail(String email) {
        return users.stream()
            .filter(user -> user.getEmail().equals(email))
            .findFirst()
            .orElse(null);
    }
    
    public User createUser(User user) {
        user.setId(UUID.randomUUID().toString());
        users.add(user);
        saveUsers();
        return user;
    }
    
    public User updateUser(String id, User userDetails) {
        User existingUser = getUserById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        existingUser.setFirstName(userDetails.getFirstName());
        existingUser.setLastName(userDetails.getLastName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setJsonData(userDetails.getJsonData());
        
        saveUsers();
        return existingUser;
    }
    
    public void deleteUser(String id) {
        users.removeIf(user -> user.getId().equals(id));
        saveUsers();
    }
    
    public void saveAll() {
        saveUsers();
    }
}
