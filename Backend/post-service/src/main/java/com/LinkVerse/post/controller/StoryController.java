package com.LinkVerse.post.controller;

import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.PageResponse;
import com.LinkVerse.post.dto.request.StoryCreationRequest;
import com.LinkVerse.post.dto.response.StoryResponse;
import com.LinkVerse.post.service.StoryCleanupService;
import com.LinkVerse.post.service.StoryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/stories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StoryController {
    final StoryService storyService;
    final StoryCleanupService storyCleanupService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(
            @RequestParam("request") String requestJson,
            @RequestParam("files") List<MultipartFile> files) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        StoryCreationRequest request = objectMapper.readValue(requestJson, StoryCreationRequest.class);

        ApiResponse<StoryResponse> response = storyService.createStory(request, files);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getAllStories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<PageResponse<StoryResponse>> response = storyService.getAllStories(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getStoriesByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<PageResponse<StoryResponse>> response = storyService.getStoriesByUser(page, size, userId);
        return ResponseEntity.ok(response);
    }
}