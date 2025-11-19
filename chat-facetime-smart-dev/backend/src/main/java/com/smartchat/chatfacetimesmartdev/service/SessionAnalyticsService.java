package com.smartchat.chatfacetimesmartdev.service;

import com.smartchat.chatfacetimesmartdev.dto.SessionAnalyticsResponse;
import com.smartchat.chatfacetimesmartdev.dto.SessionSummaryDTO;
import com.smartchat.chatfacetimesmartdev.dto.TopDeviceDTO;
import com.smartchat.chatfacetimesmartdev.dto.TopIPDTO;
import com.smartchat.chatfacetimesmartdev.entity.LoginSession;
import com.smartchat.chatfacetimesmartdev.repository.LoginSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionAnalyticsService {

    @Autowired
    private LoginSessionRepository loginSessionRepository;

    public SessionSummaryDTO getSessionSummary() {
        long active = loginSessionRepository.countByStatus(LoginSession.SessionStatus.ACTIVE);
        long expired = loginSessionRepository.countByStatus(LoginSession.SessionStatus.EXPIRED);
        long forceLogout = loginSessionRepository.countByStatus(LoginSession.SessionStatus.FORCE_LOGOUT);

        return new SessionSummaryDTO(active, expired, forceLogout);
    }

    public List<TopIPDTO> getTopIPs() {
        return loginSessionRepository.findTopIpAddresses().stream()
                .map(result -> new TopIPDTO((String) result[0], (Long) result[1]))
                .collect(Collectors.toList());
    }

    public List<TopDeviceDTO> getTopDevices() {
        return loginSessionRepository.findTopDevices().stream()
                .map(result -> new TopDeviceDTO((String) result[0], (Long) result[1]))
                .collect(Collectors.toList());
    }

    public SessionAnalyticsResponse getCompleteAnalytics() {
        SessionSummaryDTO summary = getSessionSummary();
        List<TopIPDTO> topIPs = getTopIPs();
        List<TopDeviceDTO> topDevices = getTopDevices();

        return new SessionAnalyticsResponse(summary, topIPs, topDevices);
    }
}