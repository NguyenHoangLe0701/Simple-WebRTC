package com.smartchat.chatfacetimesmartdev.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionSummaryDTO {
    private long activeSessions;
    private long expiredSessions;
    private long forceLogoutSessions;
}