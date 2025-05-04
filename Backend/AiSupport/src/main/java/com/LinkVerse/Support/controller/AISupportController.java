package com.LinkVerse.Support.controller;

import com.LinkVerse.Support.service.ContentSuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/gemini")
public class AISupportController {

    private final ContentSuggestionService contentSuggestionService;

    @PostMapping("/suggest-content")
    public ResponseEntity<List<String>> suggestContent(@RequestBody String content) {
        List<String> suggestions = contentSuggestionService.suggestContent(content);
        return ResponseEntity.ok(suggestions);
    }


    @PostMapping("/generate-content")
    public ResponseEntity<String> generatePost(@RequestBody String topic) {
        String generatedContent = contentSuggestionService.generatePostFromAI(topic);
        return ResponseEntity.ok(generatedContent);
    }
}
