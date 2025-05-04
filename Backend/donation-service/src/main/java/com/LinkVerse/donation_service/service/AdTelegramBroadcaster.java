package com.LinkVerse.donation_service.service;

import java.io.File;
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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdTelegramBroadcaster {

    @Value("${telegram.ads-bot.token}")
    private String botToken;

    @Value("${telegram.ads-bot.chat-id}")
    private String defaultChatId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void send(String message) {
        sendTo(defaultChatId, message);
    }

    public void sendTo(String chatId, String message) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

            Map<String, String> payload = new HashMap<>();
            payload.put("chat_id", chatId);
            payload.put("text", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("✅ Gửi thành công tới chatId={}: {}", chatId, response.getBody());

        } catch (HttpClientErrorException e) {
            log.error("❌ Gửi thất bại tới chatId={}, lý do: {}", chatId, e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi tin nhắn Telegram tới {}: {}", chatId, message, e);
        }
    }

    public void sendPhoto(String chatId, String imageUrl, String caption) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendPhoto";

            Map<String, String> payload = new HashMap<>();
            payload.put("chat_id", chatId);
            payload.put("photo", imageUrl);
            payload.put("caption", caption);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi ảnh quảng cáo Telegram tới {}", chatId, e);
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
            log.error("❌ Lỗi gửi file quảng cáo Telegram", e);
        }
    }
}
