package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import service.RoomService;
import service.PresenceService;
import dto.UserPresence;
import dto.RoomJoinDto;
import dto.RoomCreateDto;
import java.util.*;

@Controller
public class RoomWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomService roomService;

    @Autowired
    private PresenceService presenceService;

    @MessageMapping("/room/{roomId}/join")
    public void handleJoinRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            // ✅ Log để xác nhận backend đã nhận được message
            System.out.println("🚀 handleJoinRoom triggered for room: " + roomId);
            System.out.println("   Payload: " + payload);

            // ✅ Parse dữ liệu linh hoạt (vì userId có thể là Integer hoặc String)
            Object rawUserId = payload.get("userId");
            String userId = null;

            if (rawUserId != null) {
                userId = rawUserId.toString(); // an toàn cho cả int hoặc string
            }

            String username = (String) payload.get("username");
            String fullName = (String) payload.get("fullName");
            String email = (String) payload.get("email");

            if (userId == null && username != null) {
                userId = username;
            }
            if (fullName == null && username != null) {
                fullName = username;
            }

            // ✅ Kiểm tra hoặc tạo room nếu chưa tồn tại
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
                    System.out.println("🆕 Auto-created public room: " + roomId);
                } catch (Exception ex) {
                    System.err.println("Error creating room: " + ex.getMessage());
                }
            }

            // ✅ Thực hiện join
            RoomJoinDto joinDto = new RoomJoinDto();
            joinDto.setUserId(userId);
            joinDto.setUsername(username);
            joinDto.setFullName(fullName);
            joinDto.setEmail(email);

            dto.RoomDto roomInfo = roomService.getRoomInfo(roomId);
            boolean needsApproval = roomInfo.isPrivate() && !roomInfo.getApprovedUsers().contains(userId);

            if (needsApproval) {
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

                Map<String, Object> waitingStatus = new HashMap<>();
                waitingStatus.put("type", "waiting_approval");
                waitingStatus.put("status", "pending");
                waitingStatus.put("message", "Đang chờ chủ phòng duyệt...");
                messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", waitingStatus);

            } else {
                roomService.joinRoom(roomId, joinDto);

                presenceService.addOrUpdate(roomId,
                        new UserPresence(userId, username, fullName, "online", System.currentTimeMillis()));

                // ✅ Log xác nhận join
                System.out.println("✅ JOIN MESSAGE RECEIVED for " + fullName + " (" + userId + ") in room " + roomId);

                Map<String, Object> approvedStatus = new HashMap<>();
                approvedStatus.put("type", "approved");
                approvedStatus.put("status", "approved");
                approvedStatus.put("message", "Bạn đã được phép vào phòng!");
                messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", approvedStatus);

                broadcastPresence(roomId);

                Map<String, Object> joinNotification = new HashMap<>();
                joinNotification.put("type", "join");
                joinNotification.put("user", Map.of(
                        "id", userId,
                        "username", username,
                        "fullName", fullName
                ));
                messagingTemplate.convertAndSend("/topic/room/" + roomId, joinNotification);
            }

        } catch (Exception e) {
            System.err.println("❌ Error in handleJoinRoom: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/room/{roomId}/approve")
    public void handleApproveUser(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            String targetUserId = (String) payload.get("userId");
            String hostId = (String) payload.get("hostId");

            dto.RoomDto roomInfo = roomService.getRoomInfo(roomId);
            if (!roomInfo.getHostId().equals(hostId)) return;

            roomService.approveUser(roomId, targetUserId);

            String username = (String) payload.get("username");
            String fullName = (String) payload.get("fullName");

            presenceService.addOrUpdate(roomId,
                    new UserPresence(targetUserId, username, fullName, "online", System.currentTimeMillis()));
            System.out.println("✅ Approved user " + targetUserId + " in room " + roomId);

            Map<String, Object> approvedStatus = new HashMap<>();
            approvedStatus.put("type", "approved");
            approvedStatus.put("status", "approved");
            approvedStatus.put("message", "Bạn đã được chấp nhận vào phòng!");
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/approval-status", approvedStatus);

            broadcastPresence(roomId);
        } catch (Exception e) {
            System.err.println("Error in handleApproveUser: " + e.getMessage());
        }
    }

    @MessageMapping("/room/{roomId}/leave")
    public void handleLeaveRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            Object rawId = payload.get("userId");
            String userId = rawId != null ? rawId.toString() : (String) payload.get("username");

            if (userId == null) return;

            System.out.println("👋 User leaving room " + roomId + ": " + userId);

            presenceService.remove(roomId, userId);

            Map<String, Object> leaveNotification = new HashMap<>();
            leaveNotification.put("type", "leave");
            leaveNotification.put("user", Map.of("id", userId));
            messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveNotification);

            broadcastPresence(roomId);

            roomService.leaveRoom(roomId, userId);
        } catch (Exception e) {
            System.err.println("Error in handleLeaveRoom: " + e.getMessage());
        }
    }

    @SubscribeMapping("/topic/presence/{roomId}")
    public void onSubscribePresence(@DestinationVariable String roomId) {
        broadcastPresence(roomId);
    }

    private void broadcastPresence(String roomId) {
        List<UserPresence> users = presenceService.list(roomId);
        List<Map<String, Object>> userList = new ArrayList<>();
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

        System.out.println("=== BROADCASTING PRESENCE ===");
        System.out.println("Room: " + roomId + " | Users count: " + users.size());

        messagingTemplate.convertAndSend("/topic/presence/" + roomId, presence);
    }
}
