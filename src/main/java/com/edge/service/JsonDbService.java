package com.edge.service;

import com.edge.entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class JsonDbService
{

    private static final Logger logger = LoggerFactory.getLogger(JsonDbService.class);
    private static final String DATA_FILE_NAME = "users.json";
    private static final String DATA_DIR_NAME = "data";

    private final ObjectMapper objectMapper;
    private final Path dataFilePath;
    private List<User> users = new ArrayList<>();

    public JsonDbService()
    {
        this.objectMapper = createObjectMapper();
        this.dataFilePath = initializeDataFilePath();
        loadUsers();
    }

    private ObjectMapper createObjectMapper()
    {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }

    private Path initializeDataFilePath()
    {
        Path currentDir = Paths.get("").toAbsolutePath();
        Path dataDir = currentDir.resolve(DATA_DIR_NAME);
        return dataDir.resolve(DATA_FILE_NAME);
    }

    private void loadUsers()
    {
        logger.info("Loading users from data file: {}", dataFilePath);
        
        try
        {
            if (Files.exists(dataFilePath) && Files.isReadable(dataFilePath))
            {
                loadUsersFromFile();
            }
            else
            {
                logger.info("Data file does not exist or is not readable, starting with empty user list");
                users = new ArrayList<>();
            }
        }
        catch (Exception e)
        {
            logger.error("Error loading users from file: {}", e.getMessage(), e);
            users = new ArrayList<>();
        }
    }

    private void loadUsersFromFile() throws IOException
    {
        String content = new String(Files.readAllBytes(dataFilePath));
        
        if (content.trim().isEmpty())
        {
            logger.info("Data file is empty, starting with empty user list");
            users = new ArrayList<>();
            return;
        }

        try
        {
            users = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<User>>() {});
            logger.info("Successfully loaded {} users from data file", users.size());
        }
        catch (Exception e)
        {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            users = new ArrayList<>();
        }
    }

    private void saveUsers()
    {
        logger.info("Saving {} users to data file", users.size());
        
        try
        {
            ensureDataDirectoryExists();
            objectMapper.writeValue(dataFilePath.toFile(), users);
            logger.info("Successfully saved {} users to data file", users.size());
        }
        catch (IOException e)
        {
            logger.error("Failed to save users: {}", e.getMessage(), e);
            throw new DataPersistenceException("Failed to save users to file", e);
        }
        catch (Exception e)
        {
            logger.error("Unexpected error in saveUsers: {}", e.getMessage(), e);
            throw new DataPersistenceException("Failed to save users to file", e);
        }
    }

    private void ensureDataDirectoryExists()
    {
        Path dataDir = dataFilePath.getParent();
        if (!Files.exists(dataDir))
        {
            try
            {
                Files.createDirectories(dataDir);
                logger.info("Created data directory: {}", dataDir);
            }
            catch (IOException e)
            {
                logger.error("Failed to create data directory: {}", e.getMessage(), e);
                throw new DataPersistenceException("Failed to create data directory", e);
            }
        }
    }

    public List<User> getAllUsers()
    {
        logger.debug("Getting all users, returning {} users", users.size());
        return new ArrayList<>(users);
    }

    public Optional<User> getUserById(String id)
    {
        if (id == null || id.trim().isEmpty())
        {
            return Optional.empty();
        }
        
        return users.stream()
            .filter(user -> id.equals(user.getId()))
            .findFirst();
    }

    public Optional<User> getUserByEmail(String email)
    {
        if (email == null || email.trim().isEmpty())
        {
            return Optional.empty();
        }
        
        return users.stream()
            .filter(user -> email.equals(user.getEmail()))
            .findFirst();
    }

    public User createUser(User user)
    {
        if (user == null)
        {
            throw new IllegalArgumentException("User cannot be null");
        }
        
        if (getUserByEmail(user.getEmail()).isPresent())
        {
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists");
        }
        
        user.setId(UUID.randomUUID().toString());
        users.add(user);
        saveUsers();
        
        logger.info("Created new user with ID: {}", user.getId());
        return user;
    }

    public User updateUser(String id, User userDetails)
    {
        if (id == null || id.trim().isEmpty())
        {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        if (userDetails == null)
        {
            throw new IllegalArgumentException("User details cannot be null");
        }
        
        User existingUser = getUserById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        // Check if email is being changed and if it conflicts with existing user
        if (!id.equals(existingUser.getId()) && 
            getUserByEmail(userDetails.getEmail()).isPresent())
        {
            throw new UserAlreadyExistsException("User with email " + userDetails.getEmail() + " already exists");
        }

        updateUserFields(existingUser, userDetails);
        saveUsers();
        
        logger.info("Updated user with ID: {}", id);
        return existingUser;
    }

    private void updateUserFields(User existingUser, User userDetails)
    {
        existingUser.setFirstName(userDetails.getFirstName());
        existingUser.setLastName(userDetails.getLastName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setJsonData(userDetails.getJsonData());
    }

    public void deleteUser(String id)
    {
        if (id == null || id.trim().isEmpty())
        {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        boolean removed = users.removeIf(user -> id.equals(user.getId()));
        if (removed)
        {
            saveUsers();
            logger.info("Deleted user with ID: {}", id);
        }
        else
        {
            logger.warn("Attempted to delete user with ID: {}, but user was not found", id);
        }
    }

    public void saveAll()
    {
        saveUsers();
    }

    // Custom exceptions
    public static class DataPersistenceException extends RuntimeException
    {
        public DataPersistenceException(String message, Throwable cause)
        {
            super(message, cause);
        }
    }

    public static class UserNotFoundException extends RuntimeException
    {
        public UserNotFoundException(String message)
        {
            super(message);
        }
    }

    public static class UserAlreadyExistsException extends RuntimeException
    {
        public UserAlreadyExistsException(String message)
        {
            super(message);
        }
    }
}
