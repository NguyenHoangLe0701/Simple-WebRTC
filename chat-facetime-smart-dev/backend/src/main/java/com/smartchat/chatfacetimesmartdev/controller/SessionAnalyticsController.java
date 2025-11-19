package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.dto.SessionAnalyticsResponse;
import com.smartchat.chatfacetimesmartdev.dto.SessionSummaryDTO;
import com.smartchat.chatfacetimesmartdev.dto.TopDeviceDTO;
import com.smartchat.chatfacetimesmartdev.dto.TopIPDTO;
import com.smartchat.chatfacetimesmartdev.service.SessionAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics/sessions")
@PreAuthorize("hasRole('ADMIN')")
public class SessionAnalyticsController {

    @Autowired
    private SessionAnalyticsService sessionAnalyticsService;

    @GetMapping("/summary")
    public ResponseEntity<SessionSummaryDTO> getSessionSummary() {
        SessionSummaryDTO summary = sessionAnalyticsService.getSessionSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/top-ip")
    public ResponseEntity<Map<String, List<TopIPDTO>>> getTopIPs() {
        List<TopIPDTO> topIPs = sessionAnalyticsService.getTopIPs();
        return ResponseEntity.ok(Map.of("ips", topIPs));
    }

    @GetMapping("/top-devices")
    public ResponseEntity<Map<String, List<TopDeviceDTO>>> getTopDevices() {
        List<TopDeviceDTO> topDevices = sessionAnalyticsService.getTopDevices();
        return ResponseEntity.ok(Map.of("devices", topDevices));
    }

    @GetMapping("/complete")
    public ResponseEntity<SessionAnalyticsResponse> getCompleteAnalytics() {
        SessionAnalyticsResponse analytics = sessionAnalyticsService.getCompleteAnalytics();
        return ResponseEntity.ok(analytics);
    }
}