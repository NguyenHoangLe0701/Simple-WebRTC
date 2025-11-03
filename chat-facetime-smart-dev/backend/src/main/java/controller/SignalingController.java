package controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    private final SimpMessagingTemplate template;

    public SignalingController(SimpMessagingTemplate template) {
        this.template = template;
        System.out.println("🚀 SignalingController initialized");
    }

    // ✅ Xử lý tín hiệu WebRTC (offer/answer/ice)
    @MessageMapping("/signal/{roomId}")
    public void handleSignal(@DestinationVariable String roomId, @Payload Object signal) {
        try {
            System.out.println("📡 SIGNAL RECEIVED for room: " + roomId);
            System.out.println("Payload: " + signal);

            // Gửi tín hiệu đến tất cả client trong room
            String destination = "/topic/signal/" + roomId;
            template.convertAndSend(destination, signal);

            System.out.println("✅ Signal broadcasted to " + destination);
        } catch (Exception e) {
            System.err.println("❌ Error in handleSignal: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ✅ Xử lý tin nhắn chat
    @MessageMapping("/chat/{roomId}")
    public void handleChat(@DestinationVariable String roomId, @Payload Object msgPayload) {
        try {
            System.out.println("========================================");
            System.out.println("💬 CHAT MESSAGE RECEIVED");
            System.out.println("Room: " + roomId);
            System.out.println("Payload type: " + msgPayload.getClass().getName());
            System.out.println("Payload: " + msgPayload);

            String destination = "/topic/chat/" + roomId;
            template.convertAndSend(destination, msgPayload);

            System.out.println("✅ Message broadcasted to " + destination);
            System.out.println("========================================");
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting chat message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
