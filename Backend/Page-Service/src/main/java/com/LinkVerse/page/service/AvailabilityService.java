package com.LinkVerse.page.service;

import com.LinkVerse.page.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {
    private final RedisTemplate<String, List<String>> redisTemplate;

    // Lưu trữ availability vào Redis
    public ApiResponse<Void> saveAvailability(List<String> availability) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        redisTemplate.opsForValue().set("availability:" + userId, availability);

        return ApiResponse.<Void>builder()
                .code(2000)
                .message("Availability saved successfully!")
                .build();
    }

    // Lấy availability từ Redis
    public ApiResponse<List<String>> getAvailability() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        List<String> availability = redisTemplate.opsForValue().get("availability:" + userId);

        return ApiResponse.<List<String>>builder()
                .code(2000)
                .message("Availability retrieved successfully!")
                .result(availability)
                .build();
    }
}
