package com.smartchat.chatfacetimesmartdev.dto;

import jakarta.validation.constraints.NotBlank;

public class RoomJoinDto {
    
    @NotBlank(message = "Room ID is required")
    private String roomId;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    private String password; // For private rooms
    
    // THÊM CÁC FIELD MỚI
    private String username;
    private String fullName;
    private String email;

    // Getters and Setters
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // THÊM GETTER/SETTER CHO CÁC FIELD MỚI
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}