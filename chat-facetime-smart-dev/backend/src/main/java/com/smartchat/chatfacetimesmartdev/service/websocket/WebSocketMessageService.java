package com.smartchat.chatfacetimesmartdev.service.websocket;


import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.RoomMemberResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.UserResponse;
import com.smartchat.chatfacetimesmartdev.entity.Message;
import com.smartchat.chatfacetimesmartdev.entity.Room;
import com.smartchat.chatfacetimesmartdev.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketMessageService {
    @Lazy
    private final SimpMessagingTemplate messagingTemplate;

    // Message Events
    public void broadcastNewMessage(Message message, Room room) {
        try {
            MessageResponse messageResponse = convertToMessageResponse(message);
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "NEW_MESSAGE");
            payload.put("message", messageResponse);
            payload.put("roomId", room.getId());

            messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/messages", payload);
            log.debug("Broadcasted new message to room {}: {}", room.getId(), message.getId());
        } catch (Exception e) {
            log.error("Error broadcasting new message: {}", e.getMessage(), e);
        }
    }

    public void broadcastMessageUpdated(Message message, Room room) {
        try {
            MessageResponse messageResponse = convertToMessageResponse(message);
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "MESSAGE_UPDATED");
            payload.put("message", messageResponse);
            payload.put("roomId", room.getId());

            messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/messages", payload);
            log.debug("Broadcasted message update to room {}: {}", room.getId(), message.getId());
        } catch (Exception e) {
            log.error("Error broadcasting message update: {}", e.getMessage(), e);
        }
    }

    public void broadcastMessageDeleted(Long messageId, Long roomId, Long deletedBy) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "MESSAGE_DELETED");
            payload.put("messageId", messageId);
            payload.put("roomId", roomId);
            payload.put("deletedBy", deletedBy);
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/messages", payload);
            log.debug("Broadcasted message deletion to room {}: {}", roomId, messageId);
        } catch (Exception e) {
            log.error("Error broadcasting message deletion: {}", e.getMessage(), e);
        }
    }

    // Message Reactions
    public void broadcastMessageReaction(Long messageId, Long roomId, String reaction, User user, boolean isAdded) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", isAdded ? "REACTION_ADDED" : "REACTION_REMOVED");
            payload.put("messageId", messageId);
            payload.put("roomId", roomId);
            payload.put("reaction", reaction);
            payload.put("user", convertToUserResponse(user));
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/reactions", payload);
            log.debug("Broadcasted reaction {} to message {} in room {}", reaction, messageId, roomId);
        } catch (Exception e) {
            log.error("Error broadcasting reaction: {}", e.getMessage(), e);
        }
    }

    // Room Events
    public void broadcastUserJoined(Room room, User user, RoomMemberResponse memberResponse) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "USER_JOINED");
            payload.put("roomId", room.getId());
            payload.put("user", convertToUserResponse(user));
            payload.put("member", memberResponse);
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/presence", payload);
            log.debug("Broadcasted user joined to room {}: {}", room.getId(), user.getUsername());
        } catch (Exception e) {
            log.error("Error broadcasting user joined: {}", e.getMessage(), e);
        }
    }

    public void broadcastUserLeft(Room room, User user) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "USER_LEFT");
            payload.put("roomId", room.getId());
            payload.put("user", convertToUserResponse(user));
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/presence", payload);
            log.debug("Broadcasted user left to room {}: {}", room.getId(), user.getUsername());
        } catch (Exception e) {
            log.error("Error broadcasting user left: {}", e.getMessage(), e);
        }
    }

    // Typing Indicators
    public void broadcastTypingStart(Long roomId, User user) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "TYPING_START");
            payload.put("roomId", roomId);
            payload.put("user", convertToUserResponse(user));
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing", payload);
            log.debug("Broadcasted typing start in room {}: {}", roomId, user.getUsername());
        } catch (Exception e) {
            log.error("Error broadcasting typing start: {}", e.getMessage(), e);
        }
    }

    public void broadcastTypingStop(Long roomId, User user) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "TYPING_STOP");
            payload.put("roomId", roomId);
            payload.put("user", convertToUserResponse(user));
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing", payload);
            log.debug("Broadcasted typing stop in room {}: {}", roomId, user.getUsername());
        } catch (Exception e) {
            log.error("Error broadcasting typing stop: {}", e.getMessage(), e);
        }
    }

    // Room Updates
    public void broadcastRoomUpdated(Room room) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "ROOM_UPDATED");
            payload.put("roomId", room.getId());
            payload.put("name", room.getName());
            payload.put("description", room.getDescription());
            payload.put("type", room.getType());
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/info", payload);
            log.debug("Broadcasted room update: {}", room.getId());
        } catch (Exception e) {
            log.error("Error broadcasting room update: {}", e.getMessage(), e);
        }
    }

    public void broadcastRoomDeleted(Long roomId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "ROOM_DELETED");
            payload.put("roomId", roomId);
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/info", payload);
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/messages", payload);
            log.debug("Broadcasted room deletion: {}", roomId);
        } catch (Exception e) {
            log.error("Error broadcasting room deletion: {}", e.getMessage(), e);
        }
    }

    // User Status Updates
    public void broadcastUserStatusUpdate(User user) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "USER_STATUS_CHANGED");
            payload.put("user", convertToUserResponse(user));
            payload.put("timestamp", System.currentTimeMillis());

            // Broadcast to all rooms the user is in
            messagingTemplate.convertAndSend("/topic/user/status", payload);
            log.debug("Broadcasted user status update: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Error broadcasting user status update: {}", e.getMessage(), e);
        }
    }

    // Private methods for conversion
    private MessageResponse convertToMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .type(message.getType())
                .language(message.getLanguage())
                .fileName(message.getFileName())
                .fileUrl(message.getFileUrl())
                .fileSize(message.getFileSize())
                .mimeType(message.getMimeType())
                .reactions(message.getReactionsMap())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .deleted(message.getDeleted())
                .build();
    }

    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .build();
    }
}
