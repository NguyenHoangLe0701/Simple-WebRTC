package com.smartchat.chatfacetimesmartdev.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long adminUsers = userRepository.countByRole(User.Role.ADMIN);
            long regularUsers = userRepository.countByRole(User.Role.USER);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("adminUsers", adminUsers);
            stats.put("regularUsers", regularUsers);
            stats.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy thống kê"));
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy danh sách người dùng"));
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy thông tin người dùng"));
        }
    }
    
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setActive(!user.getActive());
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công", "isActive", user.getActive()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi cập nhật trạng thái"));
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi xóa người dùng"));
        }
    }
    
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleData) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String newRole = roleData.get("role");
                
                if ("ADMIN".equals(newRole) || "USER".equals(newRole)) {
                    user.setRole(User.Role.valueOf(newRole));
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Cập nhật quyền thành công", "role", newRole));
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Quyền không hợp lệ"));
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi cập nhật quyền"));
        }
    }
}
