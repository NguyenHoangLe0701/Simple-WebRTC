package com.smartchat.chatfacetimesmartdev.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.smartchat.chatfacetimesmartdev.entity.ChatMessage;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.repository.ChatMessageRepository;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            com.smartchat.chatfacetimesmartdev.model.ChatMessage message = new com.smartchat.chatfacetimesmartdev.model.ChatMessage();
            
            message.setId(getStringSafe(payload, "id"));
            message.setContent(getStringSafe(payload, "content"));
            message.setSender(getStringSafe(payload, "sender"));
            message.setSenderId(getStringSafe(payload, "senderId"));
            message.setRoomId(roomId);
            
            String typeStr = getStringSafe(payload, "type");
            if (typeStr != null) {
                try {
                    message.setType(com.smartchat.chatfacetimesmartdev.model.ChatMessage.MessageType.fromValue(typeStr));
                } catch (Exception e) {
                    message.setType(com.smartchat.chatfacetimesmartdev.model.ChatMessage.MessageType.TEXT);
                }
            } else {
                message.setType(com.smartchat.chatfacetimesmartdev.model.ChatMessage.MessageType.TEXT);
            }
            
            message.setTimestamp(Instant.now());
            message.setAvatar(getStringSafe(payload, "avatar"));
            
            if (payload.containsKey("replyTo") && payload.get("replyTo") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> replyToMap = (Map<String, Object>) payload.get("replyTo");
                message.setReplyTo(replyToMap);
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
            
            // Lưu tin nhắn vào database
            try {
                saveMessageToDatabase(roomId, message, payload);
            } catch (Exception dbException) {
                System.err.println("⚠️ Warning: Failed to save message to database: " + dbException.getMessage());
                // Không dừng việc gửi tin nhắn real-time nếu lưu DB thất bại
            }
            
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
            
        } catch (Exception e) {
            System.err.println("❌ Chat Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Lưu tin nhắn vào database
     */
    private void saveMessageToDatabase(String roomId, com.smartchat.chatfacetimesmartdev.model.ChatMessage messageModel, Map<String, Object> payload) {
        try {
            // Tìm User từ senderId (có thể là username hoặc ID)
            User sender = null;
            String senderIdStr = messageModel.getSenderId();
            
            if (senderIdStr != null) {
                // Thử tìm theo username trước
                sender = userRepository.findByUsername(senderIdStr).orElse(null);
                
                // Nếu không tìm thấy, thử parse thành Long và tìm theo ID
                if (sender == null) {
                    try {
                        Long senderIdLong = Long.parseLong(senderIdStr);
                        sender = userRepository.findById(senderIdLong).orElse(null);
                    } catch (NumberFormatException e) {
                        // Không phải số, bỏ qua
                    }
                }
            }
            
            // Nếu không tìm thấy user, bỏ qua việc lưu (hoặc có thể tạo user ảo)
            if (sender == null) {
                System.err.println("⚠️ Warning: Could not find user with senderId: " + senderIdStr);
                return;
            }
            
            // Tạo entity để lưu vào DB
            ChatMessage messageEntity = ChatMessage.builder()
                    .roomId(roomId)
                    .sender(sender)
                    .senderName(messageModel.getSender())
                    .senderIdString(senderIdStr)
                    .content(messageModel.getContent())
                    .messageType(messageModel.getType() != null ? messageModel.getType().name() : "TEXT")
                    .timestamp(LocalDateTime.now())
                    .codeLanguage(getStringSafe(payload, "codeLanguage") != null ? getStringSafe(payload, "codeLanguage") : getStringSafe(payload, "language"))
                    .fileName(getStringSafe(payload, "fileName"))
                    .fileSize(payload.containsKey("fileSize") && payload.get("fileSize") != null ? 
                             Long.parseLong(payload.get("fileSize").toString()) : null)
                    .avatar(messageModel.getAvatar())
                    // Lưu thêm thông tin cuộc gọi nếu có
                    .callAction(getCallAction(payload))
                    .callDurationSeconds(getCallDuration(payload))
                    .build();
            
            chatMessageRepository.save(messageEntity);
            
        } catch (Exception e) {
            System.err.println("❌ Error saving message to database: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw để caller biết có lỗi
        }
    }
    @MessageMapping("/chat/{roomId}/delete")
    public void deleteMessage(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        try {
            String messageId = payload.get("id");

            if (messageId == null || messageId.trim().isEmpty()) {
                System.err.println("❌ Delete request: messageId is null or empty");
                return;
            }

            // Xóa trong database nếu có thể parse được id từ DB (ví dụ: db_123 hoặc 123)
            Long dbMessageId = parseDatabaseMessageId(messageId);
            if (dbMessageId != null) {
                try {
                    int deleted = chatMessageRepository.deleteByIdAndRoomId(dbMessageId, roomId);
                    if (deleted > 0) {
                        System.out.println("🗑️ Deleted message in DB: " + dbMessageId + " for room " + roomId);
                    } else {
                        System.err.println("⚠️ Delete requested but no DB row removed for id=" + dbMessageId + ", room=" + roomId);
                    }
                } catch (Exception dbDeleteEx) {
                    System.err.println("⚠️ Failed to delete message in DB (id=" + dbMessageId + ", room=" + roomId + "): " + dbDeleteEx.getMessage());
                }
            }

            com.smartchat.chatfacetimesmartdev.model.ChatMessage deleteNotification = new com.smartchat.chatfacetimesmartdev.model.ChatMessage();
            deleteNotification.setId(messageId);
            deleteNotification.setRoomId(roomId);
            deleteNotification.setType(com.smartchat.chatfacetimesmartdev.model.ChatMessage.MessageType.DELETE);
            
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, deleteNotification);
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

            if (messageId == null || messageId.trim().isEmpty()) {
                System.err.println("❌ Edit request: messageId is null or empty");
                return;
            }

            if (newContent == null || newContent.trim().isEmpty()) {
                System.err.println("❌ Edit request: newContent is null or empty");
                return;
            }

            com.smartchat.chatfacetimesmartdev.model.ChatMessage editNotification = new com.smartchat.chatfacetimesmartdev.model.ChatMessage();
            editNotification.setId(messageId);
            editNotification.setRoomId(roomId);
            editNotification.setContent(newContent.trim());
            editNotification.setType(com.smartchat.chatfacetimesmartdev.model.ChatMessage.MessageType.EDIT);
            
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, editNotification);
        } catch (Exception e) {
            System.err.println("❌ Error editing message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/chat/{roomId}/reaction")
    public void addReaction(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        try {
            String messageId = payload.get("id");
            String emoji = payload.get("emoji");

            if (messageId == null || messageId.trim().isEmpty()) {
                System.err.println("❌ Reaction request: messageId is null or empty");
                return;
            }

            if (emoji == null || emoji.trim().isEmpty()) {
                System.err.println("❌ Reaction request: emoji is null or empty");
                return;
            }

            com.smartchat.chatfacetimesmartdev.model.ChatMessage reactionNotification = new com.smartchat.chatfacetimesmartdev.model.ChatMessage();
            reactionNotification.setId(messageId);
            reactionNotification.setRoomId(roomId);
            reactionNotification.setType(com.smartchat.chatfacetimesmartdev.model.ChatMessage.MessageType.REACTION);
            
            java.util.Map<String, Object> reactionsMap = new java.util.HashMap<>();
            reactionsMap.put(emoji, 1);
            reactionNotification.setReactions(reactionsMap);
            reactionNotification.setContent(emoji);
            
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, reactionNotification);
        } catch (Exception e) {
            System.err.println("❌ Error adding reaction: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getStringSafe(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        Object value = map.get(key);
        if (value instanceof String) return (String) value;
        if (value != null) return value.toString();
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMapSafe(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        Object value = map.get(key);
        if (value instanceof Map) {
            return (Map<String, Object>) value;
        }
        return null;
    }

    private String getCallAction(Map<String, Object> payload) {
        Map<String, Object> callInfo = getMapSafe(payload, "callInfo");
        if (callInfo == null) return null;
        return getStringSafe(callInfo, "action");
    }

    private Long getCallDuration(Map<String, Object> payload) {
        Map<String, Object> callInfo = getMapSafe(payload, "callInfo");
        if (callInfo == null) return null;
        Object duration = callInfo.get("duration");
        if (duration == null) return null;
        try {
            return Long.parseLong(duration.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /**
     * Parse id tin nhắn được lưu trong DB (Long) từ chuỗi messageId của client.
     * Hỗ trợ các format: "db_123", "123". Trả về null nếu không parse được.
     */
    private Long parseDatabaseMessageId(String messageId) {
        if (messageId == null) return null;
        String normalized = messageId.trim();
        if (normalized.startsWith("db_")) {
            normalized = normalized.substring(3);
        }
        try {
            return Long.parseLong(normalized);
        } catch (NumberFormatException ex) {
            return null; // không phải id của DB (ví dụ UUID realtime)
        }
    }
}