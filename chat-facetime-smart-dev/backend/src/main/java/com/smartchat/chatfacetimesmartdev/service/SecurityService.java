package com.smartchat.chatfacetimesmartdev.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartchat.chatfacetimesmartdev.dto.ActiveSessionDTO;
import com.smartchat.chatfacetimesmartdev.entity.LoginSession;
import com.smartchat.chatfacetimesmartdev.entity.LoginSession.SessionStatus;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.LoginSessionRepository;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;

@Service
public class SecurityService {
    
    @Autowired
    private LoginSessionRepository loginSessionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private static final int SESSION_TIMEOUT_MINUTES = 30; // 30 minutes timeout
    
    /**
     * Tạo login session khi user đăng nhập
     */
    @Transactional
    public LoginSession createLoginSession(Long userId, String ipAddress, String userAgent, String deviceInfo) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Tạo session ID
        String sessionId = UUID.randomUUID().toString();
        
        // Tạo login session
        LoginSession session = new LoginSession();
        session.setSessionId(sessionId);
        session.setUser(user);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setDeviceInfo(deviceInfo);
        session.setLoginTime(LocalDateTime.now());
        session.setLastActivity(LocalDateTime.now());
        session.setStatus(SessionStatus.ACTIVE);
        
        return loginSessionRepository.save(session);
    }
    
    /**
     * Lấy danh sách active sessions
     */
    public List<ActiveSessionDTO> getActiveSessions() {
        try {
            List<LoginSession> sessions = loginSessionRepository.findByStatusOrderByLastActivityDesc(SessionStatus.ACTIVE);
            return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting active sessions: " + e.getMessage());
            e.printStackTrace();
            // Trả về empty list nếu có lỗi (bảng có thể chưa tồn tại)
            return new java.util.ArrayList<>();
        }
    }
    
    /**
     * Lấy active sessions theo userId
     */
    public List<ActiveSessionDTO> getActiveSessionsByUserId(Long userId) {
        try {
            List<LoginSession> sessions = loginSessionRepository.findByUserIdAndStatusOrderByLastActivityDesc(userId, SessionStatus.ACTIVE);
            return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting active sessions by user id: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    /**
     * Force logout session
     */
    @Transactional
    public boolean forceLogout(String sessionId) {
        Optional<LoginSession> sessionOpt = loginSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            LoginSession session = sessionOpt.get();
            session.setStatus(SessionStatus.FORCE_LOGOUT);
            session.setLastActivity(LocalDateTime.now());
            loginSessionRepository.save(session);
            return true;
        }
        return false;
    }
    
    /**
     * Force logout tất cả sessions của user
     */
    @Transactional
    public int forceLogoutAllUserSessions(Long userId) {
        List<LoginSession> sessions = loginSessionRepository.findByUserIdAndStatus(userId, SessionStatus.ACTIVE);
        sessions.forEach(session -> {
            session.setStatus(SessionStatus.FORCE_LOGOUT);
            session.setLastActivity(LocalDateTime.now());
        });
        loginSessionRepository.saveAll(sessions);
        return sessions.size();
    }
    
    /**
     * Cập nhật last activity
     */
    @Transactional
    public void updateLastActivity(String sessionId) {
        Optional<LoginSession> sessionOpt = loginSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            LoginSession session = sessionOpt.get();
            if (session.getStatus() == SessionStatus.ACTIVE) {
                session.setLastActivity(LocalDateTime.now());
                loginSessionRepository.save(session);
            }
        }
    }
    
    /**
     * Cleanup expired sessions
     */
    @Transactional
    public int cleanupExpiredSessions() {
        try {
            LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(SESSION_TIMEOUT_MINUTES);
            
            // Expire old sessions
            int expiredCount = loginSessionRepository.expireOldSessions(
                expiryTime, 
                SessionStatus.ACTIVE, 
                SessionStatus.EXPIRED
            );
            
            // Delete very old expired sessions (older than 7 days)
            LocalDateTime deleteBefore = LocalDateTime.now().minusDays(7);
            int deletedCount = loginSessionRepository.deleteExpiredSessions(deleteBefore, SessionStatus.EXPIRED);
            
            return expiredCount + deletedCount;
        } catch (Exception e) {
            System.err.println("Error cleaning up expired sessions: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }
    
    /**
     * Lấy login history
     */
    public List<ActiveSessionDTO> getLoginHistory(int days) {
        try {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<LoginSession> sessions = loginSessionRepository.findAll().stream()
                .filter(session -> session.getLoginTime() != null && session.getLoginTime().isAfter(startDate))
                .sorted((a, b) -> b.getLoginTime().compareTo(a.getLoginTime()))
                .collect(Collectors.toList());
            
            return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting login history: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    /**
     * Lấy thống kê sessions
     */
    public java.util.Map<String, Object> getSessionStats() {
        try {
            long activeSessions = loginSessionRepository.countByStatus(SessionStatus.ACTIVE);
            LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            long todayLogins = loginSessionRepository.countSessionsSince(todayStart);
            
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("activeSessions", activeSessions);
            stats.put("todayLogins", todayLogins);
            stats.put("totalSessions", loginSessionRepository.count());
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error getting session stats: " + e.getMessage());
            e.printStackTrace();
            // Trả về stats mặc định nếu có lỗi
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("activeSessions", 0);
            stats.put("todayLogins", 0);
            stats.put("totalSessions", 0);
            return stats;
        }
    }
    
    /**
     * Convert LoginSession to ActiveSessionDTO
     */
    private ActiveSessionDTO convertToDTO(LoginSession session) {
        ActiveSessionDTO dto = new ActiveSessionDTO();
        dto.setId(session.getId());
        dto.setSessionId(session.getSessionId());
        
        // Kiểm tra user có tồn tại không
        if (session.getUser() != null) {
            dto.setUserId(session.getUser().getId());
            dto.setUsername(session.getUser().getUsername());
            dto.setEmail(session.getUser().getEmail());
            dto.setFullName(session.getUser().getFullName());
        } else {
            dto.setUserId(null);
            dto.setUsername("Unknown");
            dto.setEmail("Unknown");
            dto.setFullName("Unknown");
        }
        
        dto.setIpAddress(session.getIpAddress());
        dto.setUserAgent(session.getUserAgent());
        dto.setDeviceInfo(session.getDeviceInfo());
        dto.setLoginTime(session.getLoginTime());
        dto.setLastActivity(session.getLastActivity());
        // Duration được tính tự động qua getter
        dto.setStatus(session.getStatus() != null ? session.getStatus().name() : "UNKNOWN");
        
        return dto;
    }
}

