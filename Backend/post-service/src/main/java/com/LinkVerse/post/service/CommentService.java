package com.LinkVerse.post.service;

import com.LinkVerse.event.dto.NotificationEvent;
import com.LinkVerse.identity.dto.response.UserInfoResponse;
import com.LinkVerse.post.Mapper.CommentMapper;
import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.request.CommentRequest;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.Comment;
import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostVisibility;
import com.LinkVerse.post.exception.AppException;
import com.LinkVerse.post.exception.ErrorCode;
import com.LinkVerse.post.repository.CommentRepository;
import com.LinkVerse.post.repository.PostRepository;
import com.LinkVerse.post.repository.client.IdentityServiceClient;
import com.amazonaws.services.s3.model.S3Object;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostMapper postMapper;
    private final S3Service s3Service;
    private final RekognitionService rekognitionService;
    private final CommentMapper commentMapper;
    private final IdentityServiceClient identityServiceClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ApiResponse<PostResponse> addComment(String postId, CommentRequest commentRequest, List<MultipartFile> imageFiles) {
        // Validate input: At least content or images must be present
        if ((commentRequest == null || (commentRequest.getContent() == null || commentRequest.getContent().trim().isEmpty()))
                && (imageFiles == null || imageFiles.isEmpty())
                && (commentRequest.getImageUrls() == null || commentRequest.getImageUrls().isEmpty())) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Comment content or sticker must not be empty.")
                    .build();
        }

        // Find the post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        // Check user authentication and authorization
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to comment on this post")
                    .build();
        }

        // Fetch user info for username and avatar
        UserInfoResponse userInfo = getUserInfoWithFallback(currentUserId);

        // Process image uploads for the comment
        List<String> safeFileUrls = new ArrayList<>();

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String fileUrl = s3Service.uploadFile(file);
                        String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
                        S3Object s3Object = s3Service.getObject(fileName);

                        if (rekognitionService.isImageSafe(s3Object)) {
                            safeFileUrls.add(fileUrl);
                            log.info("Safe image added to comment: {}", fileUrl);
                        } else {
                            log.warn("Unsafe content detected in file: {}", fileName);
                            s3Service.deleteFile(fileName);
                        }
                    } catch (Exception e) {
                        log.error("Error during file upload or validation: {}", e.getMessage(), e);
                    }
                }
            }
        }

        if (commentRequest.getImageUrls() != null && !commentRequest.getImageUrls().isEmpty()) {
            safeFileUrls.addAll(commentRequest.getImageUrls());
        }

        // Create new comment
        Comment newComment = Comment.builder()
                .content(commentRequest.getContent())
                .userId(currentUserId)
                .username(userInfo.getUsername())
                .imageUrl(userInfo.getImageUrl()) // Set imageUrl as the user's avatar
                .imageUrls(safeFileUrls) // Set imageUrls as the comment's images
                .like(0)
                .unlike(0)
                .likeCount(0)
                .createdDate(Instant.now())
                .commentId(UUID.randomUUID().toString())
                .id(UUID.randomUUID().toString())
                .deleted(false)
                .build();

        // Save the comment to the repository
        commentRepository.save(newComment);

        // Add comment to the post
        if (post.getComments() == null) {
            post.setComments(new ArrayList<>());
        }
        post.getComments().add(newComment);
        post.setCommentCount(post.getComments().size());
        postRepository.save(post);

        // Send notification via Kafka
        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("COMMENT_ADDED")
                .recipient(post.getUserId())
                .templateCode("COMMENT_ADDED_TEMPLATE")
                .param(Map.of("userId", currentUserId, "postId", postId, "commentId", newComment.getCommentId()))
                .subject("A new comment has been added to your post")
                .body("User " + userInfo.getUsername() + " commented on your post: " + commentRequest.getContent())
                .build();
        kafkaTemplate.send("comment-added-event", notificationEvent);
        log.info("Gửi sự kiện thông báo bình luận mới cho bài viết {} đến người dùng {}", postId, post.getUserId());

        // Fetch the updated post with all comments from commentRepository to ensure full data
        Post updatedPost = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        List<Comment> fullComments = new ArrayList<>();
        for (Comment comment : updatedPost.getComments()) {
            Comment fullComment = commentRepository.findById(comment.getId())
                    .orElse(comment); // Fallback to embedded comment if not found
            fullComments.add(fullComment);
        }
        updatedPost.setComments(fullComments);

        // Map and return updated post
        PostResponse postResponse = postMapper.toPostResponse(updatedPost);
        postResponse.setUsername(getUserInfoWithFallback(post.getUserId()).getUsername());
        postResponse.setImageUrl(getUserInfoWithFallback(post.getUserId()).getImageUrl());

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Comment added successfully.")
                .result(postResponse)
                .build();
    }

    @Transactional
    public ApiResponse<PostResponse> editComment(String postId, String commentId, CommentRequest commentRequest, List<MultipartFile> imageFiles) {
        String userId = getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to edit this comment")
                    .build();
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getUserId().equals(userId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to edit this comment")
                    .build();
        }

        if ((commentRequest.getContent() == null || commentRequest.getContent().trim().isEmpty())
                && (imageFiles == null || imageFiles.isEmpty())
                && (commentRequest.getImageUrls() == null || commentRequest.getImageUrls().isEmpty())) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Comment content or images must not be empty")
                    .build();
        }

        List<String> safeFileUrls = new ArrayList<>();

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String fileUrl = s3Service.uploadFile(file);
                        String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
                        S3Object s3Object = s3Service.getObject(fileName);

                        if (rekognitionService.isImageSafe(s3Object)) {
                            safeFileUrls.add(fileUrl);
                            log.info("Safe image added to comment: {}", fileUrl);
                        } else {
                            log.warn("Unsafe content detected in file: {}", fileName);
                            s3Service.deleteFile(fileName);
                        }
                    } catch (Exception e) {
                        log.error("Error during file upload or validation: {}", e.getMessage(), e);
                        return ApiResponse.<PostResponse>builder()
                                .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .message("Failed to process image files")
                                .build();
                    }
                }
            }
        }

        comment.setContent(commentRequest.getContent());

        if (!safeFileUrls.isEmpty()) {
            comment.setImageUrls(safeFileUrls);
        } else if (commentRequest.getImageUrls() != null && !commentRequest.getImageUrls().isEmpty()) {
            comment.setImageUrls(commentRequest.getImageUrls());
        }

        commentRepository.save(comment);

        List<Comment> postComments = post.getComments();
        for (int i = 0; i < postComments.size(); i++) {
            Comment existingComment = postComments.get(i);
            if (existingComment.getId().equals(commentId)) {
                postComments.set(i, comment);
                break;
            }
        }

        postRepository.save(post);

        // Fetch updated post with full comments
        Post updatedPost = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        List<Comment> fullComments = new ArrayList<>();
        for (Comment commentInPost : updatedPost.getComments()) {
            Comment fullComment = commentRepository.findById(commentInPost.getId())
                    .orElse(commentInPost);
            fullComments.add(fullComment);
        }
        updatedPost.setComments(fullComments);

        PostResponse postResponse = postMapper.toPostResponse(updatedPost);
        postResponse.setUsername(getUserInfoWithFallback(post.getUserId()).getUsername());
        postResponse.setImageUrl(getUserInfoWithFallback(post.getUserId()).getImageUrl());

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Comment edited successfully")
                .result(postResponse)
                .build();
    }

    @Transactional
    public ApiResponse<PostResponse> deleteComment(String postId, String commentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        String currentUserId = getCurrentUserId();

        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to delete comments on this post")
                    .build();
        }

        if (!comment.getUserId().equals(currentUserId) && !post.getUserId().equals(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to delete this comment")
                    .build();
        }

        if (comment.getImageUrls() != null && !comment.getImageUrls().isEmpty()) {
            for (String imageUrl : comment.getImageUrls()) {
                try {
                    String fileName = extractFileNameFromUrl(decodeUrl(imageUrl));
                    s3Service.deleteFile(fileName);
                    log.info("Deleted image from S3: {}", fileName);
                } catch (Exception e) {
                    log.error("Failed to delete image from S3: {}", imageUrl, e);
                }
            }
        }

        post.getComments().removeIf(c -> c.getId().equals(commentId));
        post.setCommentCount(post.getComments().size());
        postRepository.save(post);

        commentRepository.delete(comment);

        // Fetch updated post with full comments
        Post updatedPost = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        List<Comment> fullComments = new ArrayList<>();
        for (Comment commentInPost : updatedPost.getComments()) {
            Comment fullComment = commentRepository.findById(commentInPost.getId())
                    .orElse(commentInPost);
            fullComments.add(fullComment);
        }
        updatedPost.setComments(fullComments);

        PostResponse postResponse = postMapper.toPostResponse(updatedPost);
        postResponse.setUsername(getUserInfoWithFallback(updatedPost.getUserId()).getUsername());
        postResponse.setImageUrl(getUserInfoWithFallback(updatedPost.getUserId()).getImageUrl());

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Comment deleted successfully.")
                .result(postResponse)
                .build();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private String extractFileNameFromUrl(String fileUrl) {
        return URLDecoder.decode(fileUrl.substring(fileUrl.lastIndexOf("/") + 1), StandardCharsets.UTF_8);
    }

    private String decodeUrl(String encodedUrl) {
        return URLDecoder.decode(encodedUrl, StandardCharsets.UTF_8);
    }

    private UserInfoResponse getUserInfoWithFallback(String userId) {
        try {
            UserInfoResponse userInfo = identityServiceClient.getUserInfo(userId);
            if (userInfo == null || userInfo.getUsername() == null) {
                log.warn("User info is null or incomplete for userId: {}", userId);
                return new UserInfoResponse("Unknown", "https://your-default-image.com/default-avatar.png");
            }
            log.info("Fetched user info: {} - {}", userInfo.getUsername(), userInfo.getImageUrl());
            return userInfo;
        } catch (Exception e) {
            log.error("Failed to fetch user info for userId {}: ", userId, e);
            return new UserInfoResponse("Unknown", "https://your-default-image.com/default-avatar.png");
        }
    }
}