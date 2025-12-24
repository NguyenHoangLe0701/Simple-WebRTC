package com.smartchat.chatfacetimesmartdev.service;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.smartchat.chatfacetimesmartdev.dto.CodeExecutionResult;

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
                ? "https://sandbox-code-executor.onrender.com"
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
}
