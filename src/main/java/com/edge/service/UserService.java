package com.edge.service;

import com.edge.config.DataChangeNotification;
import com.edge.entity.User;
import com.edge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UserService
{
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    @Autowired
    private AuthService authService;
    
    private static final String DATA_TYPE_ID = "users";
    
    public List<User> getAllUsers()
    {
        return userRepository.getAllUsers();
    }
    
    public Optional<User> getUserById(String id)
    {
        return userRepository.getUserById(id);
    }
    
    public Optional<User> getUserByEmail(String email)
    {
        return userRepository.getUserByEmail(email);
    }
    
    public User createUser(User user)
    {
        // Hash password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty())
        {
            String hashedPassword = authService.encodePassword(user.getPassword());
            user.setPassword(hashedPassword);
        }
        User createdUser = userRepository.createUser(user);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.CREATE, DATA_TYPE_ID, createdUser);
        return createdUser;
    }
    
    public User updateUser(String id, User userDetails)
    {
        // Hash password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty())
        {
            String hashedPassword = authService.encodePassword(userDetails.getPassword());
            userDetails.setPassword(hashedPassword);
        }
        User updatedUser = userRepository.updateUser(id, userDetails);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, updatedUser);
        return updatedUser;
    }
    
    public void deleteUser(String id)
    {
        Optional<User> userToDelete = userRepository.getUserById(id);
        userRepository.deleteUser(id);
        if (userToDelete.isPresent())
        {
            notificationService.notifyDataChange(DataChangeNotification.ChangeType.DELETE, DATA_TYPE_ID, userToDelete.get());
        }
    }
}
