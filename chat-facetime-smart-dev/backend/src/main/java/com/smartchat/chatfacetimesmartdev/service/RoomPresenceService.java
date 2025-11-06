package com.smartchat.chatfacetimesmartdev.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.smartchat.chatfacetimesmartdev.dto.UserPresence;

@Service
public class RoomPresenceService {
    private final Map<String, Map<String, UserPresence>> roomPresence = new ConcurrentHashMap<>();

    public void addOrUpdate(String roomId, UserPresence user) {
        roomPresence.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
                   .put(user.getUserId(), user);
    }

    public void remove(String roomId, String userId) {
        Map<String, UserPresence> roomUsers = roomPresence.get(roomId);
        if (roomUsers != null) {
            roomUsers.remove(userId);
            if (roomUsers.isEmpty()) {
                roomPresence.remove(roomId);
            }
        }
    }

    public List<UserPresence> list(String roomId) {
        Map<String, UserPresence> roomUsers = roomPresence.get(roomId);
        return roomUsers != null ? new ArrayList<>(roomUsers.values()) : new ArrayList<>();
    }

    public UserPresence getUser(String roomId, String userId) {
        Map<String, UserPresence> roomUsers = roomPresence.get(roomId);
        return roomUsers != null ? roomUsers.get(userId) : null;
    }

    // Giữ lại các method cần thiết, xóa bớt method không dùng
    public boolean isUserInRoom(String roomId, String userId) {
        Map<String, UserPresence> roomUsers = roomPresence.get(roomId);
        return roomUsers != null && roomUsers.containsKey(userId);
    }

    public int getRoomUserCount(String roomId) {
        Map<String, UserPresence> roomUsers = roomPresence.get(roomId);
        return roomUsers != null ? roomUsers.size() : 0;
    }
}