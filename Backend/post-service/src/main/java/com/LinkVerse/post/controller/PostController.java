package com.LinkVerse.post.controller;

import com.LinkVerse.post.FileUtil;
import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.PageResponse;
import com.LinkVerse.post.dto.request.PostRequest;
import com.LinkVerse.post.dto.request.SharePostRequest;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostVisibility;
import com.LinkVerse.post.service.PostService;
import com.LinkVerse.post.service.TranslationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {

    final PostService postService;
    TranslationService translationService;
    PostMapper postMapper;

    @PostMapping("/suggest-content")
    public ResponseEntity<ApiResponse<List<String>>> suggestContent(@RequestBody String content) {
        return ResponseEntity.ok(postService.getPostSuggestions(content));
    }


    @PostMapping(value = "/with-ai-suggestion")
    public ResponseEntity<ApiResponse<PostResponse>> createPostWithAiSuggestion(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "useAiSuggestion", defaultValue = "false") boolean useAiSuggestion) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        PostRequest request = objectMapper.readValue(requestJson, PostRequest.class);

        ApiResponse<PostResponse> response = postService.createPostWithAiSuggestion(request, files, useAiSuggestion);

        return ResponseEntity.status(response.getCode()).body(response);
    }


    @GetMapping("/hashtags/posts")
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> getPostsByHashtag(
            @RequestParam String hashtagName,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Post> postPage = postService.getPostsByHashtag(hashtagName, pageable);

        List<PostResponse> postResponses = postPage.getContent().stream()
                .map(postMapper::toPostResponse)
                .toList();

        PageResponse<PostResponse> pageResponse = PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPage(postPage.getTotalPages())
                .totalElement(postPage.getTotalElements())
                .data(postResponses)
                .build();

        return ResponseEntity.ok(ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách bài viết theo hashtag thành công")
                .result(pageResponse)
                .build());
    }


    // Create a new post
    @PostMapping(value = "/post-file")
    public ResponseEntity<ApiResponse<PostResponse>> createPostWithImage(
            @RequestPart("request") String requestJson,
            @RequestPart("files") List<MultipartFile> files) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        PostRequest request = objectMapper.readValue(requestJson, PostRequest.class);

        ApiResponse<PostResponse> response = postService.createPostWithFiles(request, files);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/set-avatar")
    public ResponseEntity<String> updateImage(@RequestParam("request") String requestJson,
                                              @RequestParam("avatar") MultipartFile avatar) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        PostRequest request = objectMapper.readValue(requestJson, PostRequest.class);
        if (!FileUtil.isImageFile(avatar)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only image files are allowed.");
        }
        postService.postImageAvatar(request, avatar);
        return ResponseEntity.ok("Avatar updated successfully.");
    }

    @PostMapping("/{postId}/share")
    public ApiResponse<PostResponse> sharePost(
            @PathVariable String postId,
            @RequestBody SharePostRequest request) {

        ApiResponse<PostResponse> response = postService.sharePost(postId, request.getContent(), request.getVisibility());

        return ApiResponse.<PostResponse>builder()
                .code(response.getCode())
                .message(response.getMessage())
                .result(response.getResult())
                .build();
    }


    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable String id) {
        log.info("Delete post request: {}", id);
        ApiResponse<Void> response = postService.deletePost(id);
        return ResponseEntity.ok(response);
    }

    // Get my posts
    @GetMapping("/my-posts")
    public ApiResponse<PageResponse<PostResponse>> getMyPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        return postService.getMyPosts(page, size, includeDeleted);
    }

    @DeleteMapping("/shared/{sharedPostId}")
    public ResponseEntity<ApiResponse<Void>> deleteSharedPost(@PathVariable String sharedPostId) {
        postService.deleteSharedPost(sharedPostId);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(200)
                .message("Shared post deleted successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<PostResponse>> getHistoryPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getHistoryPosts(page, size);
    }


    @PostMapping("/{postId}/translate")
    public ResponseEntity<ApiResponse<PostResponse>> translatePostContent(
            @PathVariable String postId,
            @RequestParam String targetLanguage) {
        ApiResponse<PostResponse> response = translationService.translatePostContent(postId, targetLanguage);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/by-language")
    public ApiResponse<PageResponse<PostResponse>> getPostsByLanguage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String language) {
        return postService.getPostsByLanguage(page, size, language);
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPostById(@PathVariable String postId) {
        return postService.getPostById(postId);
    }

    @PostMapping("/{postId}/change-visibility")
    public ResponseEntity<ApiResponse<PostResponse>> changePostVisibility(
            @PathVariable String postId,
            @RequestParam String visibility) {
        try {
            PostVisibility newVisibility = PostVisibility.valueOf(visibility.toUpperCase());
            ApiResponse<PostResponse> response = postService.changePostVisibility(postId, newVisibility);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<PostResponse>builder()
                            .code(HttpStatus.FORBIDDEN.value())
                            .message(e.getMessage())
                            .build());
        }
    }


    @GetMapping("/all")
    public ApiResponse<PageResponse<PostResponse>> getAllPost(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getAllPost(page, size);
    }

    @GetMapping("/user-posts")
    public ApiResponse<PageResponse<PostResponse>> getAllPost(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String userId) {
        return postService.getUserPost(page, size, userId);
    }

    @PostMapping("/{postId}/save")
    public ApiResponse<PostResponse> savePost(@PathVariable String postId) {
        return postService.savePost(postId);
    }

    @PostMapping("/{postId}/unsave")
    public ApiResponse<PostResponse> unSavePost(@PathVariable String postId) {
        return postService.unSavePost(postId);
    }

    @GetMapping("/saved-posts")
    public ApiResponse<PageResponse<PostResponse>> getSavedPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getAllPostsave(page, size);
    }

    @GetMapping("/users/{userId}/shared-posts")
    public ApiResponse<PageResponse<PostResponse>> getSharedPostsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getSharedPostsByUserId(userId, page, size);
    }


}