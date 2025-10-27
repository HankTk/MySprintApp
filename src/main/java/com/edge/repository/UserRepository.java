package com.edge.repository;

import com.edge.entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class UserRepository extends AbstractJsonRepository<User>
{
    private static final Logger logger = LoggerFactory.getLogger(UserRepository.class);
    private static final String DATA_FILE_NAME = "users.json";
    private static final String DATA_DIR_NAME = "data";

    public UserRepository()
    {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "users");
    }

    @Override
    protected void loadItemsFromFile() throws IOException
    {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty())
        {
            logger.info("Data file is empty, starting with empty user list");
            items = new java.util.ArrayList<>();
            return;
        }
        try
        {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<User>>() {});
            logger.info("Successfully loaded {} users from data file", items.size());
        }
        catch (Exception e)
        {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(User entity)
    {
        return entity.getId();
    }

    @Override
    protected void setId(User entity, String id)
    {
        entity.setId(id);
    }

    public Optional<User> getUserByEmail(String email)
    {
        if (email == null || email.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(user -> email.equals(user.getEmail())).findFirst();
    }

    public Optional<User> getUserById(String id)
    {
        return findById(id);
    }

    public List<User> getAllUsers()
    {
        return findAll();
    }

    public User createUser(User user)
    {
        if (user == null) throw new IllegalArgumentException("User cannot be null");
        if (getUserByEmail(user.getEmail()).isPresent())
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists");
        return save(user);
    }

    public User updateUser(String id, User userDetails)
    {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("User ID cannot be null or empty");
        if (userDetails == null)
            throw new IllegalArgumentException("User details cannot be null");

        User existingUser = findById(id).orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        
        Optional<User> emailCheck = getUserByEmail(userDetails.getEmail());
        if (emailCheck.isPresent() && !id.equals(emailCheck.get().getId()))
            throw new UserAlreadyExistsException("User with email " + userDetails.getEmail() + " already exists");

        // Update fields manually
        existingUser.setFirstName(userDetails.getFirstName());
        existingUser.setLastName(userDetails.getLastName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setJsonData(userDetails.getJsonData());
        
        saveItems();
        logger.info("Updated user with ID: {}", id);
        return existingUser;
    }

    public void deleteUser(String id)
    {
        deleteById(id);
    }

    // Custom exceptions
    public static class UserNotFoundException extends EntityNotFoundException
    {
        public UserNotFoundException(String message) { super(message); }
    }

    public static class UserAlreadyExistsException extends EntityAlreadyExistsException
    {
        public UserAlreadyExistsException(String message) { super(message); }
    }
}
