package com.smartchat.chatfacetimesmartdev.listener;

import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.enums.UserStatus;
import com.smartchat.chatfacetimesmartdev.exception.AppException;
import com.smartchat.chatfacetimesmartdev.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final UserService userService;

    // Track active users and their sessions
    private final Map<String, String> userSessionMap = new ConcurrentHashMap<>();
    private final Map<Long, String> userPresenceMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (headerAccessor.getUser() != null) {
            String username = headerAccessor.getUser().getName();
            User user = userService.findByUsername(username);

            if (user != null) {
                userSessionMap.put(sessionId, username);
                userPresenceMap.put(user.getId(), username);

                // Update user status to online
                userService.updateUserStatus(user.getId(), UserStatus.ONLINE);

                // Broadcast user online status
                messagingTemplate.convertAndSend("/topic/user.presence",
                        Map.of(
                                "userId", user.getId(),
                                "username", username,
                                "status", "online",
                                "type", "USER_ONLINE"
                        )
                );

                log.info("User connected: {} (session: {})", username, sessionId);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String username = userSessionMap.get(sessionId);

        if (username != null) {
            User user = userService.findByUsername(username);

            if (user != null) {
                userSessionMap.remove(sessionId);
                userPresenceMap.remove(user.getId());

                // Update user status to offline
                userService.updateUserStatus(user.getId(), UserStatus.OFFLINE);

                // Broadcast user offline status
                messagingTemplate.convertAndSend("/topic/user.presence",
                        Map.of(
                                "userId", user.getId(),
                                "username", username,
                                "status", "offline",
                                "type", "USER_OFFLINE"
                        )
                );

                log.info("User disconnected: {} (session: {})", username, sessionId);
            }
        }
    }

    @EventListener
    public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();
        String sessionId = headerAccessor.getSessionId();
        String username = userSessionMap.get(sessionId);

        if (username != null && destination != null) {
            log.info("User {} subscribed to: {}", username, destination);

            if (destination.startsWith("/topic/room.")) {
                String roomId = destination.replace("/topic/room.", "");

                User user = null;
                try {
                    user = userService.findByUsername(username);
                } catch (AppException e) {
                    log.warn("Subscribed user '{}' not found: {}", username, e.getMessage());
                }

                Long userId = (user != null) ? user.getId() : null;

                messagingTemplate.convertAndSend("/topic/room." + roomId + ".activity",
                        Map.of(
                                "type", "USER_JOINED",
                                "userId", userId,
                                "username", username,
                                "timestamp", System.currentTimeMillis()
                        )
                );
            }
        }

    }

    @EventListener
    public void handleSessionUnsubscribeEvent(SessionUnsubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String username = userSessionMap.get(sessionId);

        if (username != null) {
            log.info("User {} unsubscribed from a channel", username);
        }
    }

    public boolean isUserOnline(Long userId) {
        return userPresenceMap.containsKey(userId);
    }

    public int getOnlineUsersCount() {
        return userPresenceMap.size();
    }
}
