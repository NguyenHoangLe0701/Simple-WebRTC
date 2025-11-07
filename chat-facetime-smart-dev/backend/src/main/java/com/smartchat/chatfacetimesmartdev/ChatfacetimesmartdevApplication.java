package com.smartchat.chatfacetimesmartdev;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication(scanBasePackages = {"com.smartchat.chatfacetimesmartdev"})
public class ChatfacetimesmartdevApplication {

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	public static void main(String[] args) {
		SpringApplication.run(ChatfacetimesmartdevApplication.class, args);
		System.out.println("🚀 Application started successfully");
	}
}