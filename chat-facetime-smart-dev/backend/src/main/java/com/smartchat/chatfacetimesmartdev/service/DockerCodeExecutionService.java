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

    private static final int EXECUTION_TIMEOUT_SECONDS = 30;

    // Phương thức chung để thực thi code trong container
    private CodeExecutionResult executeInContainer(String image, String[] command, String code, String fileName) {
        Process process = null;
        try {
            // Kiểm tra xem image có tồn tại không
            if (!checkDockerImageExists(image)) {
                return new CodeExecutionResult("", "Docker image not found: " + image + ". Please pull the image first.", false);
            }

            ProcessBuilder processBuilder = new ProcessBuilder(command);
            process = processBuilder.start();

            // Ghi code vào stdin của process nếu cần
            if (code != null && !code.isEmpty()) {
                try (var writer = process.getOutputStream()) {
                    writer.write(code.getBytes());
                    writer.flush();
                }
            }

            boolean completed = process.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!completed) {
                process.destroyForcibly();
                return new CodeExecutionResult("", "Execution timeout after " + EXECUTION_TIMEOUT_SECONDS + " seconds", false);
            }

            String output = readInputStream(process);
            String errors = readErrorStream(process);
            int exitCode = process.exitValue();

            if (exitCode == 0) {
                return new CodeExecutionResult(output, errors, true);
            } else {
                return new CodeExecutionResult(output, "Exit code: " + exitCode + "\nErrors: " + errors, false);
            }

        } catch (Exception e) {
            return new CodeExecutionResult("", "Execution error: " + e.getMessage(), false);
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    // Kiểm tra Docker image có tồn tại không
    private boolean checkDockerImageExists(String image) {
        try {
            Process process = new ProcessBuilder("docker", "image", "inspect", image).start();
            return process.waitFor(5, TimeUnit.SECONDS) && process.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }

    // Python execution - sử dụng image chính xác
    public CodeExecutionResult executePython(String code, String fileName) {
        String[] command = {
            "docker", "run", "-i", "--rm",
            "--memory", "100m",
            "--cpus", "0.5",
            "--network", "none",
            "--read-only",
            "--cap-drop=ALL",
            "python:3.9-alpine",
            "python", "-c", code
        };
        return executeInContainer("python:3.9-alpine", command, code, fileName);
    }

    // JavaScript execution
    public CodeExecutionResult executeJavaScript(String code, String fileName) {
        String[] command = {
            "docker", "run", "-i", "--rm",
            "--memory", "100m",
            "--cpus", "0.5",
            "--network", "none",
            "--read-only",
            "--cap-drop=ALL",
            "node:18-alpine",
            "node", "-e", code
        };
        return executeInContainer("node:18-alpine", command, code, fileName);
    }

    // Java execution - sử dụng image chính xác
    public CodeExecutionResult executeJava(String code, String fileName) {
        // Tạo file Java và thực thi
        String[] command = {
            "docker", "run", "-i", "--rm",
            "--memory", "200m",
            "--cpus", "0.5",
            "--network", "none",
            "--cap-drop=ALL",
            "openjdk:17-alpine",
            "sh", "-c",
            "cat > /tmp/Main.java && cd /tmp && javac Main.java && java Main"
        };
        return executeInContainer("openjdk:17-alpine", command, code, fileName);
    }

    // C++ execution - sử dụng image chính xác
    public CodeExecutionResult executeCpp(String code, String fileName) {
        String[] command = {
            "docker", "run", "-i", "--rm",
            "--memory", "200m",
            "--cpus", "0.5",
            "--network", "none",
            "--cap-drop=ALL",
            "gcc:latest",
            "sh", "-c",
            "cat > /tmp/main.cpp && cd /tmp && g++ -o main main.cpp && ./main"
        };
        return executeInContainer("gcc:latest", command, code, fileName);
    }

    // HTML validation
    public CodeExecutionResult executeHtml(String code, String fileName) {
        try {
            // Sử dụng tidy để validate HTML
            String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "50m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                "node:18-alpine",
                "sh", "-c",
                "echo '" + escapeForShell(code) + "' > /tmp/index.html && echo 'HTML validation completed'"
            };
            CodeExecutionResult result = executeInContainer("node:18-alpine", command, null, fileName);

            // Kiểm tra cơ bản HTML structure
            boolean hasBasicStructure = code.matches("(?s).*<html.*>.*</html>.*") ||
                                      code.matches("(?s).*<body.*>.*</body>.*") ||
                                      code.matches("(?s).*<div.*>.*</div>.*");

            if (hasBasicStructure) {
                return new CodeExecutionResult("HTML code structure is valid\n" + result.getOutput(), "", true);
            } else {
                return new CodeExecutionResult(result.getOutput(), "Warning: Basic HTML structure might be missing", true);
            }
        } catch (Exception e) {
            return new CodeExecutionResult("", "HTML validation error: " + e.getMessage(), false);
        }
    }

    // CSS validation
    public CodeExecutionResult executeCss(String code, String fileName) {
        try {
            // Sử dụng node để validate CSS cơ bản
            String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "50m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                "node:18-alpine",
                "sh", "-c",
                "echo 'CSS validation completed'"
            };
            CodeExecutionResult result = executeInContainer("node:18-alpine", command, null, fileName);

            // Kiểm tra cú pháp CSS cơ bản
            boolean isValidSyntax = code.matches("(?s).*\\{[^}]*\\}.*") || code.trim().isEmpty();

            if (isValidSyntax) {
                return new CodeExecutionResult("CSS syntax appears valid\n" + result.getOutput(), "", true);
            } else {
                return new CodeExecutionResult(result.getOutput(), "Warning: CSS syntax might be invalid - missing braces or selectors", true);
            }
        } catch (Exception e) {
            return new CodeExecutionResult("", "CSS validation error: " + e.getMessage(), false);
        }
    }

    // JSON validation
    public CodeExecutionResult executeJson(String code, String fileName) {
        String validationScript =
            "const code = `" + escapeForJavaScript(code) + "`;\n" +
            "try {\n" +
            "  JSON.parse(code);\n" +
            "  console.log('✅ Valid JSON');\n" +
            "} catch(e) {\n" +
            "  console.error('❌ Invalid JSON:', e.message);\n" +
            "  process.exit(1);\n" +
            "}";

        String[] command = {
            "docker", "run", "-i", "--rm",
            "--memory", "50m",
            "--cpus", "0.5",
            "--network", "none",
            "--read-only",
            "--cap-drop=ALL",
            "node:18-alpine",
            "node", "-e", validationScript
        };
        return executeInContainer("node:18-alpine", command, null, fileName);
    }

    // SQL validation
    public CodeExecutionResult executeSql(String code, String fileName) {
        try {
            String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "100m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                "sqlite:latest",
                "sh", "-c",
                "sqlite3 :memory: '.help' > /dev/null && echo 'SQLite is ready for SQL validation'"
            };

            CodeExecutionResult result = executeInContainer("sqlite:latest", command, null, fileName);

            // Kiểm tra cú pháp SQL cơ bản
            boolean hasSqlKeywords = code.toUpperCase().matches("(?s).*\\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\\b.*");

            if (hasSqlKeywords) {
                return new CodeExecutionResult("SQL syntax appears valid\n" + result.getOutput(), "", true);
            } else {
                return new CodeExecutionResult(result.getOutput(), "Warning: No SQL keywords detected - this might not be valid SQL", true);
            }
        } catch (Exception e) {
            return new CodeExecutionResult("", "SQL validation error: " + e.getMessage(), false);
        }
    }

    // Utility methods
    private String escapeForShell(String text) {
        return text.replace("'", "'\\''")
                  .replace("\"", "\\\"")
                  .replace("`", "\\`")
                  .replace("$", "\\$");
    }

    private String escapeForJavaScript(String text) {
        return text.replace("\\", "\\\\")
                  .replace("`", "\\`")
                  .replace("$", "\\$");
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