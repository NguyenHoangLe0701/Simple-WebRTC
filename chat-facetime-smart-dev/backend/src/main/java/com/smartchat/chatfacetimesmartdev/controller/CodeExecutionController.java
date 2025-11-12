package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionRequest;
import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionResult;
import com.smartchat.chatfacetimesmartdev.service.DockerCodeExecutionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "*")
public class CodeExecutionController {

    private final DockerCodeExecutionService dockerCodeExecutionService;

    public CodeExecutionController(DockerCodeExecutionService dockerCodeExecutionService) {
        this.dockerCodeExecutionService = dockerCodeExecutionService;
    }

    @PostMapping("/execute/python")
    public ResponseEntity<CodeExecutionResult> executePythonCode(@RequestBody CodeExecutionRequest request) {
        try {
            CodeExecutionResult result = dockerCodeExecutionService.executePythonSecurely(request.getCode());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CodeExecutionResult("", "Server error: " + e.getMessage(), false));
        }
    }

    // Các endpoints khác cho các ngôn ngữ lập trình
    @PostMapping("/execute/javascript")
    public ResponseEntity<CodeExecutionResult> executeJavaScript(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeJavaScript(request.getCode());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute/java")
    public ResponseEntity<CodeExecutionResult> executeJava(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeJava(request.getCode());
        return ResponseEntity.ok(result);
    }
}