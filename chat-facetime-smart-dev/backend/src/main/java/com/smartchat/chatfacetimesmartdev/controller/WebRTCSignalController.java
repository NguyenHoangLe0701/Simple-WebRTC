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
            
            boolean isImportantSignal = signalType != null && 
                (signalType.equals("join") || signalType.equals("leave") || 
                 signalType.equals("offer") || signalType.equals("answer"));
            
            if (!isValidSignalType(signalType)) {
                System.err.println("❌ Invalid signal type: " + signalType);
                return;
            }
            
            switch (signalType) {
                case "join" -> handleJoinSignal(roomId, signal);
                case "leave" -> handleLeaveSignal(roomId, signal);
                case "offer", "answer" -> {
                }
                case "ice-candidate" -> {
                }
                default -> {
                    if (isImportantSignal) {
                        System.err.println("⚠️ Unhandled signal type: " + signalType);
                    }
                }
            }
            
            Map<String, Object> broadcastSignal = new HashMap<>(signal);
            
            broadcastSignal.put("serverProcessed", true);
            broadcastSignal.put("serverTimestamp", System.currentTimeMillis());
            broadcastSignal.put("fromUserId", fromUserId);
            
            messagingTemplate.convertAndSend("/topic/signal/" + roomId, broadcastSignal);
            
        } catch (Exception e) {
            System.err.println("❌ Signal handling error: " + e.getMessage());
        }
    }
    
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
    
    private void handleLeaveSignal(String roomId, Map<String, Object> signal) {
        try {
            String userId = extractUserId(signal);
            
            if (userId != null && !userId.equals("unknown")) {
                presenceService.remove(roomId, userId);
                
                broadcastFullPresenceUpdate(roomId);
            } else {
                System.err.println("⚠️ Invalid user ID in leave signal");
            }
        } catch (Exception e) {
            System.err.println("❌ Error handling leave signal: " + e.getMessage());
        }
    }
    
    private void broadcastFullPresenceUpdate(String roomId) {
        try {
            List<UserPresence> userList = presenceService.list(roomId);
            
            Map<String, Object> presenceUpdate = new HashMap<>();
            presenceUpdate.put("type", "webrtc_presence_update");
            presenceUpdate.put("roomId", roomId);
            presenceUpdate.put("timestamp", System.currentTimeMillis());
            presenceUpdate.put("users", userList);
            presenceUpdate.put("count", userList.size());
            presenceUpdate.put("message", "Presence updated via WebRTC signaling");
            
            messagingTemplate.convertAndSend("/topic/presence/" + roomId, presenceUpdate);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting presence update: " + e.getMessage());
            broadcastBasicPresenceUpdate(roomId);
        }
    }
    
    private void broadcastBasicPresenceUpdate(String roomId) {
        try {
            Map<String, Object> presenceUpdate = new HashMap<>();
            presenceUpdate.put("type", "webrtc_presence_update");
            presenceUpdate.put("roomId", roomId);
            presenceUpdate.put("timestamp", System.currentTimeMillis());
            presenceUpdate.put("message", "Presence updated via WebRTC signaling");
            
            messagingTemplate.convertAndSend("/topic/presence/" + roomId, presenceUpdate);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting basic presence update: " + e.getMessage());
        }
    }
    
    private boolean isValidSignalType(String type) {
        return type != null && (
            type.equals("offer") || 
            type.equals("answer") || 
            type.equals("ice-candidate") || 
            type.equals("join") || 
            type.equals("leave") ||
            type.equals("candidate") ||
            type.equals("ready") ||
            type.equals("hangup")
        );
    }
    
    private String extractUserId(Map<String, Object> signal) {
        try {
            Object fromUserIdObj = signal.get("fromUserId");
            if (fromUserIdObj != null) {
                return fromUserIdObj.toString();
            }
            
            Object userObj = signal.get("user");
            if (userObj instanceof Map<?, ?> userMap) {
                Object userId = userMap.get("id");
                if (userId != null) return userId.toString();
                
                Object username = userMap.get("username");
                if (username != null) return username.toString();
            }
            
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