package com.edge;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

@SpringBootApplication
public class EdgeApplication {

	public static void main(String[] args) {
		// Set character encoding in system properties
		System.setProperty("file.encoding", "UTF-8");
		System.setProperty("sun.jnu.encoding", "UTF-8");

		SpringApplication.run(EdgeApplication.class, args);
	}

	@Configuration
	public static class WebConfig implements WebMvcConfigurer {

		@Override
		public void configureMessageConverters(List<org.springframework.http.converter.HttpMessageConverter<?>> converters) {
			converters.add(new StringHttpMessageConverter(StandardCharsets.UTF_8));
		}
	}

	@Bean
	public ApplicationRunner initData(com.edge.service.JsonDbService jsonDbService) {
		return args -> {
			System.out.println("ApplicationRunner: Initializing JsonDbService...");
			// Force initialization of JsonDbService
			jsonDbService.getAllUsers();
			System.out.println("ApplicationRunner: JsonDbService initialized");
		};
	}
}
