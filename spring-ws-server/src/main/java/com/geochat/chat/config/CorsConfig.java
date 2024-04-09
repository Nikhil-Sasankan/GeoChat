package com.geochat.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//Add CORS configuration to your Spring Boot application
@Configuration
public class CorsConfig implements WebMvcConfigurer {
 @Override
 public void addCorsMappings(CorsRegistry registry) {
     registry.addMapping("/**")
             .allowedOrigins("*") // Allow requests from frontend URL
             .allowedMethods("GET", "POST", "PUT", "DELETE");
             // Add more allowed methods as needed
 }
}