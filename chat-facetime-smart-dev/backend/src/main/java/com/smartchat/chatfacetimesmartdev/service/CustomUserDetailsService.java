package com.smartchat.chatfacetimesmartdev.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Tìm user theo username trước
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        
        // Nếu không có username thì thử tìm theo email
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(usernameOrEmail);
        }
        
        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail);
        }
        
        User user = userOpt.get();
        
        // SỬA Ở ĐÂY: Không cần getActive() vì User đã implement isEnabled()
        if (!user.isEnabled()) {
            throw new UsernameNotFoundException("User account is disabled: " + usernameOrEmail);
        }
        
        return user;
    }
}