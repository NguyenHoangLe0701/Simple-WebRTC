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
  public SignalingController(SimpMessagingTemplate template) { this.template = template; }

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
      // Forward the message to all subscribers in the room
      template.convertAndSend("/topic/chat/" + roomId, msgPayload);
    } catch (Exception e) {
      System.err.println("Error broadcasting chat message: " + e.getMessage());
    }
  }
}
