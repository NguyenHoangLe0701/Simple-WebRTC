package com.smartchat.chatfacetimesmartdev.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.smartchat.chatfacetimesmartdev.model.ChatMessage;

@Controller
@SuppressWarnings("unchecked")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // === CHAT MESSAGE ===
    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            System.out.println("💬 Chat Message - Room: " + roomId);
            System.out.println("📦 Payload keys: " + payload.keySet());
            
            ChatMessage message = new ChatMessage();
            
            message.setId(getStringSafe(payload, "id"));
            message.setContent(getStringSafe(payload, "content"));
            message.setSender(getStringSafe(payload, "sender"));
            message.setSenderId(getStringSafe(payload, "senderId"));
            message.setRoomId(roomId);
            
            String typeStr = getStringSafe(payload, "type");
            if (typeStr != null) {
                try {
                    message.setType(ChatMessage.MessageType.fromValue(typeStr));
                } catch (Exception e) {
                    message.setType(ChatMessage.MessageType.TEXT);
                }
            } else {
                message.setType(ChatMessage.MessageType.TEXT);
            }
            
            message.setTimestamp(LocalDateTime.now());
            message.setAvatar(getStringSafe(payload, "avatar"));
            
            if (message.getContent() == null || message.getContent().trim().isEmpty()) {
                System.err.println("❌ Message content is empty");
                return;
            }
            
            if (message.getId() == null) {
                message.setId(UUID.randomUUID().toString());
            }
            if (message.getSenderId() == null && message.getSender() != null) {
                message.setSenderId(message.getSender());
            }
            
            System.out.println("📨 Sending: " + message.getSender() + " - " + 
                (message.getContent().length() > 30 ? 
                 message.getContent().substring(0, 30) + "..." : message.getContent()));
            
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
            System.out.println("✅ Broadcast to room: " + roomId);
            
        } catch (Exception e) {
            System.err.println("❌ Chat Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // === WEBRTC SIGNALING - ĐÃ SỬA ===
    @MessageMapping("/signal/{roomId}")
public void handleSignal(@DestinationVariable String roomId, @Payload Map<String, Object> signal) {
    try {
        System.out.println("🎯 WEBRTC SIGNAL RECEIVED - Room: " + roomId);
        System.out.println("📨 Signal type: " + signal.get("type"));
        
        // 🆕 FIX USER PARSING
        Object userObj = signal.get("user");
        String fromUser = "unknown";
        
        if (userObj instanceof Map) {
            Map<?, ?> userMap = (Map<?, ?>) userObj;
            Object userId = userMap.get("id");
            if (userId != null) {
                fromUser = userId.toString();
            }
        }
        
        System.out.println("👤 From user ID: " + fromUser);
        System.out.println("🎯 Target user: " + signal.get("targetUserId"));
        System.out.println("📊 Full signal: " + signal);
        
        String signalType = getStringSafe(signal, "type");
        
        // 🆕 ĐẢM BẢO USER OBJECT ĐƯỢC GIỮ NGUYÊN
        Map<String, Object> enhancedSignal = new HashMap<>(signal);
        enhancedSignal.put("serverTimestamp", System.currentTimeMillis());
        
        System.out.println("✅ Forwarding signal to /topic/signal/" + roomId);
        messagingTemplate.convertAndSend("/topic/signal/" + roomId, enhancedSignal);
        System.out.println("✅ Signal broadcasted successfully");
        
    } catch (Exception e) {
        System.err.println("❌ Signal Error: " + e.getMessage());
        e.printStackTrace();
    }
}
    @MessageMapping("/test/{roomId}")
    public void testEndpoint(@DestinationVariable String roomId, @Payload String testMessage) {
        System.out.println("=== 🧪 TEST ENDPOINT CALLED ===");
        System.out.println("Room: " + roomId);
        System.out.println("Message: " + testMessage);
        System.out.println("=== TEST END ===");
        
        Map<String, Object> response = Map.of(
            "type", "test-response",
            "message", "Backend received: " + testMessage,
            "roomId", roomId,
            "timestamp", LocalDateTime.now().toString()
        );
        
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);
    }
    
    // === DEBUG ENDPOINT ===
    @MessageMapping("/debug/{roomId}")
    public void debugConnection(@DestinationVariable String roomId, @Payload String debugMessage) {
        System.out.println("🐛 Debug - Room: " + roomId + " - " + debugMessage);
        
        Map<String, Object> debugResponse = Map.of(
            "type", "debug",
            "message", "Backend received: " + debugMessage,
            "roomId", roomId,
            "timestamp", LocalDateTime.now().toString()
        );
        
        messagingTemplate.convertAndSend("/topic/debug/" + roomId, debugResponse);
        System.out.println("✅ Debug response sent");
    }

    // === HELPER METHOD ===
    private String getStringSafe(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        Object value = map.get(key);
        if (value instanceof String) return (String) value;
        if (value != null) return value.toString();
        return null;
    }
}