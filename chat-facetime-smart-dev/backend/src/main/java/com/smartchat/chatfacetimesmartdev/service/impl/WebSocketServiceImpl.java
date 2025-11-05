package com.smartchat.chatfacetimesmartdev.service.impl;


import com.smartchat.chatfacetimesmartdev.listener.WebSocketEventListener;
import com.smartchat.chatfacetimesmartdev.service.Interface.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketServiceImpl implements WebSocketService {

    private SimpMessageSendingOperations messagingTemplate;

    @Lazy
    private WebSocketEventListener webSocketEventListener;

    // Setter injection cho messagingTemplate
    @Autowired
    public void setMessagingTemplate(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Setter injection cho webSocketEventListener
    @Autowired
    public void setWebSocketEventListener(WebSocketEventListener webSocketEventListener) {
        this.webSocketEventListener = webSocketEventListener;
    }

    @Override
    public void sendToUser(Long userId, String destination, Object payload) {
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), destination, payload);
        } catch (Exception e) {
            log.error("Failed to send message to user {}: {}", userId, e.getMessage());
        }
    }

    @Override
    public void sendToRoom(Long roomId, String destination, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/room." + roomId + destination, payload);
        } catch (Exception e) {
            log.error("Failed to send message to room {}: {}", roomId, e.getMessage());
        }
    }

    @Override
    public void notifyUserStatusChange(Long userId, String status) {
        messagingTemplate.convertAndSend("/topic/user.presence",
            Map.of(
                "userId", userId,
                "status", status,
                "type", "USER_STATUS_CHANGE",
                "timestamp", System.currentTimeMillis()
            )
        );
    }

    @Override
    public void notifyRoomActivity(Long roomId, String activityType, Object data) {
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".activity",
            Map.of(
                "type", activityType,
                "data", data,
                "timestamp", System.currentTimeMillis()
            )
        );
    }

    @Override
    public boolean isUserOnline(Long userId) {
        return webSocketEventListener.isUserOnline(userId);
    }

    @Override
    public int getOnlineUsersCount() {
        return webSocketEventListener.getOnlineUsersCount();
    }
}
