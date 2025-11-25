package com.smartchat.chatfacetimesmartdev.controller;

import java.time.Instant;
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

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
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
            
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
            
        } catch (Exception e) {
            System.err.println("❌ Chat Error: " + e.getMessage());
            e.printStackTrace();
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

            ChatMessage deleteNotification = new ChatMessage();
            deleteNotification.setId(messageId);
            deleteNotification.setRoomId(roomId);
            deleteNotification.setType(ChatMessage.MessageType.DELETE);
            
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

            ChatMessage editNotification = new ChatMessage();
            editNotification.setId(messageId);
            editNotification.setRoomId(roomId);
            editNotification.setContent(newContent.trim());
            editNotification.setType(ChatMessage.MessageType.EDIT);
            
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

            ChatMessage reactionNotification = new ChatMessage();
            reactionNotification.setId(messageId);
            reactionNotification.setRoomId(roomId);
            reactionNotification.setType(ChatMessage.MessageType.REACTION);
            
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
}