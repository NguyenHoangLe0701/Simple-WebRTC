package com.smartchat.chatfacetimesmartdev.service;

import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionResult;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class DockerCodeExecutionService {

    private static final int EXECUTION_TIMEOUT_SECONDS = 10;

    public CodeExecutionResult executePythonSecurely(String code) {
        Process process = null;
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                "docker", "run", "-i", "--rm",
                "--memory", "100m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                "python:3.9-slim",
                "python", "-c", code
            );

            process = processBuilder.start();
            boolean completed = process.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!completed) {
                process.destroyForcibly();
                return new CodeExecutionResult("", "Execution timeout", false);
            }

            String output = readInputStream(process);
            String errors = readErrorStream(process);
            int exitCode = process.exitValue();

            if (exitCode == 0) {
                return new CodeExecutionResult(output, "", true);
            } else {
                return new CodeExecutionResult(output, "Exit code: " + exitCode + "\n" + errors, false);
            }

        } catch (Exception e) {
            return new CodeExecutionResult("", "Execution error: " + e.getMessage(), false);
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    // Các method cho ngôn ngữ khác có thể triển khai tương tự
    public CodeExecutionResult executeJavaScript(String code) {
        // Tương tự, sử dụng node image
        return new CodeExecutionResult("", "JavaScript execution not implemented yet", false);
    }

    public CodeExecutionResult executeJava(String code) {
        // Tương tự, sử dụng openjdk image
        return new CodeExecutionResult("", "Java execution not implemented yet", false);
    }

    private String readInputStream(Process process) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private String readErrorStream(Process process) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }
}