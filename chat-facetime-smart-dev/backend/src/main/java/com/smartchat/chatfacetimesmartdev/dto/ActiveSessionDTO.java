package com.smartchat.chatfacetimesmartdev.dto;

import java.time.LocalDateTime;
import java.time.Duration;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSessionDTO {
    private Long id;
    private String sessionId;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String ipAddress;
    private String userAgent;
    private String deviceInfo;
    private LocalDateTime loginTime;
    private LocalDateTime lastActivity;
    private String status;
    
    public String getDuration() {
        if (loginTime == null) return "N/A";
        LocalDateTime endTime = lastActivity != null ? lastActivity : LocalDateTime.now();
        Duration dur = Duration.between(loginTime, endTime);
        long hours = dur.toHours();
        long minutes = dur.toMinutes() % 60;
        long seconds = dur.getSeconds() % 60;
        
        if (hours > 0) {
            return String.format("%dh %dm %ds", hours, minutes, seconds);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds);
        } else {
            return String.format("%ds", seconds);
        }
    }
}

