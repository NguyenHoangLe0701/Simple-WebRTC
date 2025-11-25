package com.smartchat.chatfacetimesmartdev.dto;


public class LoadFileResponse {
    private String content;
    private boolean success;
    private String message;

    public LoadFileResponse() {}

    public LoadFileResponse(String content, boolean success, String message) {
        this.content = content;
        this.success = success;
        this.message = message;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}