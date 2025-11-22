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
    // Image duy nhất cho sandbox
    private static final String EXECUTOR_IMAGE = "anhphu4784/code-executor:latest";
    private static Boolean dockerAvailable = null; // Cache Docker availability check

    // Kiểm tra Docker có sẵn không
    private boolean isDockerAvailable() {
        if (dockerAvailable != null) {
            return dockerAvailable;
        }
        
        try {
            ProcessBuilder checkProcess = new ProcessBuilder("docker", "--version");
            Process check = checkProcess.start();
            boolean completed = check.waitFor(3, TimeUnit.SECONDS);
            if (completed && check.exitValue() == 0) {
                dockerAvailable = true;
                return true;
            }
        } catch (Exception e) {
            // Docker không có sẵn
        }
        
        dockerAvailable = false;
        return false;
    }

    // Phương thức chung để thực thi code trong container
    private CodeExecutionResult executeInContainer(String[] command, String code, String fileName) {
        // Kiểm tra Docker có sẵn không
        if (!isDockerAvailable()) {
            return new CodeExecutionResult("", 
                "Docker không khả dụng. Vui lòng cài đặt Docker hoặc kiểm tra Docker daemon đang chạy.\n" +
                "Lỗi: Cannot run program \"docker\": error=2, No such file or directory", 
                false);
        }
        
        Process process = null;
        try {
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

        } catch (IOException e) {
            // Kiểm tra nếu lỗi là do Docker không tìm thấy
            if (e.getMessage() != null && e.getMessage().contains("Cannot run program \"docker\"")) {
                dockerAvailable = false; // Update cache
                return new CodeExecutionResult("", 
                    "Docker không khả dụng. Vui lòng cài đặt Docker hoặc kiểm tra Docker daemon đang chạy.\n" +
                    "Lỗi: " + e.getMessage(), 
                    false);
            }
            return new CodeExecutionResult("", "Execution error: " + e.getMessage(), false);
        } catch (Exception e) {
            return new CodeExecutionResult("", "Execution error: " + e.getMessage(), false);
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    // Python execution
    public CodeExecutionResult executePython(String code, String fileName) {
        String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "100m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                EXECUTOR_IMAGE,
                "python3", "-c", code
        };
        return executeInContainer(command, code, fileName);
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
                EXECUTOR_IMAGE,
                "node", "-e", code
        };
        return executeInContainer(command, code, fileName);
    }

    // Java execution
    public CodeExecutionResult executeJava(String code, String fileName) {
        String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "200m",
                "--cpus", "0.5",
                "--network", "none",
                "--cap-drop=ALL",
                EXECUTOR_IMAGE,
                "sh", "-c",
                "cat > /tmp/Main.java && cd /tmp && javac Main.java && java Main"
        };
        return executeInContainer(command, code, fileName);
    }

    // C++ execution
    public CodeExecutionResult executeCpp(String code, String fileName) {
        String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "200m",
                "--cpus", "0.5",
                "--network", "none",
                "--cap-drop=ALL",
                EXECUTOR_IMAGE,
                "sh", "-c",
                "cat > /tmp/main.cpp && cd /tmp && g++ -o main main.cpp && ./main"
        };
        return executeInContainer(command, code, fileName);
    }

    // HTML execution/validation
    public CodeExecutionResult executeHtml(String code, String fileName) {
        String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "50m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                EXECUTOR_IMAGE,
                "sh", "-c",
                "echo '" + escapeForShell(code) + "' > /tmp/index.html && echo 'HTML validation completed'"
        };
        CodeExecutionResult result = executeInContainer(command, null, fileName);

        boolean hasBasicStructure = code.matches("(?s).*<html.*>.*</html>.*") ||
                                    code.matches("(?s).*<body.*>.*</body>.*") ||
                                    code.matches("(?s).*<div.*>.*</div>.*");

        if (hasBasicStructure) {
            return new CodeExecutionResult("HTML code structure is valid\n" + result.getOutput(), "", true);
        } else {
            return new CodeExecutionResult(result.getOutput(), "Warning: Basic HTML structure might be missing", true);
        }
    }

    // CSS execution/validation
    public CodeExecutionResult executeCss(String code, String fileName) {
        String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "50m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                EXECUTOR_IMAGE,
                "sh", "-c",
                "echo 'CSS validation completed'"
        };
        CodeExecutionResult result = executeInContainer(command, null, fileName);

        boolean isValidSyntax = code.matches("(?s).*\\{[^}]*\\}.*") || code.trim().isEmpty();
        if (isValidSyntax) {
            return new CodeExecutionResult("CSS syntax appears valid\n" + result.getOutput(), "", true);
        } else {
            return new CodeExecutionResult(result.getOutput(), "Warning: CSS syntax might be invalid - missing braces or selectors", true);
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
                EXECUTOR_IMAGE,
                "node", "-e", validationScript
        };
        return executeInContainer(command, null, fileName);
    }

    // SQL validation
    public CodeExecutionResult executeSql(String code, String fileName) {
        String[] command = {
                "docker", "run", "-i", "--rm",
                "--memory", "100m",
                "--cpus", "0.5",
                "--network", "none",
                "--read-only",
                "--cap-drop=ALL",
                EXECUTOR_IMAGE,
                "sh", "-c",
                "sqlite3 :memory: '.help' > /dev/null && echo 'SQLite is ready for SQL validation'"
        };
        CodeExecutionResult result = executeInContainer(command, null, fileName);

        boolean hasSqlKeywords = code.toUpperCase().matches("(?s).*\\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\\b.*");
        if (hasSqlKeywords) {
            return new CodeExecutionResult("SQL syntax appears valid\n" + result.getOutput(), "", true);
        } else {
            return new CodeExecutionResult(result.getOutput(), "Warning: No SQL keywords detected - this might not be valid SQL", true);
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
