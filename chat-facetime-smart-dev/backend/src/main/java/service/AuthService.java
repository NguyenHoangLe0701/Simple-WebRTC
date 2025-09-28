package service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import controller.RegisterDto;
import dto.AuthResponseDto;
import dto.LoginDto;
import entity.User;
import repository.UserRepository;
import com.smartchat.chatfacetimesmartdev.util.JwtUtil;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    
    public AuthResponseDto register(RegisterDto registerDto) {
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        
        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        
        // Tạo user mới
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
        
        // Tạo JWT token
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
        System.out.println("Login attempt for: " + loginDto.getUsernameOrEmail());
        
        // Tìm user theo username trước
        Optional<User> userOpt = userRepository.findByUsername(loginDto.getUsernameOrEmail());
        System.out.println("Found by username: " + userOpt.isPresent());
        
        // Nếu không có username thì thử tìm theo email
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(loginDto.getUsernameOrEmail());
            System.out.println("Found by email: " + userOpt.isPresent());
        }
        
        if (userOpt.isEmpty()) {
            System.out.println("User not found: " + loginDto.getUsernameOrEmail());
            throw new RuntimeException("Tài khoản không tồn tại");
        }
        
        User user = userOpt.get();
        System.out.println("User found: " + user.getUsername() + ", role: " + user.getRole());
        
        // Xác thực mật khẩu
        boolean passwordMatch = passwordEncoder.matches(loginDto.getPassword(), user.getPassword());
        System.out.println("Password match: " + passwordMatch);
        
        if (!passwordMatch) {
            throw new RuntimeException("Mật khẩu không đúng");
        }
        
        // Không cần thay đổi role, chỉ kiểm tra role hiện tại
        System.out.println("User role: " + user.getRole());
        
        // Cập nhật last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        // Tạo JWT token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        
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
