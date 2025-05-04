package com.LinkVerse.donation_service.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.LinkVerse.donation_service.service.TelegramCommandHandler;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/telegram")
@RequiredArgsConstructor
public class TelegramWebhookController {

    private final TelegramCommandHandler telegramCommandHandler;

    @PostMapping("/webhook")
    public ResponseEntity<?> onUpdateReceived(@RequestBody Map<String, Object> update) {
        telegramCommandHandler.handleUpdate(update);
        return ResponseEntity.ok().build();
    }
}
