package com.LinkVerse.donation_service.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.LinkVerse.donation_service.repository.client.IdentityServiceClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramLinkingService {

    private final IdentityServiceClient identityServiceClient;
    private final Map<String, String> chatIdToUserIdMap = new ConcurrentHashMap<>();
    private final Map<String, String> userIdToChatIdMap = new ConcurrentHashMap<>();

    public void link(String chatId, Map<String, Object> message) {
        try {
            Map<String, Object> from = (Map<String, Object>) message.get("from");
            String userId = (String) from.get("username"); // Giả định username là userId

            if (userId == null) {
                log.warn("❌ Không tìm thấy username từ message: {}", message);
                return;
            }

            chatIdToUserIdMap.put(chatId, userId);
            userIdToChatIdMap.put(userId, chatId);

            log.info("✅ [Local] Liên kết chatId={} với userId={}", chatId, userId);
        } catch (Exception e) {
            log.error("❌ Lỗi khi liên kết Telegram chatId", e);
        }
    }

    public String resolveUserId(String chatId) {
        return chatIdToUserIdMap.get(chatId);
    }

    public String resolveChatId(String userId) {
        return userIdToChatIdMap.get(userId);
    }
}
