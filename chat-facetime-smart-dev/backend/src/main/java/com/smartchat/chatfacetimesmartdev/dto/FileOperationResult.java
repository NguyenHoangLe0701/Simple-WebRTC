package com.smartchat.chatfacetimesmartdev.dto;


public class FileOperationResult {
    private boolean success;
    private String message;

    // Constructors, getters, setters
    public FileOperationResult() {}

    public FileOperationResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
