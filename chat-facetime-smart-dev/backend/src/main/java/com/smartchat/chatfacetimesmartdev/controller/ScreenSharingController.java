package com.smartchat.chatfacetimesmartdev.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ScreenSharingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/screen/start")
    public void handleScreenShareStart(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            log.info("User {} started screen sharing in room {}", userId, roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "SCREEN_SHARE_STARTED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("timestamp", System.currentTimeMillis());
            response.put("sessionId", payload.get("sessionId"));

            // Broadcast to all users in the room
            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/screen",
                response
            );

        } catch (Exception e) {
            log.error("Error handling screen share start: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/screen/stop")
    public void handleScreenShareStop(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            log.info("User {} stopped screen sharing in room {}", userId, roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "SCREEN_SHARE_STOPPED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("timestamp", System.currentTimeMillis());
            response.put("reason", payload.get("reason"));

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/screen",
                response
            );

        } catch (Exception e) {
            log.error("Error handling screen share stop: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/screen/pause")
    public void handleScreenSharePause(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("event", "SCREEN_SHARE_PAUSED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("timestamp", System.currentTimeMillis());
            response.put("reason", payload.get("reason"));

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/screen",
                response
            );

        } catch (Exception e) {
            log.error("Error handling screen share pause: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/screen/resume")
    public void handleScreenShareResume(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("event", "SCREEN_SHARE_RESUMED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/screen",
                response
            );

        } catch (Exception e) {
            log.error("Error handling screen share resume: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/screen/control/request")
    public void handleControlRequest(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long targetUserId = Long.valueOf(payload.get("targetUserId").toString());
            Long requesterId = Long.parseLong(principal.getName());

            log.info("User {} requesting remote control from user {} in room {}",
                    requesterId, targetUserId, roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "REMOTE_CONTROL_REQUESTED");
            response.put("roomId", roomId);
            response.put("requesterId", requesterId);
            response.put("targetUserId", targetUserId);
            response.put("timestamp", System.currentTimeMillis());
            response.put("permissions", payload.get("permissions"));

            // Send specifically to the screen sharer
            messagingTemplate.convertAndSendToUser(
                targetUserId.toString(),
                "/queue/screen/control",
                response
            );

        } catch (Exception e) {
            log.error("Error handling control request: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/screen/control/response")
    public void handleControlResponse(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long requesterId = Long.valueOf(payload.get("requesterId").toString());
            Boolean approved = Boolean.valueOf(payload.get("approved").toString());
            Long responderId = Long.parseLong(principal.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("event", "REMOTE_CONTROL_RESPONSE");
            response.put("roomId", roomId);
            response.put("requesterId", requesterId);
            response.put("responderId", responderId);
            response.put("approved", approved);
            response.put("timestamp", System.currentTimeMillis());

            if (approved) {
                response.put("accessToken", payload.get("accessToken"));
                response.put("sessionId", payload.get("sessionId"));
            }

            // Send response back to requester
            messagingTemplate.convertAndSendToUser(
                requesterId.toString(),
                "/queue/screen/control",
                response
            );

        } catch (Exception e) {
            log.error("Error handling control response: {}", e.getMessage(), e);
        }
    }
}