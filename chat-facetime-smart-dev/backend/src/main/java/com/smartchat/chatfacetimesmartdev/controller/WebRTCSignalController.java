package com.smartchat.chatfacetimesmartdev.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.smartchat.chatfacetimesmartdev.dto.UserPresence;
import com.smartchat.chatfacetimesmartdev.service.RoomPresenceService;

@Controller
public class WebRTCSignalController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private RoomPresenceService presenceService;
    
    @MessageMapping("/signal/{roomId}")
    public void handleSignal(@DestinationVariable String roomId, @Payload Map<String, Object> signal) {
        try {
            String signalType = getStringSafe(signal, "type");
            String fromUserId = extractUserId(signal);
            
            System.out.println("🎯 WEBRTC SIGNAL - Room: " + roomId);
            System.out.println("📨 Type: " + signalType);
            System.out.println("👤 From: " + fromUserId);
            
            // Validate signal type
            if (!isValidSignalType(signalType)) {
                System.err.println("❌ Invalid signal type: " + signalType);
                return;
            }
            
            // 🆕 XỬ LÝ JOIN SIGNAL - Thêm user vào presence
            if ("join".equals(signalType)) {
                handleJoinSignal(roomId, signal);
            }
            // 🆕 XỬ LÝ LEAVE SIGNAL - Xóa user khỏi presence
            else if ("leave".equals(signalType)) {
                handleLeaveSignal(roomId, signal);
            }
            
            // Add server metadata
            signal.put("serverProcessed", true);
            signal.put("serverTimestamp", System.currentTimeMillis());
            
            // Broadcast to room
            messagingTemplate.convertAndSend("/topic/signal/" + roomId, signal);
            System.out.println("✅ Signal broadcasted to " + roomId);
            
        } catch (Exception e) {
            System.err.println("❌ Signal handling error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 🆕 Xử lý join signal
    private void handleJoinSignal(String roomId, Map<String, Object> signal) {
        try {
            Object userObj = signal.get("user");
            if (userObj instanceof Map) {
                Map<?, ?> userMap = (Map<?, ?>) userObj;
                
                String userId = getStringFromMap(userMap, "id");
                String username = getStringFromMap(userMap, "username");
                String fullName = getStringFromMap(userMap, "fullName");
                
                if (userId != null) {
                    UserPresence userPresence = new UserPresence(
                        userId, 
                        username != null ? username : userId,
                        fullName != null ? fullName : username,
                        "online", 
                        System.currentTimeMillis()
                    );
                    
                    presenceService.addOrUpdate(roomId, userPresence);
                    System.out.println("✅ Added user to WebRTC presence: " + userId);
                    
                    // 🆕 Broadcast presence update
                    broadcastPresenceUpdate(roomId);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error handling join signal: " + e.getMessage());
        }
    }
    
    // 🆕 Xử lý leave signal
    private void handleLeaveSignal(String roomId, Map<String, Object> signal) {
        try {
            String userId = extractUserId(signal);
            
            if (userId != null && !"unknown".equals(userId)) {
                presenceService.remove(roomId, userId);
                System.out.println("✅ Removed user from WebRTC presence: " + userId);
                
                // 🆕 Broadcast presence update
                broadcastPresenceUpdate(roomId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error handling leave signal: " + e.getMessage());
        }
    }
    
    // 🆕 Broadcast presence update
    private void broadcastPresenceUpdate(String roomId) {
        try {
            // Gửi presence update đến tất cả clients trong phòng
            Map<String, Object> presenceUpdate = Map.of(
                "type", "webrtc_presence_update",
                "roomId", roomId,
                "timestamp", System.currentTimeMillis(),
                "message", "Presence updated via WebRTC signaling"
            );
            
            messagingTemplate.convertAndSend("/topic/presence/" + roomId, presenceUpdate);
            System.out.println("📊 WebRTC presence update broadcasted for room: " + roomId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting presence update: " + e.getMessage());
        }
    }
    
    private boolean isValidSignalType(String type) {
        return type != null && (
            type.equals("offer") || 
            type.equals("answer") || 
            type.equals("ice-candidate") || 
            type.equals("join") || 
            type.equals("leave")
        );
    }
    
    private String extractUserId(Map<String, Object> signal) {
        try {
            Object userObj = signal.get("user");
            if (userObj instanceof Map) {
                Map<?, ?> userMap = (Map<?, ?>) userObj;
                Object userId = userMap.get("id");
                return userId != null ? userId.toString() : "unknown";
            }
            return "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }
    
    private String getStringSafe(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        Object value = map.get(key);
        if (value instanceof String) return (String) value;
        if (value != null) return value.toString();
        return null;
    }
    
    // 🆕 Helper method để lấy string từ Map<?, ?>
    private String getStringFromMap(Map<?, ?> map, String key) {
        if (map == null || key == null) return null;
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
}