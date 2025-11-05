package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.dto.request.MessageRequest;
import com.smartchat.chatfacetimesmartdev.dto.respond.MessageResponse;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.exception.AppException;
import com.smartchat.chatfacetimesmartdev.listener.WebSocketEventListener;
import com.smartchat.chatfacetimesmartdev.service.Interface.MessageService;
import com.smartchat.chatfacetimesmartdev.service.Interface.RoomService;
import com.smartchat.chatfacetimesmartdev.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final MessageService messageService;
    private final RoomService roomService;
    private final UserService userService;
    private final WebSocketEventListener webSocketEventListener;

    // ========== ROOM MANAGEMENT ==========

    @MessageMapping("/room.{roomId}.join")
    public void joinRoom(@DestinationVariable Long roomId,
                         Principal principal,
                         SimpMessageHeaderAccessor headerAccessor) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        // Validate user can join the room
        if (!roomService.isUserMember(roomId, user.getId())) {
            log.warn("User {} attempted to join room {} without membership", username, roomId);
            return;
        }

        // Add user to room session
        headerAccessor.getSessionAttributes().put("roomId", roomId);

        // Broadcast user joined room
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".presence",
                Map.of(
                        "type", "USER_JOINED",
                        "userId", user.getId(),
                        "username", username,
                        "user", Map.of(
                                "id", user.getId(),
                                "username", username,
                                "fullName", user.getFullName()
                        ),
                        "timestamp", System.currentTimeMillis()
                )
        );

        log.info("User {} joined room {}", username, roomId);
    }

    @MessageMapping("/room.{roomId}.leave")
    public void leaveRoom(@DestinationVariable Long roomId, Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        // Broadcast user left room
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".presence",
                Map.of(
                        "type", "USER_LEFT",
                        "userId", user.getId(),
                        "username", username,
                        "timestamp", System.currentTimeMillis()
                )
        );

        log.info("User {} left room {}", username, roomId);
    }

    // ========== MESSAGING ==========

    @MessageMapping("/room.{roomId}.message.send")
    public void sendMessage(@DestinationVariable Long roomId,
                            @Payload MessageRequest messageRequest,
                            Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        try {
            // Save message to database
            MessageResponse messageResponse = messageService.sendMessage(roomId, messageRequest, user.getId());

            // Broadcast message to all room subscribers
            messagingTemplate.convertAndSend("/topic/room." + roomId + ".messages", messageResponse);

            log.debug("Message sent to room {} by user {}", roomId, username);

        } catch (Exception e) {
            log.error("Failed to send message to room {}: {}", roomId, e.getMessage());

            // Send error back to sender only
            messagingTemplate.convertAndSendToUser(username, "/queue/errors",
                    Map.of(
                            "type", "MESSAGE_SEND_ERROR",
                            "message", "Failed to send message",
                            "timestamp", System.currentTimeMillis()
                    )
            );
        }
    }

    @MessageMapping("/room.{roomId}.message.{messageId}.react")
    public void reactToMessage(@DestinationVariable Long roomId,
                               @DestinationVariable Long messageId,
                               @Payload Map<String, String> reactionData,
                               Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        String reaction = reactionData.get("reaction");

        try {
            MessageResponse messageResponse = messageService.addReaction(messageId, reaction, user.getId());

            // Broadcast reaction to all room subscribers
            messagingTemplate.convertAndSend("/topic/room." + roomId + ".messages.update",
                    Map.of(
                            "type", "MESSAGE_REACTION",
                            "messageId", messageId,
                            "message", messageResponse,
                            "userId", user.getId(),
                            "username", username,
                            "reaction", reaction,
                            "timestamp", System.currentTimeMillis()
                    )
            );

            log.debug("Reaction {} added to message {} by user {}", reaction, messageId, username);

        } catch (Exception e) {
            log.error("Failed to add reaction to message {}: {}", messageId, e.getMessage());
        }
    }

    @MessageMapping("/room.{roomId}.message.{messageId}.delete")
    public void deleteMessage(@DestinationVariable Long roomId,
                              @DestinationVariable Long messageId,
                              Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        try {
            messageService.deleteMessage(messageId, user.getId());

            // Broadcast message deletion to all room subscribers
            messagingTemplate.convertAndSend("/topic/room." + roomId + ".messages.update",
                    Map.of(
                            "type", "MESSAGE_DELETED",
                            "messageId", messageId,
                            "userId", user.getId(),
                            "username", username,
                            "timestamp", System.currentTimeMillis()
                    )
            );

            log.debug("Message {} deleted by user {}", messageId, username);

        } catch (Exception e) {
            log.error("Failed to delete message {}: {}", messageId, e.getMessage());
        }
    }

    // ========== TYPING INDICATORS ==========

    @MessageMapping("/room.{roomId}.typing.start")
    public void startTyping(@DestinationVariable Long roomId,
                            @Payload Map<String, String> typingData,
                            Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        // Broadcast typing start to all room subscribers except sender
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".typing",
                Map.of(
                        "type", "TYPING_START",
                        "userId", user.getId(),
                        "username", username,
                        "user", Map.of(
                                "id", user.getId(),
                                "username", username,
                                "fullName", user.getFullName()
                        ),
                        "timestamp", System.currentTimeMillis()
                )
        );
    }

    @MessageMapping("/room.{roomId}.typing.stop")
    public void stopTyping(@DestinationVariable Long roomId,
                           Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        // Broadcast typing stop to all room subscribers except sender
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".typing",
                Map.of(
                        "type", "TYPING_STOP",
                        "userId", user.getId(),
                        "username", username,
                        "timestamp", System.currentTimeMillis()
                )
        );
    }

    // ========== CALL MANAGEMENT ==========

    @MessageMapping("/room.{roomId}.call.initiate")
    public void initiateCall(@DestinationVariable Long roomId,
                             @Payload Map<String, Object> callData,
                             Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        String callType = (String) callData.get("callType");
        Object offer = callData.get("offer");

        // Broadcast call initiation to all room subscribers except sender
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".call",
                Map.of(
                        "type", "CALL_INITIATE",
                        "userId", user.getId(),
                        "username", username,
                        "callType", callType,
                        "offer", offer,
                        "timestamp", System.currentTimeMillis()
                )
        );

        log.info("Call initiated in room {} by user {}", roomId, username);
    }

    @MessageMapping("/room.{roomId}.call.answer")
    public void answerCall(@DestinationVariable Long roomId,
                           @Payload Map<String, Object> answerData,
                           Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        Object answer = answerData.get("answer");

        // Broadcast call answer to all room subscribers
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".call",
                Map.of(
                        "type", "CALL_ANSWER",
                        "userId", user.getId(),
                        "username", username,
                        "answer", answer,
                        "timestamp", System.currentTimeMillis()
                )
        );
    }

    @MessageMapping("/room.{roomId}.call.ice-candidate")
    public void handleIceCandidate(@DestinationVariable Long roomId,
                                   @Payload Map<String, Object> candidateData,
                                   Principal principal) {
        String username = principal.getName();

        // Lấy user an toàn, trả null nếu không tìm thấy
        User user = null;
        try {
            user = userService.findByUsername(username);
        } catch (AppException e) {
            log.warn("User '{}' not found: {}", username, e.getMessage());
        }

        Long userId = (user != null) ? user.getId() : null;

        // Broadcast ICE candidate
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".call",
                Map.of(
                        "type", "ICE_CANDIDATE",
                        "userId", userId,
                        "username", username,
                        "candidate", candidateData.get("candidate"),
                        "timestamp", System.currentTimeMillis()
                )
        );
    }


    @MessageMapping("/room.{roomId}.call.end")
    public void endCall(@DestinationVariable Long roomId,
                        Principal principal) {
        String username = principal.getName();
        User user = userService.findByUsername(username);

        // Broadcast call end to all room subscribers
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".call",
                Map.of(
                        "type", "CALL_END",
                        "userId", user.getId(),
                        "username", username,
                        "timestamp", System.currentTimeMillis()
                )
        );

        log.info("Call ended in room {} by user {}", roomId, username);
    }

    // ========== SUBSCRIPTION HANDLERS ==========

    @SubscribeMapping("/user/queue/notifications")
    public Map<String, Object> handleNotificationSubscription(Principal principal) {
        return Map.of(
                "type", "SUBSCRIPTION_SUCCESS",
                "message", "Subscribed to notifications",
                "timestamp", System.currentTimeMillis()
        );
    }

    @SubscribeMapping("/topic/user.presence")
    public Map<String, Object> handlePresenceSubscription(Principal principal) {
        return Map.of(
                "type", "PRESENCE_SUBSCRIBED",
                "onlineUsers", webSocketEventListener.getOnlineUsersCount(),
                "timestamp", System.currentTimeMillis()
        );
    }
}