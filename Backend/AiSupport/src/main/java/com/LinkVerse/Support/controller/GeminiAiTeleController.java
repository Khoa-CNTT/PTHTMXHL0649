package com.LinkVerse.Support.controller;

import com.LinkVerse.Support.dto.request.GeminiRequest;
import com.LinkVerse.Support.service.GeminiAiTeleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/AiTele")
@RequiredArgsConstructor
@Slf4j
public class GeminiAiTeleController {

    private final GeminiAiTeleService geminiAiTeleService;

    @PostMapping("/ask")
    public ResponseEntity<String> ask(@RequestBody GeminiRequest request) {
        String reply = geminiAiTeleService.askGemini(request);
        return ResponseEntity.ok(reply);
    }

    @PostMapping("/intent")
    public ResponseEntity<String> extractIntent(@RequestBody GeminiRequest request) {
        if (request.getUserQuestion() == null || request.getUserQuestion().isBlank()) {
            log.warn("🚫 Không nhận được userQuestion từ phía donation_service: {}", request);
        } else {
            log.info("✅ Nhận userQuestion: {}", request.getUserQuestion());
        }
        String result = geminiAiTeleService.extractIntent(request);
        return ResponseEntity.ok(result);
    }
}
