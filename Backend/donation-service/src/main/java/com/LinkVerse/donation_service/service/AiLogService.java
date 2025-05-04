package com.LinkVerse.donation_service.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.LinkVerse.donation_service.entity.AiLog;
import com.LinkVerse.donation_service.repository.AiLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiLogService {

    private final AiLogRepository aiLogRepository;

    public void log(String chatId, String userInput, String aiResponse, String intent, String campaignId) {
        AiLog log = AiLog.builder()
                .chatId(chatId)
                .userInput(userInput)
                .aiResponse(aiResponse)
                .intent(intent)
                .campaignId(campaignId)
                .createdAt(LocalDateTime.now())
                .build();
        aiLogRepository.save(log);
    }
}
