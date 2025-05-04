package com.LinkVerse.post.service;

import com.LinkVerse.event.dto.NotificationEvent;
import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.response.PostGroupResponse;
import com.LinkVerse.post.entity.PostGroup;
import com.LinkVerse.post.repository.PostGroupRepository;
import com.LinkVerse.post.repository.client.IdentityServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikePostGroup {
    private final PostGroupRepository postGroupRepository;
    private final PostMapper postMapper;
    private final IdentityServiceClient identityServiceClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ApiResponse<PostGroupResponse> likeGroupPost(String postId, String groupId) {
        // Get current user ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        // Check if user is in the group
        boolean isInGroup = identityServiceClient.isUserInGroup(groupId);
        if (!isInGroup) {
            return ApiResponse.<PostGroupResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to like posts in this group")
                    .build();
        }

        // Find the post
        PostGroup post = postGroupRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Verify post belongs to the specified group
        if (!groupId.equals(post.getGroupId())) {
            return ApiResponse.<PostGroupResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Post does not belong to the specified group")
                    .build();
        }

        // Check if the user has already liked the post
        if (post.getLikedUserIds() != null && post.getLikedUserIds().contains(userId)) {
            return ApiResponse.<PostGroupResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("User has already liked this post")
                    .build();
        }

        // Update the like count
        post.setLike(post.getLike() + 1);

        // Add user ID to the list of users who liked the post
        if (post.getLikedUserIds() == null) {
            post.setLikedUserIds(new ArrayList<>());
        }
        post.getLikedUserIds().add(userId);

        // Save the updated post
        post = postGroupRepository.save(post);

        // Send notification via Kafka
        Map<String, Object> params = Map.of("userId", userId, "postId", postId, "groupId", groupId);
        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("GROUP_POST_LIKE")
                .recipient(post.getUserId())
                .templateCode("GROUP_POST_LIKE_TEMPLATE")
                .param(params)
                .subject("Your group post was liked")
                .body("Your post in group was liked by " + userId)
                .build();
        kafkaTemplate.send("group-post-like-event", notificationEvent);

        return ApiResponse.<PostGroupResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Group post liked successfully")
                .result(postMapper.toPostGroupResponse(post))
                .build();
    }

    public ApiResponse<PostGroupResponse> unlikeGroupPost(String postId, String groupId) {
        // Get current user ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        // Check if user is in the group
        boolean isInGroup = identityServiceClient.isUserInGroup(groupId);
        if (!isInGroup) {
            return ApiResponse.<PostGroupResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to unlike posts in this group")
                    .build();
        }

        // Find the post
        PostGroup post = postGroupRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Verify post belongs to the specified group
        if (!groupId.equals(post.getGroupId())) {
            return ApiResponse.<PostGroupResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Post does not belong to the specified group")
                    .build();
        }

        // Check if the user has liked the post
        if (post.getLikedUserIds() == null || !post.getLikedUserIds().contains(userId)) {
            return ApiResponse.<PostGroupResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("User has not liked this post")
                    .build();
        }

        // Update the like count
        post.setLike(post.getLike() - 1);

        // Remove user ID from the list of users who liked the post
        post.getLikedUserIds().remove(userId);

        // Save the updated post
        post = postGroupRepository.save(post);

        return ApiResponse.<PostGroupResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Group post unliked successfully")
                .result(postMapper.toPostGroupResponse(post))
                .build();
    }
}