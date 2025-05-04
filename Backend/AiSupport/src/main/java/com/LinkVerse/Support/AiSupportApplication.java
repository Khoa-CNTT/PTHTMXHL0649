package com.LinkVerse.Support;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AiSupportApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiSupportApplication.class, args);
    }
}
