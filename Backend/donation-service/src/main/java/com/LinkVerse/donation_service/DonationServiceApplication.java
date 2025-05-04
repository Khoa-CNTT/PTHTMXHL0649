package com.LinkVerse.donation_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.LinkVerse.donation_service.repository.client")
@EnableScheduling
public class DonationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DonationServiceApplication.class, args);
    }
}
