package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import service.RoomService;
import dto.RoomJoinDto;
import dto.RoomCreateDto;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class RoomWebSocketController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private RoomService roomService;
    
    // Track active users per room: roomId -> Set<userId>
    private final Map<String, Set<UserPresence>> activeUsers = new ConcurrentHashMap<>();
    
    public static class UserPresence {
        public String userId;
        public String username;
        public String fullName;
        public String status;
        public long lastSeen;
        
        public UserPresence(String userId, String username, String fullName) {
            this.userId = userId;
            this.username = username;
            this.fullName = fullName;
            this.status = "online";
            this.lastSeen = System.currentTimeMillis();
        }
    }
    
    @MessageMapping("/room/{roomId}/join")
    public void handleJoinRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            String userId = (String) payload.get("userId") != null ? 
                (String) payload.get("userId") : (String) payload.get("username");
            String username = (String) payload.get("username");
            String fullName = (String) payload.get("fullName");
            String email = (String) payload.get("email");
            
            if (userId == null && username != null) {
                userId = username;
            }
            if (fullName == null && username != null) {
                fullName = username;
            }
            
            // Get or create room
            try {
                roomService.getRoomInfo(roomId);
            } catch (Exception e) {
                // Room doesn't exist - create public room automatically
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
                } catch (Exception ex) {
                    // Room might already exist or other error
                    System.err.println("Error creating room: " + ex.getMessage());
                }
            }
            
            // Try to join room via service
            try {
                RoomJoinDto joinDto = new RoomJoinDto();
                joinDto.setUserId(userId);
                joinDto.setUsername(username);
                joinDto.setFullName(fullName);
                joinDto.setEmail(email);
                
                dto.RoomDto roomInfo = roomService.getRoomInfo(roomId);
                boolean needsApproval = roomInfo.isPrivate() && !roomInfo.getApprovedUsers().contains(userId);
                
                if (needsApproval) {
                    // User needs approval - add to waiting list
                    roomService.joinRoom(roomId, joinDto);
                    
                    // Notify host about new waiting user
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("type", "waiting_user_request");
                    notification.put("user", Map.of(
                        "id", userId,
                        "username", username,
                        "fullName", fullName != null ? fullName : username,
                        "email", email != null ? email : ""
                    ));
                    notification.put("roomId", roomId);
                    notification.put("timestamp", System.currentTimeMillis());
                    
                    // Send notification to host
                    messagingTemplate.convertAndSend("/topic/room/" + roomId + "/approval", notification);
                    
                    // Send waiting status to user
                    Map<String, Object> waitingStatus = new HashMap<>();
                    waitingStatus.put("type", "waiting_approval");
                    waitingStatus.put("status", "pending");
                    waitingStatus.put("message", "Đang chờ chủ phòng duyệt...");
                    messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", waitingStatus);
                } else {
                    // User can join directly
                    roomService.joinRoom(roomId, joinDto);
                    
                    // Add to active users
                    activeUsers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
                        .add(new UserPresence(userId, username, fullName));
                    
                    // Notify user they're approved
                    Map<String, Object> approvedStatus = new HashMap<>();
                    approvedStatus.put("type", "approved");
                    approvedStatus.put("status", "approved");
                    approvedStatus.put("message", "Bạn đã được phép vào phòng!");
                    messagingTemplate.convertAndSendToUser(userId, "/queue/approval-status", approvedStatus);
                    
                    // Broadcast presence update
                    broadcastPresence(roomId);
                }
            } catch (Exception e) {
                // If join fails, still allow WebSocket connection for chat
                System.err.println("Join room failed, but allowing WebSocket: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("Error in handleJoinRoom: " + e.getMessage());
        }
    }
    
    @MessageMapping("/room/{roomId}/approve")
    public void handleApproveUser(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            String targetUserId = (String) payload.get("userId");
            String hostId = (String) payload.get("hostId");
            
            // Verify host
            dto.RoomDto roomInfo = roomService.getRoomInfo(roomId);
            if (!roomInfo.getHostId().equals(hostId)) {
                return; // Only host can approve
            }
            
            // Approve user
            roomService.approveUser(roomId, targetUserId);
            
            // Get user info
            String username = (String) payload.get("username");
            String fullName = (String) payload.get("fullName");
            
            // Add to active users
            activeUsers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
                .add(new UserPresence(targetUserId, username, fullName));
            
            // Notify user they're approved
            Map<String, Object> approvedStatus = new HashMap<>();
            approvedStatus.put("type", "approved");
            approvedStatus.put("status", "approved");
            approvedStatus.put("message", "Bạn đã được chấp nhận vào phòng!");
            approvedStatus.put("roomId", roomId);
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/approval-status", approvedStatus);
            
            // Broadcast presence update
            broadcastPresence(roomId);
            
            // Notify all users about new member
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "user_approved");
            notification.put("user", Map.of(
                "id", targetUserId,
                "username", username,
                "fullName", fullName != null ? fullName : username
            ));
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/approval", notification);
            
        } catch (Exception e) {
            System.err.println("Error in handleApproveUser: " + e.getMessage());
        }
    }
    
    @MessageMapping("/room/{roomId}/reject")
    public void handleRejectUser(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            String targetUserId = (String) payload.get("userId");
            String hostId = (String) payload.get("hostId");
            
            // Verify host
            dto.RoomDto roomInfo = roomService.getRoomInfo(roomId);
            if (!roomInfo.getHostId().equals(hostId)) {
                return; // Only host can reject
            }
            
            // Reject user
            roomService.rejectUser(roomId, targetUserId);
            
            // Notify user they're rejected
            Map<String, Object> rejectedStatus = new HashMap<>();
            rejectedStatus.put("type", "rejected");
            rejectedStatus.put("status", "rejected");
            rejectedStatus.put("message", "Yêu cầu tham gia phòng của bạn đã bị từ chối.");
            messagingTemplate.convertAndSendToUser(targetUserId, "/queue/approval-status", rejectedStatus);
            
            // Notify all users about rejection
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "user_rejected");
            notification.put("userId", targetUserId);
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/approval", notification);
            
        } catch (Exception e) {
            System.err.println("Error in handleRejectUser: " + e.getMessage());
        }
    }
    
    @MessageMapping("/room/{roomId}/leave")
    public void handleLeaveRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        try {
            String userId = (String) payload.get("userId");
            if (userId == null) {
                userId = (String) payload.get("username");
            }
            
            final String finalUserId = userId; // Make effectively final for lambda
            if (finalUserId != null) {
                Set<UserPresence> users = activeUsers.get(roomId);
                if (users != null) {
                    users.removeIf(u -> u.userId.equals(finalUserId));
                    if (users.isEmpty()) {
                        activeUsers.remove(roomId);
                    }
                }
                
                // Try to leave via service
                try {
                    RoomJoinDto leaveDto = new RoomJoinDto();
                    leaveDto.setUserId(finalUserId);
                    roomService.leaveRoom(roomId, finalUserId);
                } catch (Exception e) {
                    // Ignore service errors
                }
                
                // Broadcast presence update
                broadcastPresence(roomId);
            }
        } catch (Exception e) {
            System.err.println("Error in handleLeaveRoom: " + e.getMessage());
        }
    }
    
    @SubscribeMapping("/topic/presence/{roomId}")
    public void onSubscribePresence(@DestinationVariable String roomId) {
        // Send current presence when subscribing
        broadcastPresence(roomId);
    }
    
    private void broadcastPresence(String roomId) {
        Set<UserPresence> users = activeUsers.getOrDefault(roomId, Collections.emptySet());
        List<Map<String, Object>> userList = new ArrayList<>();
        
        for (UserPresence user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.userId);
            userMap.put("username", user.username);
            userMap.put("fullName", user.fullName);
            userMap.put("status", user.status);
            userList.add(userMap);
        }
        
        Map<String, Object> presence = new HashMap<>();
        presence.put("users", userList);
        presence.put("count", users.size());
        presence.put("roomId", roomId);
        
        messagingTemplate.convertAndSend("/topic/presence/" + roomId, presence);
    }
    
    // Cleanup stale users periodically
    public void cleanupStaleUsers() {
        long now = System.currentTimeMillis();
        long timeout = 60000; // 1 minute
        
        activeUsers.forEach((roomId, users) -> {
            users.removeIf(user -> (now - user.lastSeen) > timeout);
            if (users.isEmpty()) {
                activeUsers.remove(roomId);
            } else {
                broadcastPresence(roomId);
            }
        });
    }
}

