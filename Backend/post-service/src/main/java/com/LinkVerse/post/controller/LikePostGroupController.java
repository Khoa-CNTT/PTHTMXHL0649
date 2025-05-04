package com.LinkVerse.post.controller;

import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.response.PostGroupResponse;
import com.LinkVerse.post.service.LikePostGroup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/LIKEgroups")
public class LikePostGroupController {

    @Autowired
    private LikePostGroup likePostGroup;

    @PostMapping("/{groupId}/posts/{postId}/like")
    public ResponseEntity<ApiResponse<PostGroupResponse>> likeGroupPost(
            @PathVariable String groupId,
            @PathVariable String postId) {
        ApiResponse<PostGroupResponse> response = likePostGroup.likeGroupPost(postId, groupId);
        return new ResponseEntity<>(response, HttpStatus.valueOf(response.getCode()));
    }

    @PostMapping("/{groupId}/posts/{postId}/unlike")
    public ResponseEntity<ApiResponse<PostGroupResponse>> unlikeGroupPost(
            @PathVariable String groupId,
            @PathVariable String postId) {
        ApiResponse<PostGroupResponse> response = likePostGroup.unlikeGroupPost(postId, groupId);
        return new ResponseEntity<>(response, HttpStatus.valueOf(response.getCode()));
    }
}