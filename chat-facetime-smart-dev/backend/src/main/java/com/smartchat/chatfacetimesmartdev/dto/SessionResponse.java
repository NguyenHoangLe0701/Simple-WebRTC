package com.smartchat.chatfacetimesmartdev.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private boolean success;
    private String message;
    private Object data;
    
    public static SessionResponse success(String message, Object data) {
        return new SessionResponse(true, message, data);
    }
    
    public static SessionResponse success(String message) {
        return new SessionResponse(true, message, null);
    }
    
    public static SessionResponse error(String message) {
        return new SessionResponse(false, message, null);
    }
}


