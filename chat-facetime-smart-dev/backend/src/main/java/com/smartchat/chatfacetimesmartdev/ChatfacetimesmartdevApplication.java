package com.smartchat.chatfacetimesmartdev;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean; // Thêm import
import org.springframework.web.client.RestTemplate; // Thêm import
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(scanBasePackages = {"com.smartchat.chatfacetimesmartdev"})
public class ChatfacetimesmartdevApplication {

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.systemProperties() // Quan trọng: nạp vào System Properties
				.load();
		SpringApplication.run(ChatfacetimesmartdevApplication.class, args);
		System.out.println("🚀 Application started - All packages will be scanned");
	}

}
