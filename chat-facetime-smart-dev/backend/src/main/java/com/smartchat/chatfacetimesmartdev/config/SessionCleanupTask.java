package com.smartchat.chatfacetimesmartdev.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.smartchat.chatfacetimesmartdev.service.SecurityService;

@Component
public class SessionCleanupTask {
    
    @Autowired
    private SecurityService securityService;
    
    /**
     * Cleanup expired sessions mỗi 5 phút
     */
    @Scheduled(fixedRate = 300000) // 5 minutes = 300000 milliseconds
    public void cleanupExpiredSessions() {
        try {
            int cleanedCount = securityService.cleanupExpiredSessions();
            if (cleanedCount > 0) {
                System.out.println("Cleaned up " + cleanedCount + " expired sessions");
            }
        } catch (Exception e) {
            System.err.println("Error cleaning up expired sessions: " + e.getMessage());
        }
    }
}


