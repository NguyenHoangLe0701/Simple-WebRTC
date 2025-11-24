package com.smartchat.chatfacetimesmartdev.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.smartchat.chatfacetimesmartdev.dto.UserPresence;

@Service
public class InMemoryPresenceService implements PresenceService {
    
    private final Map<String, UserPresence> onlineUsers = new ConcurrentHashMap<>();
    private final Map<String, String> userSessions = new ConcurrentHashMap<>();

    @Override
    public void userConnected(String userId, String sessionId, String fullName) {
        UserPresence user = new UserPresence();
        user.setUserId(userId);
        user.setFullName(fullName);
        user.setStatus("online");
        user.setLastSeen(LocalDateTime.now());
        user.setInCall(false);
        
        onlineUsers.put(userId, user);
        userSessions.put(sessionId, userId);
    }

    @Override
    public void userDisconnected(String sessionId) {
        String userId = userSessions.remove(sessionId);
        if (userId != null) {
            UserPresence user = onlineUsers.get(userId);
            if (user != null) {
                user.setStatus("offline");
                user.setLastSeen(LocalDateTime.now());
            }
        }
    }

    @Override
    public void updateUserStatus(String userId, String status) {
        UserPresence user = onlineUsers.get(userId);
        if (user != null) {
            user.setStatus(status);
            user.setLastSeen(LocalDateTime.now());
        }
    }

    @Override
    public List<UserPresence> getOnlineUsers() {
        return onlineUsers.values().stream()
                .filter(user -> "online".equals(user.getStatus()))
                .toList();
    }

    @Override
    public UserPresence getUserPresence(String userId) {
        return onlineUsers.get(userId);
    }

    @Override
    public void updateCallStatus(String userId, boolean inCall) {
        UserPresence user = onlineUsers.get(userId);
        if (user != null) {
            user.setInCall(inCall);
            user.setLastSeen(LocalDateTime.now());
        }
    }
}