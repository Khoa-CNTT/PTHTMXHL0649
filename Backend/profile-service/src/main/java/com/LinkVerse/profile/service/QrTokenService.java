package com.LinkVerse.profile.service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QrTokenService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String PREFIX = "qr_token:";

    public String generateToken(String userId) {
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(PREFIX + token, userId, Duration.ofMinutes(5));
        return token;
    }

    public Optional<String> getUserIdFromToken(String token) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(PREFIX + token));
    }

    public void deleteToken(String token) {
        redisTemplate.delete(PREFIX + token);
    }
}
