package controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import model.ChatMessage;

@Controller
public class SignalingController {
  private final SimpMessagingTemplate template;
  
  public SignalingController(SimpMessagingTemplate template) { 
    this.template = template;
    System.out.println("🚀 SignalingController initialized");
  }

  // signaling messages published to /app/signal/{room}
  @MessageMapping("/signal/{roomId}")
  public void signal(@DestinationVariable String roomId, @Payload Object signal) {
    // forward to subscribers
    template.convertAndSend("/topic/room/" + roomId, signal);
  }

  @MessageMapping("/chat/{roomId}")
  public void chat(@DestinationVariable String roomId, @Payload Object msgPayload) {
    // Handle both ChatMessage objects and Map<String, Object> from frontend
    try {
      System.out.println("========================================");
      System.out.println("=== CHAT MESSAGE RECEIVED ===");
      System.out.println("Room: " + roomId);
      System.out.println("Payload type: " + msgPayload.getClass().getName());
      System.out.println("Payload: " + msgPayload.toString());
      
      // Log message details if it's a Map
      if (msgPayload instanceof java.util.Map) {
        java.util.Map<String, Object> msgMap = (java.util.Map<String, Object>) msgPayload;
        System.out.println("Message ID: " + msgMap.get("id"));
        System.out.println("Sender: " + msgMap.get("sender"));
        System.out.println("Content: " + msgMap.get("content"));
        System.out.println("Sender ID: " + msgMap.get("senderId"));
        System.out.println("Room ID: " + msgMap.get("roomId"));
      }
      
      // Forward the message to all subscribers in the room
      String destination = "/topic/chat/" + roomId;
      System.out.println("Broadcasting to destination: " + destination);
      
      template.convertAndSend(destination, msgPayload);
      
      System.out.println("✅ Message broadcasted to " + destination);
      System.out.println("All subscribers in room should receive this message");
      System.out.println("========================================");
    } catch (Exception e) {
      System.err.println("❌ Error broadcasting chat message: " + e.getMessage());
      e.printStackTrace();
      System.err.println("Stack trace:");
      e.printStackTrace();
    }
  }
}
