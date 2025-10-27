package com.edge.service;

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
        return userRepository.createUser(user);
    }
    
    public User updateUser(String id, User userDetails)
    {
        return userRepository.updateUser(id, userDetails);
    }
    
    public void deleteUser(String id)
    {
        userRepository.deleteUser(id);
    }
}
