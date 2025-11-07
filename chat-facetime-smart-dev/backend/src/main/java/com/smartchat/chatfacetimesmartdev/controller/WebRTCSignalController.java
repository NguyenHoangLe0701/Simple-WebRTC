package com.smartchat.chatfacetimesmartdev.controller;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

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
            
            // 🆕 FIX: Sử dụng switch expression
            switch (signalType) {
                case "join" -> handleJoinSignal(roomId, signal);
                case "leave" -> handleLeaveSignal(roomId, signal);
                case "offer", "answer", "ice-candidate" -> 
                    System.out.println("🔊 Broadcasting WebRTC signal: " + signalType);
                default -> System.err.println("⚠️ Unhandled signal type: " + signalType);
            }
            
            // 🆕 FIX: Tạo signal mới để tránh modify original
            Map<String, Object> broadcastSignal = new HashMap<>(signal);
            
            // Add server metadata
            broadcastSignal.put("serverProcessed", true);
            broadcastSignal.put("serverTimestamp", System.currentTimeMillis());
            broadcastSignal.put("fromUserId", fromUserId);
            
            // Broadcast to room
            messagingTemplate.convertAndSend("/topic/signal/" + roomId, broadcastSignal);
            System.out.println("✅ Signal broadcasted to " + roomId + ", type: " + signalType);
            
        } catch (Exception e) {
            System.err.println("❌ Signal handling error: " + e.getMessage());
        }
    }
    
    // 🆕 FIX: Xử lý join signal chi tiết hơn
    private void handleJoinSignal(String roomId, Map<String, Object> signal) {
        try {
            Object userObj = signal.get("user");
            if (userObj instanceof Map<?, ?> userMap) {
                
                String userId = getStringFromMap(userMap, "id");
                String username = getStringFromMap(userMap, "username");
                String fullName = getStringFromMap(userMap, "fullName");
                
                if (userId != null && !userId.equals("unknown")) {
                    UserPresence userPresence = new UserPresence(
                        userId, 
                        username != null ? username : userId,
                        fullName != null ? fullName : username,
                        "online", 
                        System.currentTimeMillis()
                    );
                    
                    presenceService.addOrUpdate(roomId, userPresence);
                    System.out.println("✅ Added user to WebRTC presence: " + userId + " in room: " + roomId);
                    
                    // 🆕 FIX: Broadcast presence update với danh sách users
                    broadcastFullPresenceUpdate(roomId);
                } else {
                    System.err.println("⚠️ Invalid user ID in join signal");
                }
            } else {
                System.err.println("⚠️ User object missing or invalid in join signal");
            }
        } catch (Exception e) {
            System.err.println("❌ Error handling join signal: " + e.getMessage());
        }
    }
    
    // 🆕 FIX: Xử lý leave signal chi tiết hơn
    private void handleLeaveSignal(String roomId, Map<String, Object> signal) {
        try {
            String userId = extractUserId(signal);
            
            if (userId != null && !userId.equals("unknown")) {
                presenceService.remove(roomId, userId);
                System.out.println("✅ Removed user from WebRTC presence: " + userId + " from room: " + roomId);
                
                // 🆕 FIX: Broadcast presence update với danh sách users
                broadcastFullPresenceUpdate(roomId);
            } else {
                System.err.println("⚠️ Invalid user ID in leave signal");
            }
        } catch (Exception e) {
            System.err.println("❌ Error handling leave signal: " + e.getMessage());
        }
    }
    
    // 🆕 FIX: Broadcast presence update với full user list - SỬ DỤNG METHOD list() CÓ SẴN
    private void broadcastFullPresenceUpdate(String roomId) {
        try {
            // 🆕 FIX: Sử dụng method list() có sẵn trong RoomPresenceService
            List<UserPresence> userList = presenceService.list(roomId);
            
            Map<String, Object> presenceUpdate = new HashMap<>();
            presenceUpdate.put("type", "webrtc_presence_update");
            presenceUpdate.put("roomId", roomId);
            presenceUpdate.put("timestamp", System.currentTimeMillis());
            presenceUpdate.put("users", userList);
            presenceUpdate.put("count", userList.size());
            presenceUpdate.put("message", "Presence updated via WebRTC signaling");
            
            messagingTemplate.convertAndSend("/topic/presence/" + roomId, presenceUpdate);
            System.out.println("📊 WebRTC presence update broadcasted for room: " + roomId + " with " + userList.size() + " users");
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting presence update: " + e.getMessage());
            // Fallback: gửi basic presence update
            broadcastBasicPresenceUpdate(roomId);
        }
    }
    
    // 🆕 FIX: Basic presence update
    private void broadcastBasicPresenceUpdate(String roomId) {
        try {
            Map<String, Object> presenceUpdate = new HashMap<>();
            presenceUpdate.put("type", "webrtc_presence_update");
            presenceUpdate.put("roomId", roomId);
            presenceUpdate.put("timestamp", System.currentTimeMillis());
            presenceUpdate.put("message", "Presence updated via WebRTC signaling");
            
            messagingTemplate.convertAndSend("/topic/presence/" + roomId, presenceUpdate);
            System.out.println("📊 Basic presence update broadcasted for room: " + roomId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting basic presence update: " + e.getMessage());
        }
    }
    
    // 🆕 FIX: Kiểm tra signal type với nhiều loại hơn
    private boolean isValidSignalType(String type) {
        return type != null && (
            type.equals("offer") || 
            type.equals("answer") || 
            type.equals("ice-candidate") || 
            type.equals("join") || 
            type.equals("leave") ||
            type.equals("candidate") || // 🆕 Thêm alias cho ice-candidate
            type.equals("ready") ||     // 🆕 Thêm signal ready
            type.equals("hangup")       // 🆕 Thêm signal kết thúc call
        );
    }
    
    // 🆕 FIX: Extract user ID với nhiều fallback hơn
    private String extractUserId(Map<String, Object> signal) {
        try {
            // Thử lấy từ user object trước - SỬA: sử dụng pattern matching
            Object userObj = signal.get("user");
            if (userObj instanceof Map<?, ?> userMap) {
                Object userId = userMap.get("id");
                if (userId != null) return userId.toString();
                
                // Fallback: thử lấy username nếu không có id
                Object username = userMap.get("username");
                if (username != null) return username.toString();
            }
            
            // Fallback: thử lấy trực tiếp từ signal
            Object directUserId = signal.get("userId");
            if (directUserId != null) return directUserId.toString();
            
            Object fromUser = signal.get("from");
            if (fromUser != null) return fromUser.toString();
            
            return "unknown";
            
        } catch (Exception e) {
            System.err.println("⚠️ Error extracting user ID: " + e.getMessage());
            return "unknown";
        }
    }
    
    // 🆕 FIX: Get string safe với type checking tốt hơn
    private String getStringSafe(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        try {
            Object value = map.get(key);
            if (value instanceof String) return (String) value;
            if (value != null) return value.toString();
            return null;
        } catch (Exception e) {
            return null;
        }
    }
    
    // 🆕 FIX: Helper method để lấy string từ Map<?, ?>
    private String getStringFromMap(Map<?, ?> map, String key) {
        if (map == null || key == null) return null;
        try {
            Object value = map.get(key);
            if (value instanceof String str) return str;
            if (value != null) return value.toString();
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}