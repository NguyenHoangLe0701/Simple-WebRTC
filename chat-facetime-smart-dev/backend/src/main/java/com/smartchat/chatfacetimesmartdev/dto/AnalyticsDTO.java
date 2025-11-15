// AnalyticsDTO.java
package com.smartchat.chatfacetimesmartdev.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class AnalyticsDTO {
    private DashboardStats dashboardStats;
    private UserAnalytics userAnalytics;
    private RoomAnalytics roomAnalytics;
    private NetworkAnalytics networkAnalytics;
}

@Data
class DashboardStats {
    private Long activeUsers;
    private Long totalRooms;
    private Long activeSessions;
    private Long todayLogins;
    private Double avgSessionDuration;
}

@Data
class UserAnalytics {
    private Map<String, Long> registrationsByDate;
    private Map<String, Long> loginsByHour;
    private Map<String, Long> deviceDistribution;
    private Map<String, Long> userRoleDistribution;
}

@Data
class RoomAnalytics {
    private Map<String, Long> roomsByType;
    private Map<String, Long> roomCreationTrend;
    private Map<String, Double> avgParticipantsByRoom;
    private Map<String, Long> roomActivityByHour;
}

@Data
class NetworkAnalytics {
    private Map<String, Long> connectionQuality;
    private Map<String, Long> forceLogoutReasons;
    private Map<String, Long> geographicDistribution;
}