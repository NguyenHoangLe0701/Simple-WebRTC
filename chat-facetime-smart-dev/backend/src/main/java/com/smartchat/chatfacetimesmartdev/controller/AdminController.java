package com.smartchat.chatfacetimesmartdev.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartchat.chatfacetimesmartdev.dto.ActiveSessionDTO;
import com.smartchat.chatfacetimesmartdev.dto.SessionResponse;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;
import com.smartchat.chatfacetimesmartdev.service.SecurityService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private SecurityService securityService;
    
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
                // SỬA 1: user.getActive() → user.isActive()
                user.setActive(!user.isActive());
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                // SỬA 2: user.getActive() → user.isActive()
                return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công", "isActive", user.isActive()));
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
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        try {
            String username = (String) userData.get("username");
            String email = (String) userData.get("email");
            String password = (String) userData.get("password");
            String fullName = (String) userData.get("fullName");
            String roleStr = (String) userData.get("role");
            Boolean active = userData.get("active") != null ? (Boolean) userData.get("active") : true;
            
            // Validation
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username không được để trống"));
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email không được để trống"));
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password không được để trống"));
            }
            
            // Kiểm tra username đã tồn tại
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username đã tồn tại"));
            }
            
            // Kiểm tra email đã tồn tại
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email đã tồn tại"));
            }
            
            // Tạo user mới
            User user = new User();
            user.setUsername(username.trim());
            user.setEmail(email.trim());
            user.setPassword(passwordEncoder.encode(password));
            user.setFullName(fullName != null ? fullName.trim() : "");
            user.setRole(roleStr != null && "ADMIN".equals(roleStr) ? User.Role.ADMIN : User.Role.USER);
            user.setActive(active);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi tạo người dùng: " + e.getMessage()));
        }
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> userData) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Cập nhật username nếu có và khác với username hiện tại
            if (userData.containsKey("username")) {
                String username = (String) userData.get("username");
                if (username != null && !username.trim().isEmpty()) {
                    if (!username.trim().equals(user.getUsername()) && userRepository.existsByUsername(username.trim())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Username đã tồn tại"));
                    }
                    user.setUsername(username.trim());
                }
            }
            
            // Cập nhật email nếu có và khác với email hiện tại
            if (userData.containsKey("email")) {
                String email = (String) userData.get("email");
                if (email != null && !email.trim().isEmpty()) {
                    if (!email.trim().equals(user.getEmail()) && userRepository.existsByEmail(email.trim())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Email đã tồn tại"));
                    }
                    user.setEmail(email.trim());
                }
            }
            
            // Cập nhật password nếu có
            if (userData.containsKey("password") && userData.get("password") != null) {
                String password = (String) userData.get("password");
                if (!password.isEmpty()) {
                    user.setPassword(passwordEncoder.encode(password));
                }
            }
            
            // Cập nhật fullName
            if (userData.containsKey("fullName")) {
                String fullName = (String) userData.get("fullName");
                user.setFullName(fullName != null ? fullName.trim() : "");
            }
            
            // Cập nhật role
            if (userData.containsKey("role")) {
                String roleStr = (String) userData.get("role");
                if ("ADMIN".equals(roleStr) || "USER".equals(roleStr)) {
                    user.setRole(User.Role.valueOf(roleStr));
                }
            }
            
            // Cập nhật active
            if (userData.containsKey("active")) {
                user.setActive((Boolean) userData.get("active"));
            }
            
            user.setUpdatedAt(LocalDateTime.now());
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi cập nhật người dùng: " + e.getMessage()));
        }
    }
    
    // ==================== SECURITY ENDPOINTS ====================
    
    /**
     * Lấy danh sách active sessions
     */
    @GetMapping("/security/sessions/active")
    public ResponseEntity<?> getActiveSessions() {
        try {
            List<ActiveSessionDTO> sessions = securityService.getActiveSessions();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy danh sách sessions: " + e.getMessage()));
        }
    }
    
    /**
     * Force logout session
     */
    @PostMapping("/security/sessions/{sessionId}/invalidate")
    public ResponseEntity<?> forceLogout(@PathVariable String sessionId) {
        try {
            boolean success = securityService.forceLogout(sessionId);
            if (success) {
                return ResponseEntity.ok(SessionResponse.success("Force logout thành công"));
            } else {
                return ResponseEntity.status(404).body(SessionResponse.error("Session không tồn tại"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(SessionResponse.error("Lỗi khi force logout: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy login history
     */
    @GetMapping("/security/sessions/history")
    public ResponseEntity<?> getLoginHistory(@RequestParam(defaultValue = "7") int days) {
        try {
            List<ActiveSessionDTO> history = securityService.getLoginHistory(days);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy lịch sử đăng nhập: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy session statistics
     */
    @GetMapping("/security/sessions/stats")
    public ResponseEntity<?> getSessionStats() {
        try {
            Map<String, Object> stats = securityService.getSessionStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy thống kê sessions: " + e.getMessage()));
        }
    }
    
    /**
     * Force logout tất cả sessions của user
     */
    @PostMapping("/security/users/{userId}/sessions/invalidate-all")
    public ResponseEntity<?> forceLogoutAllUserSessions(@PathVariable Long userId) {
        try {
            int count = securityService.forceLogoutAllUserSessions(userId);
            return ResponseEntity.ok(SessionResponse.success("Đã force logout " + count + " session(s)", Map.of("count", count)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(SessionResponse.error("Lỗi khi force logout: " + e.getMessage()));
        }
    }
}