package com.smartchat.chatfacetimesmartdev.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import com.smartchat.chatfacetimesmartdev.dto.RoomCreateDto;
import com.smartchat.chatfacetimesmartdev.dto.RoomDto;
import com.smartchat.chatfacetimesmartdev.dto.RoomJoinDto;
import com.smartchat.chatfacetimesmartdev.dto.UserPresence;
import com.smartchat.chatfacetimesmartdev.service.RoomPresenceService;
import com.smartchat.chatfacetimesmartdev.service.RoomService;

@Controller
public class RoomWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomService roomService;

    @Autowired
    private RoomPresenceService presenceService;

    @MessageMapping("/room/{roomId}/join")
    public void handleJoinRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            // ✅ Parse data
            String userId = getStringSafe(payload, "userId");
            String username = getStringSafe(payload, "username");
            String fullName = getStringSafe(payload, "fullName");
            String email = getStringSafe(payload, "email");

            // Fallback logic
            if (userId == null && username != null) userId = username;
            if (fullName == null && username != null) fullName = username;

            // Validation
            if (userId == null) {
                System.err.println("❌ Missing userId in join request");
                return;
            }

            System.out.println("👤 User joining - Room: " + roomId + ", User: " + fullName + " (" + userId + ")");

            // Check or create room
            try {
                roomService.getRoomInfo(roomId);
            } catch (Exception e) {
                try {
                    RoomCreateDto createDto = new RoomCreateDto();
                    createDto.setName(roomId);
                    createDto.setRoomId(roomId);
                    createDto.setDescription("Auto-created room");
                    createDto.setHostId(userId);
                    createDto.setHostName(fullName != null ? fullName : username);
                    createDto.setPrivate(false);
                    createDto.setMaxParticipants(50);
                    createDto.setAllowScreenShare(true);
                    createDto.setAllowChat(true);
                    roomService.createRoom(createDto);
                    System.out.println("🆕 Auto-created room: " + roomId);
                } catch (Exception ex) {
                    System.err.println("❌ Error creating room: " + ex.getMessage());
                    return;
                }
            }

            // Join room
            RoomJoinDto joinDto = new RoomJoinDto();
            joinDto.setUserId(userId);
            joinDto.setUsername(username);
            joinDto.setFullName(fullName);
            joinDto.setEmail(email);

            RoomDto roomInfo = roomService.getRoomInfo(roomId);
            boolean needsApproval = roomInfo.isPrivate() && !roomInfo.getApprovedUsers().contains(userId);

            if (needsApproval) {
                System.out.println("⏳ Waiting approval: " + userId);
                roomService.joinRoom(roomId, joinDto);

                // Send waiting notification
                Map<String, Object> notification = Map.of(
                    "type", "waiting_user_request",
                    "user", Map.of("id", userId, "username", username, "fullName", fullName, "email", email),
                    "roomId", roomId,
                    "timestamp", System.currentTimeMillis()
                );

                messagingTemplate.convertAndSend("/topic/room/" + roomId + "/approval", notification);
                
                Map<String, Object> waitingStatus = Map.of(
                    "type", "waiting_approval",
                    "status", "pending", 
                    "message", "Đang chờ chủ phòng duyệt..."
                );
                messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", waitingStatus);

            } else {
                roomService.joinRoom(roomId, joinDto);

                // Add to presence
                UserPresence userPresence = new UserPresence(userId, username, fullName, "online", System.currentTimeMillis());
                presenceService.addOrUpdate(roomId, userPresence);

                // Send approval status
                Map<String, Object> approvedStatus = Map.of(
                    "type", "approved",
                    "status", "approved",
                    "message", "Bạn đã được phép vào phòng!"
                );
                messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", approvedStatus);

                // Broadcast presence and join notification
                broadcastPresence(roomId);

                Map<String, Object> joinNotification = Map.of(
                    "type", "join",
                    "user", Map.of("id", userId, "username", username, "fullName", fullName),
                    "roomId", roomId,
                    "timestamp", System.currentTimeMillis()
                );
                messagingTemplate.convertAndSend("/topic/room/" + roomId, joinNotification);
                
                System.out.println("✅ User joined: " + fullName);
            }

        } catch (Exception e) {
            System.err.println("❌ Error in handleJoinRoom: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/room/{roomId}/approve")
    public void handleApproveUser(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            String targetUserId = getStringSafe(payload, "userId");
            String hostId = getStringSafe(payload, "hostId");
            String username = getStringSafe(payload, "username");
            String fullName = getStringSafe(payload, "fullName");

            if (targetUserId == null || hostId == null) {
                System.err.println("❌ Missing required fields for approval");
                return;
            }

            RoomDto roomInfo = roomService.getRoomInfo(roomId);
            if (!roomInfo.getHostId().equals(hostId)) {
                System.err.println("❌ Unauthorized approval attempt by: " + hostId);
                return;
            }

            roomService.approveUser(roomId, targetUserId);
            System.out.println("✅ Approved user: " + targetUserId);

            // Add to presence
            UserPresence userPresence = new UserPresence(targetUserId, username, fullName, "online", System.currentTimeMillis());
            presenceService.addOrUpdate(roomId, userPresence);

            // Send approval status
            Map<String, Object> approvedStatus = Map.of(
                "type", "approved",
                "status", "approved", 
                "message", "Bạn đã được chấp nhận vào phòng!"
            );
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/approval-status", approvedStatus);

            // Broadcast updated presence
            broadcastPresence(roomId);

        } catch (Exception e) {
            System.err.println("❌ Error in handleApproveUser: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/room/{roomId}/leave")
    public void handleLeaveRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            String userId = getStringSafe(payload, "userId");
            if (userId == null) userId = getStringSafe(payload, "username");

            if (userId == null) {
                System.err.println("❌ Missing userId in leave request");
                return;
            }

            System.out.println("👋 User leaving: " + userId);

            // Remove from presence
            presenceService.remove(roomId, userId);

            // Send leave notification
            Map<String, Object> leaveNotification = Map.of(
                "type", "leave",
                "user", Map.of("id", userId),
                "roomId", roomId,
                "timestamp", System.currentTimeMillis()
            );
            messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotification);

            // Broadcast updated presence
            broadcastPresence(roomId);

            // Remove from room service
            roomService.leaveRoom(roomId, userId);

        } catch (Exception e) {
            System.err.println("❌ Error in handleLeaveRoom: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @SubscribeMapping("/topic/presence/{roomId}")
    public void onSubscribePresence(@DestinationVariable String roomId) {
        broadcastPresence(roomId);
    }

    private void broadcastPresence(String roomId) {
        try {
            List<UserPresence> users = presenceService.list(roomId);
            List<Map<String, Object>> userList = new ArrayList<>();
            
            for (UserPresence user : users) {
                userList.add(Map.of(
                    "id", user.getUserId(),
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "status", user.getStatus() != null ? user.getStatus() : "online"
                ));
            }
            
            Map<String, Object> presence = Map.of(
                "users", userList,
                "count", users.size(),
                "roomId", roomId,
                "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSend("/topic/presence/" + roomId, presence);
            System.out.println("📊 Presence updated - Room: " + roomId + ", Users: " + users.size());
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting presence: " + e.getMessage());
        }
    }

    // Helper method
    private String getStringSafe(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        Object value = map.get(key);
        if (value instanceof String) return (String) value;
        if (value != null) return value.toString();
        return null;
    }
}