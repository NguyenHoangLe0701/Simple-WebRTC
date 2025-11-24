package com.smartchat.chatfacetimesmartdev.service;

import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionResult;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.time.Duration;
import java.util.Map;

@Service
public class DockerCodeExecutionService {

    private final RestTemplate restTemplate;
    private final String sandboxUrl;

    public DockerCodeExecutionService() {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(20000);

        this.restTemplate = new RestTemplate(factory);

        String envUrl = System.getenv("SANDBOX_URL");
        this.sandboxUrl = (envUrl == null || envUrl.isBlank())
                ? "https://code-executor-latest-1.onrender.com"
                : envUrl;
    }

    private CodeExecutionResult callSandbox(String endpoint, Map<String, String> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint, HttpMethod.POST, request, Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                return new CodeExecutionResult(
                        "", "Sandbox returned: " + response.getStatusCode(), false
                );
            }

            Map<String, Object> body = response.getBody();
            if (body == null) {
                return new CodeExecutionResult("", "Sandbox returned empty response", false);
            }

            String output = String.valueOf(body.getOrDefault("output", ""));
            String error  = String.valueOf(body.getOrDefault("error", ""));
            boolean success = Boolean.TRUE.equals(body.get("success"));

            if (error != null && !error.isBlank()) {
                return new CodeExecutionResult(output, error, false);
            }

            if (!success) {
                return new CodeExecutionResult(output, "Execution failed", false);
            }

            return new CodeExecutionResult(output, "", true);

        } catch (ResourceAccessException e) {
            return new CodeExecutionResult("", "Timeout: " + e.getMessage(), false);

        } catch (RestClientException e) {
            return new CodeExecutionResult("", "Sandbox unreachable: " + e.getMessage(), false);

        } catch (Exception e) {
            return new CodeExecutionResult("", "Internal error: " + e.getMessage(), false);
        }
    }

    public CodeExecutionResult executePython(String code, String fileName) {
        return callSandbox(sandboxUrl + "/run/python", Map.of("code", code));
    }

    public CodeExecutionResult executeJavaScript(String code, String fileName) {
        return callSandbox(sandboxUrl + "/run/javascript", Map.of("code", code));
    }

    public CodeExecutionResult executeJava(String code, String fileName) {
        return callSandbox(sandboxUrl + "/run/java", Map.of("code", code));
    }

    public CodeExecutionResult executeCpp(String code, String fileName) {
        return callSandbox(sandboxUrl + "/run/cpp", Map.of("code", code));
    }

    public CodeExecutionResult executeHtml(String code, String fileName) {
        boolean ok = code.matches("(?s).*<html.*>.*</html>.*")
                || code.matches("(?s).*<body.*>.*</body>.*")
                || code.matches("(?s).*<div.*>.*</div>.*");

        return new CodeExecutionResult(
                ok ? "HTML appears valid" : "",
                ok ? "" : "Invalid basic HTML structure",
                ok
        );
    }

    public CodeExecutionResult executeCss(String code, String fileName) {
        boolean ok = code.matches("(?s).*\\{[^}]*\\}.*");
        return new CodeExecutionResult(
                ok ? "CSS valid" : "",
                ok ? "" : "Possible CSS syntax error",
                ok
        );
    }

    public CodeExecutionResult executeJson(String code, String fileName) {
        try {
            new com.fasterxml.jackson.databind.ObjectMapper().readTree(code);
            return new CodeExecutionResult("Valid JSON", "", true);
        } catch (Exception e) {
            return new CodeExecutionResult("", "Invalid JSON: " + e.getMessage(), false);
        }
    }

    public CodeExecutionResult executeSql(String code, String fileName) {
        boolean ok = code.toUpperCase().matches("(?s).*\\b(SELECT|INSERT|UPDATE|DELETE)\\b.*");
        return new CodeExecutionResult(
                ok ? "Likely valid SQL" : "",
                ok ? "" : "No SQL keywords found",
                ok
        );
    }
}
