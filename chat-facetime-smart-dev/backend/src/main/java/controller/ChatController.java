package controller;

import model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
public class ChatController {

    @Autowired
 private SimpMessagingTemplate messagingTemplate;

    // === CHAT MESSAGE ===
    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, ChatMessage message) {
        // THÊM ID ĐỂ FRONTEND NHẬN TIN MỚI
        if (message.getId() == null || message.getId().isEmpty()) {
            message.setId(UUID.randomUUID().toString());
        }
        message.setTimestamp(LocalDateTime.now());

        System.out.println("CHAT ROOM " + roomId + " | FROM: " + message.getSender() + " | MSG: " + message.getContent());

        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    // === WEBRTC SIGNALING ===
    @MessageMapping("/signal/{roomId}")
    public void handleSignal(@DestinationVariable String roomId, @Payload Object signal) {
        System.out.println("SIGNAL ROOM " + roomId + " | TYPE: " + 
            (signal instanceof java.util.Map ? ((java.util.Map<?,?>)signal).get("type") : "unknown"));

        // GỬI ĐÚNG ĐÍCH (frontend subscribe /topic/room/{roomId})
        messagingTemplate.convertAndSend("/topic/room/" + roomId, signal);
    }
}