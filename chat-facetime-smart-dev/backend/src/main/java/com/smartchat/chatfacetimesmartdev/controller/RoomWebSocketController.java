package com.smartchat.chatfacetimesmartdev.controller;

import java.util.ArrayList;
import java.util.HashMap;
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
            // ✅ Log để xác nhận backend đã nhận được message
            System.out.println("🚀 handleJoinRoom triggered for room: " + roomId);
            System.out.println("   Payload: " + payload);

            // ✅ Parse dữ liệu linh hoạt với type safety
            String userId = getStringSafe(payload, "userId");
            String username = getStringSafe(payload, "username");
            String fullName = getStringSafe(payload, "fullName");
            String email = getStringSafe(payload, "email");

            // 🆕 FALLBACK LOGIC
            if (userId == null && username != null) {
                userId = username;
                System.out.println("🔄 Using username as userId: " + userId);
            }
            if (fullName == null && username != null) {
                fullName = username;
                System.out.println("🔄 Using username as fullName: " + fullName);
            }

            // 🆕 VALIDATE REQUIRED FIELDS
            if (userId == null) {
                System.err.println("❌ Missing userId in join request");
                return;
            }

            System.out.println("👤 User joining - ID: " + userId + ", Name: " + fullName);

            // ✅ Kiểm tra hoặc tạo room nếu chưa tồn tại
            try {
                roomService.getRoomInfo(roomId);
                System.out.println("✅ Room exists: " + roomId);
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
                    System.out.println("🆕 Auto-created public room: " + roomId);
                } catch (Exception ex) {
                    System.err.println("❌ Error creating room: " + ex.getMessage());
                }
            }

            // ✅ Thực hiện join
            RoomJoinDto joinDto = new RoomJoinDto();
            joinDto.setUserId(userId);
            joinDto.setUsername(username);
            joinDto.setFullName(fullName);
            joinDto.setEmail(email);

            RoomDto roomInfo = roomService.getRoomInfo(roomId);
            boolean needsApproval = roomInfo.isPrivate() && !roomInfo.getApprovedUsers().contains(userId);

            if (needsApproval) {
                System.out.println("⏳ User needs approval: " + userId);
                roomService.joinRoom(roomId, joinDto);

                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "waiting_user_request");
                notification.put("user", Map.of(
                        "id", userId,
                        "username", username,
                        "fullName", fullName,
                        "email", email
                ));
                notification.put("roomId", roomId);
                notification.put("timestamp", System.currentTimeMillis());

                messagingTemplate.convertAndSend("/topic/room/" + roomId + "/approval", notification);
                System.out.println("✅ Waiting approval notification sent");

                Map<String, Object> waitingStatus = new HashMap<>();
                waitingStatus.put("type", "waiting_approval");
                waitingStatus.put("status", "pending");
                waitingStatus.put("message", "Đang chờ chủ phòng duyệt...");
                messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", waitingStatus);
                System.out.println("✅ Waiting status sent to user: " + userId);

            } else {
                System.out.println("✅ User approved to join: " + userId);
                roomService.joinRoom(roomId, joinDto);

                // 🆕 CREATE USER PRESENCE
                UserPresence userPresence = new UserPresence(userId, username, fullName, "online", System.currentTimeMillis());
                presenceService.addOrUpdate(roomId, userPresence);
                System.out.println("✅ User added to presence: " + fullName);

                // ✅ Log xác nhận join
                System.out.println("✅ JOIN MESSAGE RECEIVED for " + fullName + " (" + userId + ") in room " + roomId);

                // 🆕 SEND APPROVAL STATUS TO USER
                Map<String, Object> approvedStatus = new HashMap<>();
                approvedStatus.put("type", "approved");
                approvedStatus.put("status", "approved");
                approvedStatus.put("message", "Bạn đã được phép vào phòng!");
                messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", approvedStatus);
                System.out.println("✅ Approval status sent to user: " + userId);

                // 🆕 BROADCAST PRESENCE IMMEDIATELY
                broadcastPresence(roomId);

                // 🆕 SEND JOIN NOTIFICATION
                Map<String, Object> joinNotification = new HashMap<>();
                joinNotification.put("type", "join");
                joinNotification.put("user", Map.of(
                        "id", userId,
                        "username", username,
                        "fullName", fullName
                ));
                joinNotification.put("roomId", roomId);
                joinNotification.put("timestamp", System.currentTimeMillis());
                
                messagingTemplate.convertAndSend("/topic/room/" + roomId, joinNotification);
                System.out.println("✅ Join notification broadcasted for user: " + fullName);
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

            // 🆕 VALIDATION
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
            System.out.println("✅ Approved user " + targetUserId + " in room " + roomId);

            // 🆕 ADD TO PRESENCE
            UserPresence userPresence = new UserPresence(targetUserId, username, fullName, "online", System.currentTimeMillis());
            presenceService.addOrUpdate(roomId, userPresence);

            // 🆕 SEND APPROVAL STATUS
            Map<String, Object> approvedStatus = new HashMap<>();
            approvedStatus.put("type", "approved");
            approvedStatus.put("status", "approved");
            approvedStatus.put("message", "Bạn đã được chấp nhận vào phòng!");
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/approval-status", approvedStatus);
            System.out.println("✅ Approval status sent to user: " + targetUserId);

            // 🆕 BROADCAST UPDATED PRESENCE
            broadcastPresence(roomId);

        } catch (Exception e) {
            System.err.println("❌ Error in handleApproveUser: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/room/{roomId}/leave")
    public void handleLeaveRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            // 🆕 TYPE SAFE EXTRACTION
            String userId = getStringSafe(payload, "userId");
            if (userId == null) {
                userId = getStringSafe(payload, "username"); // fallback
            }

            if (userId == null) {
                System.err.println("❌ Missing userId in leave request");
                return;
            }

            System.out.println("👋 User leaving room " + roomId + ": " + userId);

            // 🆕 REMOVE FROM PRESENCE
            presenceService.remove(roomId, userId);
            System.out.println("✅ User removed from presence: " + userId);

            // 🆕 SEND LEAVE NOTIFICATION
            Map<String, Object> leaveNotification = new HashMap<>();
            leaveNotification.put("type", "leave");
            leaveNotification.put("user", Map.of("id", userId));
            leaveNotification.put("roomId", roomId);
            leaveNotification.put("timestamp", System.currentTimeMillis());
            
            messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotification);
            System.out.println("✅ Leave notification sent for user: " + userId);

            // 🆕 BROADCAST UPDATED PRESENCE
            broadcastPresence(roomId);

            // 🆕 REMOVE FROM ROOM SERVICE
            roomService.leaveRoom(roomId, userId);
            System.out.println("✅ User removed from room service: " + userId);

        } catch (Exception e) {
            System.err.println("❌ Error in handleLeaveRoom: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @SubscribeMapping("/topic/presence/{roomId}")
    public void onSubscribePresence(@DestinationVariable String roomId) {
        System.out.println("📡 Subscribed to presence for room: " + roomId);
        broadcastPresence(roomId);
    }

    private void broadcastPresence(String roomId) {
        try {
            List<UserPresence> users = presenceService.list(roomId);
            List<Map<String, Object>> userList = new ArrayList<>();
            
            // 🆕 CREATE USER LIST WITH TYPE SAFETY
            for (UserPresence user : users) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getUserId());
                userMap.put("username", user.getUsername());
                userMap.put("fullName", user.getFullName());
                userMap.put("status", user.getStatus() != null ? user.getStatus() : "online");
                userList.add(userMap);
            }
            
            Map<String, Object> presence = new HashMap<>();
            presence.put("users", userList);
            presence.put("count", users.size());
            presence.put("roomId", roomId);
            presence.put("timestamp", System.currentTimeMillis());

            System.out.println("=== BROADCASTING PRESENCE ===");
            System.out.println("Room: " + roomId + " | Users count: " + users.size());
            System.out.println("Users: " + userList.stream()
                    .map(u -> u.get("fullName") + "(" + u.get("id") + ")")
                    .toList());

            messagingTemplate.convertAndSend("/topic/presence/" + roomId, presence);
            System.out.println("✅ Presence broadcasted successfully for room: " + roomId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting presence for room " + roomId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 🆕 HELPER METHOD FOR TYPE SAFETY
    private String getStringSafe(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        
        Object value = map.get(key);
        if (value instanceof String) {
            return (String) value;
        } else if (value != null) {
            // Convert other types to String safely
            return value.toString();
        }
        return null;
    }

    // 🆕 DEBUG METHOD TO CHECK PRESENCE STATE
    private void debugPresenceState(String roomId) {
        try {
            List<UserPresence> users = presenceService.list(roomId);
            System.out.println("=== 🐛 DEBUG PRESENCE STATE ===");
            System.out.println("Room: " + roomId);
            System.out.println("Total users in presence: " + users.size());
            for (UserPresence user : users) {
                System.out.println(" - " + user.getFullName() + " (" + user.getUserId() + ") - " + user.getStatus());
            }
            System.out.println("===============================");
        } catch (Exception e) {
            System.err.println("❌ Error debugging presence: " + e.getMessage());
        }
    }
}