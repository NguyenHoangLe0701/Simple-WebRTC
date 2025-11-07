package com.smartchat.chatfacetimesmartdev.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        return Map.of("status", "ok", "message", "Server is alive 🚀");
    }
}
