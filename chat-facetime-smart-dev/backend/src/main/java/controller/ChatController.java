package controller;

import model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * ✅ Gửi tin nhắn trong phòng chat
     * Client gửi đến: /app/chat/{roomId}
     * Server broadcast lại: /topic/chat/{roomId}
     */
    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());

        System.out.println("📨 Received message from room " + roomId + ": " + message.getContent());

        // Gửi lại cho tất cả client đang subscribe đúng phòng
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);

        System.out.println("📢 Broadcasted to /topic/chat/" + roomId);
    }

    // ⚠️ Hai hàm dưới đây bị trùng route với RoomWebSocketController
    // → Tạm thời comment lại để tránh xung đột và mất sự kiện join/leave

    /*
    @MessageMapping("/room/{roomId}/join")
    public void userJoined(@DestinationVariable String roomId, ChatMessage message) {
        message.setType(ChatMessage.MessageType.SYSTEM);
        message.setContent(message.getSenderName() + " đã tham gia phòng.");
        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/presence/" + roomId, message);
    }

    @MessageMapping("/room/{roomId}/leave")
    public void userLeft(@DestinationVariable String roomId, ChatMessage message) {
        message.setType(ChatMessage.MessageType.SYSTEM);
        message.setContent(message.getSenderName() + " đã rời phòng.");
        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/presence/" + roomId, message);
    }
    */
}
