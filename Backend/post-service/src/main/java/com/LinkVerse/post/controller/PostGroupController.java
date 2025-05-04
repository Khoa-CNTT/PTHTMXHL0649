package com.LinkVerse.post.controller;

import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.PageResponse;
import com.LinkVerse.post.dto.request.PostGroupRequest;
import com.LinkVerse.post.dto.response.PostGroupResponse;
import com.LinkVerse.post.dto.response.PostPendingResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.service.PostGroupService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/group")
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostGroupController {

    PostGroupService postGroupService;

    @GetMapping("/groups/{groupId}/users/{userId}/shared-posts")
    public ApiResponse<PageResponse<PostResponse>> getSharedPostsInGroupByUser(
            @PathVariable String groupId,
            @PathVariable String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return postGroupService.getSharedPostsInGroupByUserId(groupId, userId, page, size);
    }

    @PostMapping(value = "/post-file")
    public ResponseEntity<ApiResponse<PostGroupResponse>> createPostWithImage(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "forceAnonymous", required = false) Boolean forceAnonymous) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        PostGroupRequest request = objectMapper.readValue(requestJson, PostGroupRequest.class);

        ApiResponse<PostGroupResponse> response = postGroupService.createPostGroup(request, files, forceAnonymous);
        return ResponseEntity.ok(response);
    }
//    @PostMapping(value = "/post-file")
//    public ResponseEntity<ApiResponse<PostGroupResponse>> createPostWithImage(
//            @RequestPart("request") String requestJson,
//            @RequestPart("files") List<MultipartFile> files) throws IOException {
//
//        ObjectMapper objectMapper = new ObjectMapper();
//        PostGroupRequest request = objectMapper.readValue(requestJson, PostGroupRequest.class);
//
//        ApiResponse<PostGroupResponse> response = postGroupService.createPostGroup(request, files);
//        return ResponseEntity.ok(response);
//    }

    //    @PostMapping("/anonymous-questions")
//    public ResponseEntity<ApiResponse<AnonymousQuestionResponse>> askAnonymousQuestion(
//            @RequestPart("request") String requestJson,
//            @RequestPart("files") List<MultipartFile> files) throws IOException {
//
//        ObjectMapper objectMapper = new ObjectMapper();
//        AnonymousQuestionRequest request = objectMapper.readValue(requestJson, AnonymousQuestionRequest.class);
//
//        ApiResponse<AnonymousQuestionResponse> response = postGroupService.askAnonymousQuestion(request, files);
//        return new ResponseEntity<>(response, HttpStatus.valueOf(response.getCode()));
//    }
    @PatchMapping("/anonymous-mode")
    public ResponseEntity<ApiResponse<Void>> setAnonymousMode(@RequestParam boolean enabled) {
        postGroupService.setAnonymousMode(enabled);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Anonymous mode updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable String id) {
        log.info("Delete post request: {}", id);
        ApiResponse<Void> response = postGroupService.deletePost(id);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/{groupId}/{postId}")
    public ApiResponse<PostGroupResponse> getPostById(@PathVariable String postId, @PathVariable String groupId) {
        return postGroupService.getPostById(postId, groupId);
    }

    @GetMapping("/all")
    public ApiResponse<PageResponse<PostGroupResponse>> getAllPost(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String groupId) {
        return postGroupService.getAllPost(page, size, groupId);
    }

    @GetMapping("/user-posts")
    public ApiResponse<PageResponse<PostGroupResponse>> getAllUserPost(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String userId,
            @RequestParam String groupId) {
        return postGroupService.getUserPost(page, size, userId, groupId);
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PageResponse<PostPendingResponse>>> getAllPendingPosts(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam String groupId) {
        ApiResponse<PageResponse<PostPendingResponse>> response = postGroupService.getAllPendingPosts(page, size, groupId);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/approve/{postId}")
    public ResponseEntity<ApiResponse<PostGroupResponse>> approvePendingPost(
            @PathVariable String postId,
            @RequestParam String groupId) {
        ApiResponse<PostGroupResponse> response = postGroupService.approvePendingPost(postId, groupId);
        return ResponseEntity.status(response.getCode()).body(response);
    }

}