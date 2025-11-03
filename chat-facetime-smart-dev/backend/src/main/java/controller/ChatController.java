package controller;

import model.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    // Nhận message từ client gửi lên /app/chat/{roomId}
    // Sau đó gửi lại cho tất cả client đang subscribe /topic/chat/{roomId}
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessage sendMessage(@DestinationVariable String roomId, ChatMessage message) {
        // Gán thời gian server
        message.setTimestamp(LocalDateTime.now());
        System.out.println("📨 Received message from client in room: " + roomId + " -> " + message.getContent());
        return message;
    }

    // Tuỳ chọn: có thể thêm sự kiện khi người dùng join/leave phòng nếu cần
    @MessageMapping("/room/{roomId}/join")
    @SendTo("/topic/presence/{roomId}")
    public ChatMessage userJoined(@DestinationVariable String roomId, ChatMessage message) {
        message.setType(ChatMessage.MessageType.SYSTEM);
        message.setContent(message.getSenderName() + " đã tham gia phòng.");
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    @MessageMapping("/room/{roomId}/leave")
    @SendTo("/topic/presence/{roomId}")
    public ChatMessage userLeft(@DestinationVariable String roomId, ChatMessage message) {
        message.setType(ChatMessage.MessageType.SYSTEM);
        message.setContent(message.getSenderName() + " đã rời phòng.");
        message.setTimestamp(LocalDateTime.now());
        return message;
    }
}
