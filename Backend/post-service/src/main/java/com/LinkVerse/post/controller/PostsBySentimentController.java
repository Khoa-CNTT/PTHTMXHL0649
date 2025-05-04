package com.LinkVerse.post.controller;

import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.PageResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.service.PostsBySentiment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PostsBySentimentController {

    private final PostsBySentiment postsBySentiment;

    @GetMapping("/by-sentiment")
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> getPostsBySentiment(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam String sentiment) {
        ApiResponse<PageResponse<PostResponse>> response = postsBySentiment.getPostsBySentiment(page, size, sentiment);
        return ResponseEntity.status(response.getCode()).body(response);
    }
}