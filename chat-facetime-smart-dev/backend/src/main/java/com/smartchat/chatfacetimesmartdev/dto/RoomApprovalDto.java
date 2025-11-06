package com.smartchat.chatfacetimesmartdev.dto;

public class RoomApprovalDto {
    
    private Long userId;  // THÊM TRƯỜNG NÀY
    private boolean approved;
    private String reason;

    // THÊM GETTER VÀ SETTER CHO userId
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Getters and Setters cũ
    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}