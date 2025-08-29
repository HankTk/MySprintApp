package com.edge.service;

import com.edge.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService
{
    
    @Autowired
    private JsonDbService jsonDbService;
    
    public List<User> getAllUsers()
    {
        return jsonDbService.getAllUsers();
    }
    
    public Optional<User> getUserById(String id)
    {
        return jsonDbService.getUserById(id);
    }
    
    public User getUserByEmail(String email)
    {
        return jsonDbService.getUserByEmail(email);
    }
    
    public User createUser(User user)
    {
        return jsonDbService.createUser(user);
    }
    
    public User updateUser(String id, User userDetails)
    {
        return jsonDbService.updateUser(id, userDetails);
    }
    
    public void deleteUser(String id)
    {
        jsonDbService.deleteUser(id);
    }
}
