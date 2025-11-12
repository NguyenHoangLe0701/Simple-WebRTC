package com.smartchat.chatfacetimesmartdev.controller;

// import java.time.LocalDateTime;
import java.time.Instant; // đổi từ LocalDateTime sang Instant để dùng chuẩn UTC
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
            
            // message.setTimestamp(LocalDateTime.now());
            message.setTimestamp(Instant.now());
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
    // 🆕 === 2. XỬ LÝ XÓA TIN NHẮN ===
    @MessageMapping("/chat/{roomId}/delete")
    public void deleteMessage(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        try {
            String messageId = payload.get("id");
            System.out.println("🗑️ Deleting message: " + messageId + " in room " + roomId);

            // Tạo một message đặc biệt loại DELETE để báo cho client
            ChatMessage deleteNotification = new ChatMessage();
            deleteNotification.setId(messageId); // ID của tin nhắn cần xóa
            deleteNotification.setRoomId(roomId);
            deleteNotification.setType(ChatMessage.MessageType.DELETE);
            
            // Gửi cho tất cả mọi người trong phòng
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, deleteNotification);
        } catch (Exception e) {
            System.err.println("❌ Error deleting message: " + e.getMessage());
        }
    }
    @MessageMapping("/chat/{roomId}/edit")
    public void editMessage(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        try {
            String messageId = payload.get("id");
            String newContent = payload.get("content");
            System.out.println("✏️ Editing message: " + messageId + " in room " + roomId);

            // Tạo một message đặc biệt loại EDIT
            ChatMessage editNotification = new ChatMessage();
            editNotification.setId(messageId); // ID của tin nhắn cần sửa
            editNotification.setRoomId(roomId);
            editNotification.setContent(newContent); // Nội dung mới
            editNotification.setType(ChatMessage.MessageType.EDIT);
            
            // Gửi cho tất cả mọi người
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, editNotification);
        } catch (Exception e) {
            System.err.println("❌ Error editing message: " + e.getMessage());
        }
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