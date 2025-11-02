package com.smartchat.chatfacetimesmartdev;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.smartchat.chatfacetimesmartdev", "controller", "service", "dto", "entity", "repository", "model", "util"})
public class ChatfacetimesmartdevApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChatfacetimesmartdevApplication.class, args);
		System.out.println("🚀 Application started - All packages will be scanned");
	}

}
