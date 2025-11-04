package controller;

import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class PresenceController {

    private final SimpMessagingTemplate messagingTemplate;

    public PresenceController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        System.out.println("🚀 PresenceController initialized");
    }

    @MessageMapping("/room/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        System.out.println("✅ JOIN MESSAGE RECEIVED in room " + roomId);
        System.out.println("User joined: " + payload);

        // Gửi thông báo đến tất cả ai đang subscribe /topic/presence/{roomId}
        messagingTemplate.convertAndSend("/topic/presence/" + roomId, payload);
    }

    @MessageMapping("/room/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        System.out.println("🚪 LEAVE MESSAGE RECEIVED in room " + roomId);
        System.out.println("User left: " + payload);

        messagingTemplate.convertAndSend("/topic/presence/" + roomId, payload);
    }
}
