package com.smartchat.chatfacetimesmartdev.service;

import java.util.List;

import com.smartchat.chatfacetimesmartdev.dto.UserPresence;

public interface PresenceService {
    void userConnected(String userId, String sessionId, String fullName);
    void userDisconnected(String sessionId);
    void updateUserStatus(String userId, String status);
    List<UserPresence> getOnlineUsers();
    UserPresence getUserPresence(String userId);
    void updateCallStatus(String userId, boolean inCall);
}