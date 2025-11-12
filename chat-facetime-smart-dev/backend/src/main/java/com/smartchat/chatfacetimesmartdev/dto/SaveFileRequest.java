package com.smartchat.chatfacetimesmartdev.dto;

public class SaveFileRequest {
    private String fileName;
    private String content;

    // Constructors, getters, setters
    public SaveFileRequest() {}

    public SaveFileRequest(String fileName, String content) {
        this.fileName = fileName;
        this.content = content;
    }

    // Getters and setters
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}