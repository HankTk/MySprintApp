package com.edge.service;

import com.edge.entity.User;
import com.edge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class AuthService
{
    @Autowired
    private UserRepository userRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public User authenticate(String userid, String password)
    {
        Optional<User> userOpt = userRepository.getUserByUserid(userid);
        if (userOpt.isEmpty()) {
            return null;
        }
        
        User user = userOpt.get();
        if (user.getPassword() == null) {
            return null;
        }
        
        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        
        return null;
    }
    
    public boolean hasUsers()
    {
        List<User> users = userRepository.getAllUsers();
        return users != null && !users.isEmpty();
    }
    
    public String encodePassword(String rawPassword)
    {
        return passwordEncoder.encode(rawPassword);
    }
}
