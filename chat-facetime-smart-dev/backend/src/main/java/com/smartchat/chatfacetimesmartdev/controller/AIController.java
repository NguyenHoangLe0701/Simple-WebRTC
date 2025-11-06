package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    // DTO đơn giản để nhận prompt từ frontend
    public static record AIChatRequest(String prompt) {}

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> handleChat(@RequestBody AIChatRequest request) {

        System.out.println("🤖 AIController nhận được prompt: " + request.prompt());

        String aiResponse = aiService.getAIResponse(request.prompt());
        return ResponseEntity.ok(Map.of("response", aiResponse));
    }
}