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
public class RealTimeMediaController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/media/quality/update")
    public void handleMediaQualityUpdate(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("event", "MEDIA_QUALITY_UPDATED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("quality", payload.get("quality")); // "low", "medium", "high", "auto"
            response.put("bitrate", payload.get("bitrate"));
            response.put("resolution", payload.get("resolution"));
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/media",
                response
            );

        } catch (Exception e) {
            log.error("Error handling media quality update: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/media/device/switch")
    public void handleDeviceSwitch(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());
            String deviceType = (String) payload.get("deviceType"); // "camera", "microphone", "speaker"
            String deviceId = (String) payload.get("deviceId");

            log.info("User {} switched {} to device {} in room {}",
                    userId, deviceType, deviceId, roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "MEDIA_DEVICE_SWITCHED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("deviceType", deviceType);
            response.put("deviceId", deviceId);
            response.put("deviceLabel", payload.get("deviceLabel"));
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/media",
                response
            );

        } catch (Exception e) {
            log.error("Error handling device switch: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/media/state/update")
    public void handleMediaStateUpdate(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("event", "MEDIA_STATE_UPDATED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("videoEnabled", payload.get("videoEnabled"));
            response.put("audioEnabled", payload.get("audioEnabled"));
            response.put("screenEnabled", payload.get("screenEnabled"));
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/media",
                response
            );

        } catch (Exception e) {
            log.error("Error handling media state update: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/media/network/stats")
    public void handleNetworkStats(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            // Log network statistics for monitoring
            log.debug("Network stats from user {} in room {}: {}", userId, roomId, payload);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "NETWORK_STATS_REPORT");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("packetLoss", payload.get("packetLoss"));
            response.put("jitter", payload.get("jitter"));
            response.put("latency", payload.get("latency"));
            response.put("bitrate", payload.get("bitrate"));
            response.put("timestamp", System.currentTimeMillis());

            // Send to monitoring service or specific users
            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/media/stats",
                response
            );

        } catch (Exception e) {
            log.error("Error handling network stats: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/media/recording/start")
    public void handleRecordingStart(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            log.info("User {} started recording in room {}", userId, roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "RECORDING_STARTED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("recordingId", payload.get("recordingId"));
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/media/recording",
                response
            );

        } catch (Exception e) {
            log.error("Error handling recording start: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/media/recording/stop")
    public void handleRecordingStop(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            log.info("User {} stopped recording in room {}", userId, roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "RECORDING_STOPPED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("recordingId", payload.get("recordingId"));
            response.put("duration", payload.get("duration"));
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/media/recording",
                response
            );

        } catch (Exception e) {
            log.error("Error handling recording stop: {}", e.getMessage(), e);
        }
    }
}