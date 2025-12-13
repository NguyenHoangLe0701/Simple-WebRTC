
package com.smartchat.chatfacetimesmartdev.service;

import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionRequest;
import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionResult;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class CodeExecutionService {

    private final RestTemplate restTemplate;
    private final String sandboxUrl;

    public CodeExecutionService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(20).toMillis());
        this.restTemplate = new RestTemplate(factory);
        String envUrl = System.getenv("SANDBOX_URL");
        if (envUrl == null || envUrl.isBlank()) {
            envUrl = "https://sandbox-code-executor.onrender.com";
        }
        this.sandboxUrl = envUrl;
    }

    public CodeExecutionResult executeCode(CodeExecutionRequest request) {
        switch (request.getLanguage().toLowerCase()) {
            case "python":
                return executePython(request.getCode());
            case "javascript":
            case "js":
                return executeJavaScript(request.getCode());
            case "java":
                return executeJava(request.getCode());
            case "cpp":
            case "c++":
                return executeCpp(request.getCode());
            default:
                return new CodeExecutionResult("", "Unsupported language: " + request.getLanguage(), false);
        }
    }

    private CodeExecutionResult executePython(String code) {
        String url = sandboxUrl + "/run/python";
        return postToSandbox(url, Map.of("code", code));
    }

    private CodeExecutionResult executeJavaScript(String code) {
        String url = sandboxUrl + "/run/javascript";
        return postToSandbox(url, Map.of("code", code));
    }

    private CodeExecutionResult executeJava(String code) {
        String url = sandboxUrl + "/run/java";
        return postToSandbox(url, Map.of("code", code));
    }

    private CodeExecutionResult executeCpp(String code) {
        String url = sandboxUrl + "/run/cpp";
        return postToSandbox(url, Map.of("code", code));
    }

    @SuppressWarnings("unchecked")
    private CodeExecutionResult postToSandbox(String url, Map<String, String> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String output = body.getOrDefault("output", "").toString();
                String error = body.getOrDefault("error", "").toString();
                Boolean success = Boolean.TRUE.equals(body.getOrDefault("success", Boolean.FALSE));
                return new CodeExecutionResult(output, error, success);
            } else {
                return new CodeExecutionResult("", "Sandbox returned non-200: " + response.getStatusCode(), false);
            }
        } catch (ResourceAccessException ex) {
            return new CodeExecutionResult("", "Timeout / Cannot reach sandbox: " + ex.getMessage(), false);
        } catch (RestClientException ex) {
            return new CodeExecutionResult("", "Sandbox error: " + ex.getMessage(), false);
        } catch (Exception ex) {
            return new CodeExecutionResult("", "Unexpected error: " + ex.getMessage(), false);
        }
    }
}
