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
            // 🔇 GIẢM LOG - chat messages quá nhiều
            // System.out.println("💬 Chat Message - Room: " + roomId);
            // System.out.println("📦 Payload keys: " + payload.keySet());
            
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
            
            // Xử lý replyTo nếu có
            if (payload.containsKey("replyTo") && payload.get("replyTo") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> replyToMap = (Map<String, Object>) payload.get("replyTo");
                message.setReplyTo(replyToMap);
                // 🔇 GIẢM LOG
                // System.out.println("📎 ReplyTo set: " + replyToMap);
            }
            
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
            
            // 🔇 GIẢM LOG - chat messages quá nhiều
            // System.out.println("📨 Sending: " + message.getSender() + " - " + 
            //     (message.getContent().length() > 30 ? 
            //      message.getContent().substring(0, 30) + "..." : message.getContent()));
            // System.out.println("📎 ReplyTo in message: " + (message.getReplyTo() != null ? message.getReplyTo().toString() : "null"));
            
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
            // 🔇 GIẢM LOG
            // System.out.println("✅ Broadcast to room: " + roomId + " (with replyTo: " + (message.getReplyTo() != null ? "YES" : "NO") + ")");
            
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
            // 🔇 GIẢM LOG - chỉ log lỗi
            // System.out.println("🗑️ Deleting message: " + messageId + " in room " + roomId);

            if (messageId == null || messageId.trim().isEmpty()) {
                System.err.println("❌ Delete request: messageId is null or empty");
                return;
            }

            // Tạo một message đặc biệt loại DELETE để báo cho client
            ChatMessage deleteNotification = new ChatMessage();
            deleteNotification.setId(messageId); // ID của tin nhắn cần xóa
            deleteNotification.setRoomId(roomId);
            deleteNotification.setType(ChatMessage.MessageType.DELETE);
            
            // 🔇 GIẢM LOG
            // System.out.println("📤 Broadcasting DELETE message - ID: " + messageId + ", Type: " + deleteNotification.getType() + ", Room: " + roomId);
            
            // Gửi cho tất cả mọi người trong phòng (kể cả người gửi lệnh)
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, deleteNotification);
            // 🔇 GIẢM LOG
            // System.out.println("✅ Delete notification broadcasted to all users in room: " + roomId);
        } catch (Exception e) {
            System.err.println("❌ Error deleting message: " + e.getMessage());
            e.printStackTrace();
        }
    }
    @MessageMapping("/chat/{roomId}/edit")
    public void editMessage(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        try {
            String messageId = payload.get("id");
            String newContent = payload.get("content");
            // 🔇 GIẢM LOG - chỉ log lỗi
            // System.out.println("✏️ Editing message: " + messageId + " in room " + roomId);

            if (messageId == null || messageId.trim().isEmpty()) {
                System.err.println("❌ Edit request: messageId is null or empty");
                return;
            }

            if (newContent == null || newContent.trim().isEmpty()) {
                System.err.println("❌ Edit request: newContent is null or empty");
                return;
            }

            // Tạo một message đặc biệt loại EDIT
            ChatMessage editNotification = new ChatMessage();
            editNotification.setId(messageId); // ID của tin nhắn cần sửa
            editNotification.setRoomId(roomId);
            editNotification.setContent(newContent.trim()); // Nội dung mới (trim để loại bỏ khoảng trắng thừa)
            editNotification.setType(ChatMessage.MessageType.EDIT);
            
            // 🔇 GIẢM LOG
            // System.out.println("📤 Broadcasting EDIT message - ID: " + messageId + ", Type: " + editNotification.getType() + ", Content: " + newContent.substring(0, Math.min(50, newContent.length())) + "...");
            
            // Gửi cho tất cả mọi người trong phòng (kể cả người gửi lệnh)
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, editNotification);
            // 🔇 GIẢM LOG
            // System.out.println("✅ Edit notification broadcasted to all users in room: " + roomId);
        } catch (Exception e) {
            System.err.println("❌ Error editing message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 🆕 === 4. XỬ LÝ REACTION ===
    @MessageMapping("/chat/{roomId}/reaction")
    public void addReaction(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        try {
            String messageId = payload.get("id");
            String emoji = payload.get("emoji");
            // 🔇 GIẢM LOG - chỉ log lỗi
            // System.out.println("😀 Adding reaction: " + emoji + " to message " + messageId + " in room " + roomId);

            if (messageId == null || messageId.trim().isEmpty()) {
                System.err.println("❌ Reaction request: messageId is null or empty");
                return;
            }

            if (emoji == null || emoji.trim().isEmpty()) {
                System.err.println("❌ Reaction request: emoji is null or empty");
                return;
            }

            // Tạo một message đặc biệt loại REACTION
            ChatMessage reactionNotification = new ChatMessage();
            reactionNotification.setId(messageId); // ID của tin nhắn cần thêm reaction
            reactionNotification.setRoomId(roomId);
            reactionNotification.setType(ChatMessage.MessageType.REACTION);
            
            // Tạo reactions map với emoji và gửi emoji để frontend biết cần thêm emoji nào
            java.util.Map<String, Object> reactionsMap = new java.util.HashMap<>();
            reactionsMap.put(emoji, 1); // Frontend sẽ merge reactions
            reactionNotification.setReactions(reactionsMap);
            // Thêm emoji vào message để frontend biết emoji nào được thêm
            reactionNotification.setContent(emoji); // Dùng content để chứa emoji tạm thời
            
            // 🔇 GIẢM LOG
            // System.out.println("📤 Broadcasting REACTION message - MessageID: " + messageId + ", Type: " + reactionNotification.getType() + ", Emoji: " + emoji + ", Room: " + roomId);
            
            // Gửi cho tất cả mọi người trong phòng (kể cả người gửi lệnh)
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, reactionNotification);
            // 🔇 GIẢM LOG
            // System.out.println("✅ Reaction notification broadcasted to all users in room: " + roomId);
        } catch (Exception e) {
            System.err.println("❌ Error adding reaction: " + e.getMessage());
            e.printStackTrace();
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