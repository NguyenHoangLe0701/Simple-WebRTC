package com.smartchat.chatfacetimesmartdev.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebRTCSignalController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

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
}