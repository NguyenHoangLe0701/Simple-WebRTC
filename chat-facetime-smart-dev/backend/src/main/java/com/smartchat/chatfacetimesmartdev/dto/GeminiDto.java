package com.smartchat.chatfacetimesmartdev.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// Đây là file tổng hợp các DTOs cho Gemini
public class GeminiDto {

    // 1. DTO để gửi Request
    public static class GeminiRequest {
        public List<Content> contents;

        public GeminiRequest(String text) {
            this.contents = List.of(new Content(List.of(new Part(text))));
        }
    }

    public static class Content {
        public List<Part> parts;
        public Content(List<Part> parts) { this.parts = parts; }
    }

    public static class Part {
        public String text;
        public Part(String text) { this.text = text; }
    }

    // 2. DTO để nhận Response
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeminiResponse {
        public List<Candidate> candidates;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        public Content content;
    }
}