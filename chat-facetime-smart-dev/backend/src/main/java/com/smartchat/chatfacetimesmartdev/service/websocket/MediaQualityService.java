package com.smartchat.chatfacetimesmartdev.service.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class MediaQualityService {

    private final Map<String, MediaSession> activeSessions = new ConcurrentHashMap<>();

    public Map<String, Object> calculateOptimalSettings(
            Long userId,
            Long roomId,
            Map<String, Object> networkStats) {

        Map<String, Object> recommendations = new HashMap<>();

        double availableBandwidth = Double.parseDouble(networkStats.get("availableBandwidth").toString());
        double packetLoss = Double.parseDouble(networkStats.get("packetLoss").toString());
        double latency = Double.parseDouble(networkStats.get("latency").toString());

        // Adaptive quality logic
        if (availableBandwidth > 2000 && packetLoss < 0.01 && latency < 100) {
            // Excellent conditions - HD quality
            recommendations.put("videoBitrate", 2000000);
            recommendations.put("audioBitrate", 128000);
            recommendations.put("videoResolution", "1080p");
            recommendations.put("framerate", 30);
            recommendations.put("quality", "high");
        } else if (availableBandwidth > 1000 && packetLoss < 0.05 && latency < 200) {
            // Good conditions - Medium quality
            recommendations.put("videoBitrate", 1000000);
            recommendations.put("audioBitrate", 96000);
            recommendations.put("videoResolution", "720p");
            recommendations.put("framerate", 24);
            recommendations.put("quality", "medium");
        } else {
            // Poor conditions - Low quality
            recommendations.put("videoBitrate", 500000);
            recommendations.put("audioBitrate", 64000);
            recommendations.put("videoResolution", "480p");
            recommendations.put("framerate", 15);
            recommendations.put("quality", "low");
        }

        // Adjust based on packet loss
        if (packetLoss > 0.1) {
            recommendations.put("videoBitrate",
                    (int) (Integer.parseInt(recommendations.get("videoBitrate").toString()) * 0.7));
            recommendations.put("framerate",
                    (int) (Integer.parseInt(recommendations.get("framerate").toString()) * 0.8));
        }

        log.info("Calculated media quality settings for user {}: {}", userId, recommendations);
        return recommendations;
    }

    public void updateSessionQuality(String sessionId, Map<String, Object> qualityMetrics) {
        MediaSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.updateQuality(qualityMetrics);
        }
    }

    public Map<String, Object> getSessionReport(String sessionId) {
        MediaSession session = activeSessions.get(sessionId);
        if (session != null) {
            return session.generateReport();
        }
        return new HashMap<>();
    }

    // Inner class for media session tracking
    private static class MediaSession {
        private final String sessionId;
        private final Long userId;
        private final Long roomId;
        private Map<String, Object> qualityMetrics;
        private long startTime;

        public MediaSession(String sessionId, Long userId, Long roomId) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.roomId = roomId;
            this.qualityMetrics = new HashMap<>();
            this.startTime = System.currentTimeMillis();
        }

        public void updateQuality(Map<String, Object> metrics) {
            this.qualityMetrics.putAll(metrics);
            this.qualityMetrics.put("lastUpdate", System.currentTimeMillis());
        }

        public Map<String, Object> generateReport() {
            Map<String, Object> report = new HashMap<>();
            report.put("sessionId", sessionId);
            report.put("userId", userId);
            report.put("roomId", roomId);
            report.put("duration", System.currentTimeMillis() - startTime);
            report.put("qualityMetrics", new HashMap<>(qualityMetrics));
            return report;
        }
    }
}