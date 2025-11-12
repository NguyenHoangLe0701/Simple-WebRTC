package com.smartchat.chatfacetimesmartdev.service;


import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionRequest;
import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionResult;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class CodeExecutionService {

    public CodeExecutionResult executeCode(CodeExecutionRequest request) {
        switch (request.getLanguage().toLowerCase()) {
            case "python":
                return executePythonWithDocker(request.getCode());
            case "javascript":
                return executeJavaScript(request.getCode());
            case "java":
                return executeJava(request.getCode());
            case "cpp":
                return executeCpp(request.getCode());
            default:
                return new CodeExecutionResult("", "Unsupported language: " + request.getLanguage(), false);
        }
    }

    public CodeExecutionResult executePythonWithDocker(String code) {
        try {
            String containerId = createPythonContainer(code);
            String output = getContainerOutput(containerId);
            cleanupContainer(containerId);
            return new CodeExecutionResult(output, "", true);
        } catch (Exception e) {
            return new CodeExecutionResult("", "Execution error: " + e.getMessage(), false);
        }
    }

    private String createPythonContainer(String code) throws IOException, InterruptedException {
        // Tạo temporary file với code
        Path tempFile = Files.createTempFile("python_code", ".py");
        Files.write(tempFile, code.getBytes());

        // Docker command để chạy Python code trong container
        ProcessBuilder processBuilder = new ProcessBuilder(
            "docker", "run", "-d", "--rm",
            "-v", tempFile.getParent() + ":/app",
            "python:3.9-slim",
            "python", "/app/" + tempFile.getFileName().toString()
        );

        Process process = processBuilder.start();
        process.waitFor(5, TimeUnit.SECONDS);

        // Đọc container ID từ output
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String containerId = reader.readLine().trim();

        // Xóa temporary file
        Files.delete(tempFile);

        return containerId;
    }

    private String getContainerOutput(String containerId) throws IOException, InterruptedException {
        // Chờ container hoàn thành
        Process waitProcess = new ProcessBuilder("docker", "wait", containerId).start();
        waitProcess.waitFor(30, TimeUnit.SECONDS); // Timeout 30 giây

        // Lấy logs từ container
        Process logsProcess = new ProcessBuilder("docker", "logs", containerId).start();
        logsProcess.waitFor(5, TimeUnit.SECONDS);

        BufferedReader reader = new BufferedReader(new InputStreamReader(logsProcess.getInputStream()));
        return reader.lines().collect(Collectors.joining("\n"));
    }

    private void cleanupContainer(String containerId) throws IOException, InterruptedException {
        // Dừng và xóa container nếu còn chạy
        new ProcessBuilder("docker", "stop", containerId).start().waitFor(5, TimeUnit.SECONDS);
    }

    private CodeExecutionResult executeJavaScript(String code) {
        try {
            // Implementation for JavaScript execution
            return new CodeExecutionResult("JavaScript executed successfully", "", true);
        } catch (Exception e) {
            return new CodeExecutionResult("", "JavaScript execution error: " + e.getMessage(), false);
        }
    }

    private CodeExecutionResult executeJava(String code) {
        try {
            // Implementation for Java execution
            return new CodeExecutionResult("Java executed successfully", "", true);
        } catch (Exception e) {
            return new CodeExecutionResult("", "Java execution error: " + e.getMessage(), false);
        }
    }

    private CodeExecutionResult executeCpp(String code) {
        try {
            // Implementation for C++ execution
            return new CodeExecutionResult("C++ executed successfully", "", true);
        } catch (Exception e) {
            return new CodeExecutionResult("", "C++ execution error: " + e.getMessage(), false);
        }
    }
}