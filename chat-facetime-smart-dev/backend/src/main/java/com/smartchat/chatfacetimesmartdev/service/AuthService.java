package com.smartchat.chatfacetimesmartdev.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartchat.chatfacetimesmartdev.dto.AuthResponseDto;
import com.smartchat.chatfacetimesmartdev.dto.LoginDto;
import com.smartchat.chatfacetimesmartdev.dto.RegisterDto;
import com.smartchat.chatfacetimesmartdev.entity.LoginSession;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;
import com.smartchat.chatfacetimesmartdev.service.SecurityService;
import com.smartchat.chatfacetimesmartdev.util.JwtUtil;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private SecurityService securityService;
    
    
    public AuthResponseDto register(RegisterDto registerDto) {
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        
        User user = new User();
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setFullName(registerDto.getFullName());
        user.setRole(User.Role.USER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", savedUser.getId());
        extraClaims.put("role", savedUser.getRole().name());
        
        String token = jwtUtil.generateToken(savedUser, extraClaims);
        
        return new AuthResponseDto(
            token,
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getRole().name()
        );
    }
    
    public AuthResponseDto login(LoginDto loginDto) {
        return login(loginDto, null, null, null);
    }
    
    public AuthResponseDto login(LoginDto loginDto, String ipAddress, String userAgent, String deviceInfo) {
        Optional<User> userOpt = userRepository.findByUsername(loginDto.getUsernameOrEmail());
        
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(loginDto.getUsernameOrEmail());
        }
        
        if (userOpt.isEmpty()) {
            System.err.println("⚠️ Login failed - User not found: " + loginDto.getUsernameOrEmail());
            throw new RuntimeException("Tài khoản không tồn tại");
        }
        
        User user = userOpt.get();
        
        boolean passwordMatch = passwordEncoder.matches(loginDto.getPassword(), user.getPassword());
        
        if (!passwordMatch) {
            System.err.println("⚠️ Login failed - Invalid password for: " + loginDto.getUsernameOrEmail());
            throw new RuntimeException("Mật khẩu không đúng");
        }
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        String sessionId = null;
        if (ipAddress != null && userAgent != null) {
            try {
                LoginSession session = securityService.createLoginSession(
                    user.getId(), 
                    ipAddress, 
                    userAgent, 
                    deviceInfo != null ? deviceInfo : "Unknown"
                );
                sessionId = session.getSessionId();
            } catch (Exception e) {
                System.err.println("❌ Error creating login session: " + e.getMessage());
            }
        }
        
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        if (sessionId != null) {
            extraClaims.put("sessionId", sessionId);
        }
        
        String token = jwtUtil.generateToken(user, extraClaims);
        
        return new AuthResponseDto(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name()
        );
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }
}
