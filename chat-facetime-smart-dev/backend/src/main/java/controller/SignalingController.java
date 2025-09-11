package com.smartchat.chatfacetimesmartdev.controller;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

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
  public void chat(@DestinationVariable String roomId, @Payload ChatMessage msg) {
    template.convertAndSend("/topic/chat/" + roomId, msg);
    // optionally save message via ChatService (injected)
  }
}
