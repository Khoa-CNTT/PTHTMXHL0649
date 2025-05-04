package com.LinkVerse.donation_service.service;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramServiceAdmin {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.chat-id}")
    private String chatId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendTo(String targetChatId, String message) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

            Map<String, String> payload = new HashMap<>();
            payload.put("chat_id", targetChatId);
            payload.put("text", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, request, String.class);

            log.info("📨 Gửi tin nhắn Telegram tới {}: {}", targetChatId, message);
        } catch (Exception e) {
            log.error("❌ Gửi tin nhắn Telegram thất bại tới {}: {}", targetChatId, message, e);
        }
    }

    public void send(String message) {
        try {
            String url =
                    "https://api.telegram.org/bot" + botToken + "/sendMessage?chat_id=" + chatId + "&text=" + message;

            restTemplate.getForObject(url, String.class);
            log.info("📨 Gửi cảnh báo Telegram: {}", message);

        } catch (Exception e) {
            log.error("❌ Gửi Telegram thất bại", e);
        }
    }

    public void sendPhoto(String imageUrl, String caption) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendPhoto";

            Map<String, String> payload = new HashMap<>();
            payload.put("chat_id", chatId);
            payload.put("photo", imageUrl);
            payload.put("caption", caption);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("📸 Gửi ảnh Telegram thành công: {}", imageUrl);
            } else {
                log.warn("⚠️ Telegram trả về lỗi: {}", response.getBody());
            }

        } catch (Exception e) {
            log.error("❌ Gửi ảnh Telegram thất bại. chatId={}, image={}, caption={}", chatId, imageUrl, caption, e);
        }
    }

    public boolean isImageUrlReachable(String url) {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");
            return connection.getResponseCode() == 200;
        } catch (IOException e) {
            return false;
        }
    }

    public void sendDocument(String chatId, File file, String caption) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendDocument";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("chat_id", chatId);
            body.add("caption", caption);
            body.add("document", new FileSystemResource(file));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            log.error("❌ Gửi file Telegram thất bại", e);
        }
    }
}
