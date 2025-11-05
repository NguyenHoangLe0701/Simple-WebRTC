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
public class PeerToPeerController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/p2p/connection/status")
    public void handleConnectionStatus(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());
            String connectionState = (String) payload.get("connectionState");

            log.debug("P2P connection status from user {} in room {}: {}",
                    userId, roomId, connectionState);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "P2P_CONNECTION_STATUS");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("connectionState", connectionState);
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/p2p",
                response
            );

        } catch (Exception e) {
            log.error("Error handling connection status: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/p2p/bandwidth/update")
    public void handleBandwidthUpdate(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("event", "P2P_BANDWIDTH_UPDATE");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("availableBandwidth", payload.get("availableBandwidth"));
            response.put("usedBandwidth", payload.get("usedBandwidth"));
            response.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/p2p/stats",
                response
            );

        } catch (Exception e) {
            log.error("Error handling bandwidth update: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/p2p/relay/request")
    public void handleRelayRequest(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());
            String relayType = (String) payload.get("relayType"); // "turn", "stun", "fallback"

            log.info("User {} requesting {} relay in room {}", userId, relayType, roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("event", "P2P_RELAY_REQUESTED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("relayType", relayType);
            response.put("timestamp", System.currentTimeMillis());

            // Send relay configuration
            response.put("relayConfig", getRelayConfiguration(relayType));

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/p2p/relay",
                response
            );

        } catch (Exception e) {
            log.error("Error handling relay request: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/p2p/optimize")
    public void handleOptimizationRequest(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());
            String optimizationType = (String) payload.get("optimizationType");

            Map<String, Object> response = new HashMap<>();
            response.put("event", "P2P_OPTIMIZATION_APPLIED");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("optimizationType", optimizationType);
            response.put("timestamp", System.currentTimeMillis());
            response.put("recommendations", getOptimizationRecommendations(optimizationType));

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/p2p/optimize",
                response
            );

        } catch (Exception e) {
            log.error("Error handling optimization request: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/p2p/peer/list")
    public void handlePeerListRequest(
            @Payload Map<String, Object> payload,
            Principal principal) {

        try {
            Long roomId = Long.valueOf(payload.get("roomId").toString());
            Long userId = Long.parseLong(principal.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("event", "P2P_PEER_LIST");
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("timestamp", System.currentTimeMillis());
            response.put("peers", getConnectedPeers(roomId, userId));

            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/p2p/peers",
                response
            );

        } catch (Exception e) {
            log.error("Error handling peer list request: {}", e.getMessage(), e);
        }
    }

    // Helper methods
    private Map<String, Object> getRelayConfiguration(String relayType) {
        Map<String, Object> config = new HashMap<>();

        switch (relayType) {
            case "turn":
                config.put("urls", "turn:your-turn-server.com:3478");
                config.put("username", "your-username");
                config.put("credential", "your-credential");
                break;
            case "stun":
                config.put("urls", "stun:stun.l.google.com:19302");
                break;
            default:
                config.put("urls", new String[]{
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302"
                });
        }

        return config;
    }

    private Map<String, Object> getOptimizationRecommendations(String optimizationType) {
        Map<String, Object> recommendations = new HashMap<>();

        switch (optimizationType) {
            case "bandwidth":
                recommendations.put("videoBitrate", "Adjust to 500kbps");
                recommendations.put("audioBitrate", "Adjust to 64kbps");
                recommendations.put("resolution", "Scale to 720p");
                break;
            case "latency":
                recommendations.put("codec", "Use VP8 for lower latency");
                recommendations.put("framerate", "Reduce to 24fps");
                recommendations.put("bufferSize", "Decrease buffer size");
                break;
            case "quality":
                recommendations.put("videoBitrate", "Increase to 2Mbps");
                recommendations.put("resolution", "Use 1080p");
                recommendations.put("framerate", "Use 30fps");
                break;
            default:
                recommendations.put("general", "Use adaptive bitrate streaming");
        }

        return recommendations;
    }

    private Map<String, Object> getConnectedPeers(Long roomId, Long userId) {
        // In real implementation, this would query active WebRTC connections
        Map<String, Object> peers = new HashMap<>();
        peers.put("total", 3);
        peers.put("directConnections", 2);
        peers.put("relayedConnections", 1);
        return peers;
    }
}