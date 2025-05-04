// package com.LinkVerse.donation_service.repository.client;
//
// import com.LinkVerse.donation_service.configuration.AuthenticationRequestInterceptor;
// import com.LinkVerse.donation_service.dto.request.AiSuggestionRequest;
// import com.LinkVerse.donation_service.dto.request.GeminiRequest;
// import org.springframework.cloud.openfeign.FeignClient;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
//
// import java.util.List;
//
// @FeignClient(name = "ai-support", url = "http://localhost:8084/Ai", configuration =
// {AuthenticationRequestInterceptor.class})
// public interface AISupportClient {
//  @PostMapping("/AiTele/ask")
//    String askGemini(@RequestBody GeminiRequest request);
//
//    @PostMapping("/AiTele/intent")
//    String extractIntent(@RequestBody GeminiRequest request);
// }
