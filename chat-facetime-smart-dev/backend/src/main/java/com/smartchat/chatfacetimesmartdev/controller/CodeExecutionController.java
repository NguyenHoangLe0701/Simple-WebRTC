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

    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResult> executeCode(@RequestBody CodeExecutionRequest request) {
        try {
            // Validate input
            if (request.getCode() == null || request.getCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new CodeExecutionResult("", "Code cannot be empty", false));
            }

            if (request.getLanguage() == null || request.getLanguage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new CodeExecutionResult("", "Language cannot be empty", false));
            }

            CodeExecutionResult result;
            String language = request.getLanguage().toLowerCase().trim();

            switch (language) {
                case "python":
                    result = dockerCodeExecutionService.executePython(request.getCode(), request.getFileName());
                    break;
                case "javascript":
                case "js":
                    result = dockerCodeExecutionService.executeJavaScript(request.getCode(), request.getFileName());
                    break;
                case "java":
                    result = dockerCodeExecutionService.executeJava(request.getCode(), request.getFileName());
                    break;
                case "cpp":
                case "c++":
                    result = dockerCodeExecutionService.executeCpp(request.getCode(), request.getFileName());
                    break;
                case "html":
                    result = dockerCodeExecutionService.executeHtml(request.getCode(), request.getFileName());
                    break;
                case "css":
                    result = dockerCodeExecutionService.executeCss(request.getCode(), request.getFileName());
                    break;
                case "json":
                    result = dockerCodeExecutionService.executeJson(request.getCode(), request.getFileName());
                    break;
                case "sql":
                    result = dockerCodeExecutionService.executeSql(request.getCode(), request.getFileName());
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(new CodeExecutionResult("", "Unsupported language: " + language, false));
            }

            // Đảm bảo result không null
            if (result == null) {
                result = new CodeExecutionResult("", "Execution returned null result", false);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Log lỗi chi tiết
            System.err.println("Error executing code: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CodeExecutionResult("", "Server error: " + e.getMessage(), false));
        }
    }

    // Các endpoints riêng cho từng ngôn ngữ
    @PostMapping("/execute/python")
    public ResponseEntity<CodeExecutionResult> executePythonCode(@RequestBody CodeExecutionRequest request) {
        try {
            CodeExecutionResult result = dockerCodeExecutionService.executePython(request.getCode(), request.getFileName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CodeExecutionResult("", "Server error: " + e.getMessage(), false));
        }
    }

    @PostMapping("/execute/javascript")
    public ResponseEntity<CodeExecutionResult> executeJavaScript(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeJavaScript(request.getCode(), request.getFileName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute/java")
    public ResponseEntity<CodeExecutionResult> executeJava(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeJava(request.getCode(), request.getFileName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute/cpp")
    public ResponseEntity<CodeExecutionResult> executeCpp(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeCpp(request.getCode(), request.getFileName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute/html")
    public ResponseEntity<CodeExecutionResult> executeHtml(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeHtml(request.getCode(), request.getFileName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute/css")
    public ResponseEntity<CodeExecutionResult> executeCss(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeCss(request.getCode(), request.getFileName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute/json")
    public ResponseEntity<CodeExecutionResult> executeJson(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeJson(request.getCode(), request.getFileName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute/sql")
    public ResponseEntity<CodeExecutionResult> executeSql(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResult result = dockerCodeExecutionService.executeSql(request.getCode(), request.getFileName());
        return ResponseEntity.ok(result);
    }
}