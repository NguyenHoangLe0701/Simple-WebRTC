package com.smartchat.chatfacetimesmartdev.dto;

public class CodeExecutionResult {
    private String output;
    private String error;
    private boolean success;

    public CodeExecutionResult() {}

    public CodeExecutionResult(String output, String error, boolean success) {
        this.output = output;
        this.error = error;
        this.success = success;
    }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}