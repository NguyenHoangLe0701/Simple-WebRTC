package com.smartchat.chatfacetimesmartdev.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionAnalyticsResponse {
    private SessionSummaryDTO summary;
    private List<TopIPDTO> topIPs;
    private List<TopDeviceDTO> topDevices;
}