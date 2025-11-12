package com.smartchat.chatfacetimesmartdev;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication(scanBasePackages = {"com.smartchat.chatfacetimesmartdev"})
@EnableScheduling
public class ChatfacetimesmartdevApplication {

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	public static void main(String[] args) {
		// Load .env file if it exists
		// Try multiple locations: current directory, backend directory, and parent directory
		Dotenv dotenv = null;
		String[] possiblePaths = {"./", "./backend/", "../"};
		
		for (String path : possiblePaths) {
			try {
				dotenv = Dotenv.configure()
						.directory(path)
						.ignoreIfMissing()
						.load();
				if (dotenv != null && !dotenv.entries().isEmpty()) {
					System.out.println("✅ Loaded .env file from: " + path);
					break;
				}
			} catch (Exception e) {
				// Try next path
				continue;
			}
		}
		
		// Set system properties from .env file
		if (dotenv != null) {
			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());
			});
		} else {
			System.out.println("⚠️  .env file not found. Using system environment variables or default values.");
		}
		
		SpringApplication.run(ChatfacetimesmartdevApplication.class, args);
		System.out.println("🚀 Application started successfully");
	}
}
