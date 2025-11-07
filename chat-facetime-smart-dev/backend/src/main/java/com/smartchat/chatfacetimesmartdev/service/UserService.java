package com.smartchat.chatfacetimesmartdev.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return user.get();
        }
        throw new RuntimeException("User not found");
    }

    public User updateUserStatus(Long id, boolean active) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(active);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }

    public void deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            userRepository.delete(user.get());
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public Map<String, Object> getSystemStats() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        
        // SỬA Ở ĐÂY: thay user.getActive() thành user.isActive()
        long activeUsers = allUsers.stream().filter(user -> user.isActive()).count();
        long adminUsers = allUsers.stream().filter(user -> user.getRole() == User.Role.ADMIN).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("adminUsers", adminUsers);
        stats.put("inactiveUsers", totalUsers - activeUsers);
        
        return stats;
    }
}