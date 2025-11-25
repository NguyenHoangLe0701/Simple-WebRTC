package com.smartchat.chatfacetimesmartdev.dto;

public class CodeExecutionRequest {
    private String code;
    private String language;
    private String fileName;

    public CodeExecutionRequest() {}

    public CodeExecutionRequest(String code, String language, String fileName) {
        this.code = code;
        this.language = language;
        this.fileName = fileName;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}




