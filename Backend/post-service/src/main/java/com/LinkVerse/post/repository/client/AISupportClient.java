package com.LinkVerse.post.repository.client;

import com.LinkVerse.post.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.post.dto.request.AiSuggestionRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "ai-support", url = "http://localhost:8084/Ai", configuration = {AuthenticationRequestInterceptor.class})
public interface AISupportClient {
    @PostMapping(value = "/gemini/suggest-content", consumes = "application/json")
    List<String> getSuggestions(@RequestBody AiSuggestionRequest request);

    @PostMapping(value = "/gemini/generate-content", consumes = "application/json")
    String generateContent(@RequestBody AiSuggestionRequest request);
}
