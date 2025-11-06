package com.smartchat.chatfacetimesmartdev.dto;

import java.time.LocalDateTime;

public class UserPresence {
    private String userId;
    private String fullName;
    private String username;
    private String status;
    private LocalDateTime lastSeen;
    private boolean inCall;
    private String avatar;

    // DEFAULT CONSTRUCTOR
    public UserPresence() {}

    // CONSTRUCTOR WITH PARAMETERS (THÊM CONSTRUCTOR NÀY)
    public UserPresence(String userId, String username, String fullName, String status, long lastSeenTimestamp) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.status = status;
        this.lastSeen = LocalDateTime.now(); // Hoặc convert từ timestamp nếu cần
        this.inCall = false;
    }

    // Getters and Setters (giữ nguyên)
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
    
    public boolean isInCall() { return inCall; }
    public void setInCall(boolean inCall) { this.inCall = inCall; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}