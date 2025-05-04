package com.LinkVerse.donation_service.repository.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.LinkVerse.donation_service.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.notification.dto.ApiResponse;

@FeignClient(
        name = "page-service",
        url = "http://localhost:8087/page",
        configuration = {AuthenticationRequestInterceptor.class})
public interface VolunteerAvailabilityClient {
    @GetMapping("/volunteers/availability")
    ApiResponse<List<String>> getAvailability(); // 👈 CHỈNH lại kiểu trả về đúng với response
}
