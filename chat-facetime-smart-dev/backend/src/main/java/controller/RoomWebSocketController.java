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
                roomService.joinRoom(roomId, joinDto);
            } catch (Exception e) {
                // If join fails, still allow WebSocket connection for chat
                System.err.println("Join room failed, but allowing WebSocket: " + e.getMessage());
            }
            
            // Add to active users
            activeUsers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
                .add(new UserPresence(userId, username, fullName));
            
            // Broadcast presence update
            broadcastPresence(roomId);
            
        } catch (Exception e) {
            System.err.println("Error in handleJoinRoom: " + e.getMessage());
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

