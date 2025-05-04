package com.LinkVerse.Support.controller;

import com.LinkVerse.Support.dto.request.GeminiRequest;
import com.LinkVerse.Support.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gemini")
@RequiredArgsConstructor
public class GeminiController {

    private final GeminiService geminiService;

    @PostMapping("/ask")
    public String askGemini(@RequestBody GeminiRequest request) {
        return geminiService.askGemini(request);
    }

    @PostMapping("/extract-intent")
    public String extractIntent(@RequestBody GeminiRequest request) {
        return geminiService.extractIntentJson(request);
    }
}
