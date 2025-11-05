package com.smartchat.chatfacetimesmartdev.controller;


import com.smartchat.chatfacetimesmartdev.service.websocket.WebSocketMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketEventController {

    private final WebSocketMessageService webSocketMessageService;

    @MessageMapping("/room/{roomId}/typing-start")
    public void handleTypingStart(
            @DestinationVariable Long roomId,
            Principal principal) {

        Long userId = Long.parseLong(principal.getName());
        log.debug("User {} started typing in room {}", userId, roomId);

        // Broadcast typing start
        // Note: In real implementation, you'd fetch user details from service
        webSocketMessageService.broadcastTypingStart(roomId, getUserFromPrincipal(principal));
    }

    @MessageMapping("/room/{roomId}/typing-stop")
    public void handleTypingStop(
            @DestinationVariable Long roomId,
            Principal principal) {

        Long userId = Long.parseLong(principal.getName());
        log.debug("User {} stopped typing in room {}", userId, roomId);

        // Broadcast typing stop
        webSocketMessageService.broadcastTypingStop(roomId, getUserFromPrincipal(principal));
    }

    @MessageMapping("/room/{roomId}/message-typing")
    public void handleMessageTyping(
            @DestinationVariable Long roomId,
            @Payload Map<String, Object> payload,
            Principal principal) {

        Long userId = Long.parseLong(principal.getName());
        Boolean isTyping = (Boolean) payload.get("isTyping");

        if (isTyping) {
            webSocketMessageService.broadcastTypingStart(roomId, getUserFromPrincipal(principal));
        } else {
            webSocketMessageService.broadcastTypingStop(roomId, getUserFromPrincipal(principal));
        }
    }

    // Helper method to create minimal user object from principal
    private com.smartchat.chatfacetimesmartdev.entity.User getUserFromPrincipal(Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        com.smartchat.chatfacetimesmartdev.entity.User user = new com.smartchat.chatfacetimesmartdev.entity.User();
        user.setId(userId);
        user.setUsername(principal.getName()); // You might want to fetch actual user data
        return user;
    }
}