package com.smartchat.chatfacetimesmartdev.config;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tạo hoặc cập nhật admin user mặc định
        User adminUser = userRepository.findByUsername("admin").orElse(null);
        
        if (adminUser == null) {
            // Tạo admin user mới
            adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@smartchat.com");
            adminUser.setFullName("System Administrator");
            adminUser.setRole(User.Role.ADMIN);
            adminUser.setActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            System.out.println("✅ Admin user created: username=admin, password=12345");
        } else {
            // Cập nhật admin user hiện tại
            System.out.println("ℹ️ Admin user already exists, updating password and ensuring active status...");
        }
        
        // Luôn cập nhật password và đảm bảo admin user được enable
        adminUser.setPassword(passwordEncoder.encode("12345"));
        adminUser.setActive(true); // Đảm bảo admin user luôn được enable
        adminUser.setRole(User.Role.ADMIN); // Đảm bảo role là ADMIN
        adminUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(adminUser);
        System.out.println("✅ Admin user updated: active=true, role=ADMIN");
    }
}