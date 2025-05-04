package com.LinkVerse.post.service;

import com.LinkVerse.event.dto.NotificationEvent;
import com.LinkVerse.post.Mapper.CommentMapper;
import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.response.CommentResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.Comment;
import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostVisibility;
import com.LinkVerse.post.exception.CommentNotFoundException;
import com.LinkVerse.post.repository.CommentRespository;
import com.LinkVerse.post.repository.PostRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LikeService {
    PostRepository postRepository;
    PostMapper postMapper;
    CommentMapper commentMapper;
    CommentRespository commentRespository;
    KafkaTemplate<String, Object> kafkaTemplate;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName(); // Assuming the user ID is stored in the name field
    }

    //    // Like a post
//    public ApiResponse<PostResponse> likePost(String postId, String emojiSymbol) {
//        String userId = getCurrentUserId();
//        Post post = postRepository.findById(postId)
//                .orElseThrow(() -> new RuntimeException("Post not found"));
//
//        // Check if the post is private and the user is not the owner
//        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
//            return ApiResponse.<PostResponse>builder()
//                    .code(HttpStatus.FORBIDDEN.value())
//                    .message("You are not authorized to like this post")
//                    .build();
//        }
//
//        // Check if the user has already liked the post
//        if (post.getLikedUserIds() != null && post.getLikedUserIds().contains(userId)) {
//            return ApiResponse.<PostResponse>builder()
//                    .code(HttpStatus.BAD_REQUEST.value())
//                    .message("User has already liked this post")
//                    .build();
//        }
//
//        // Update the like count
//        post.setLike(post.getLike() + 1);
//
//        // Add emoji to the list
//        if (post.getLikedEmojis() == null) {
//            post.setLikedEmojis(new ArrayList<>());
//        }
//        post.getLikedEmojis().add(emojiSymbol);
//
//        // Add user ID to the list of users who liked the post
//        if (post.getLikedUserIds() == null) {
//            post.setLikedUserIds(new ArrayList<>());
//        }
//        post.getLikedUserIds().add(userId);
//
//        // Save the updated post
//        post = postRepository.save(post);
//        NotificationEvent notificationEvent = NotificationEvent.builder()
//                .channel("POST_LIKE")
//                .recipient(post.getUserId())
//                .templateCode("POST_LIKE_TEMPLATE")
//                .param(Map.of("userId", userId, "postId", postId))
//                .subject("Your post was liked")
//                .body("Your post was liked by " + userId)
//                .build();
//        kafkaTemplate.send("post-like-event", notificationEvent);
//
//        return ApiResponse.<PostResponse>builder()
//                .code(HttpStatus.OK.value())
//                .message("Post liked successfully")
//                .result(postMapper.toPostResponse(post))
//                .build();
//    }
//
//    // Unlike a post
//    public ApiResponse<PostResponse> unlikePost(String postId) {
//        String userId = getCurrentUserId();
//        Post post = postRepository.findById(postId)
//                .orElseThrow(() -> new RuntimeException("Post not found"));
//
//        // Check if the post is private and the user is not the owner
//        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
//            return ApiResponse.<PostResponse>builder()
//                    .code(HttpStatus.FORBIDDEN.value())
//                    .message("You are not authorized to unlike this post")
//                    .build();
//        }
//
//        // Check if the user has liked the post
//        if (post.getLikedUserIds() == null || !post.getLikedUserIds().contains(userId)) {
//            return ApiResponse.<PostResponse>builder()
//                    .code(HttpStatus.BAD_REQUEST.value())
//                    .message("User has not liked this post")
//                    .build();
//        }
//
//        // Update the like and unlike counts
//        post.setLike(post.getLike() - 1);
//        post.setUnlike(post.getUnlike() + 1);
//
//        // Remove user ID from the list of users who liked the post
//        post.getLikedUserIds().remove(userId);
//
//        // Save the updated post
//        post = postRepository.save(post);
//        NotificationEvent notificationEvent = NotificationEvent.builder()
//                .channel("POST_UNLIKE")
//                .recipient(post.getUserId())
//                .templateCode("POST_UNLIKE_TEMPLATE")
//                .param(Map.of("userId", userId, "postId", postId))
//                .subject("Your post was unliked")
//                .body("Your post was unliked by " + userId)
//                .build();
//        kafkaTemplate.send("post-unlike-event", notificationEvent);
//
//        return ApiResponse.<PostResponse>builder()
//                .code(HttpStatus.OK.value())
//                .message("Post unliked successfully")
//                .result(postMapper.toPostResponse(post)
//                .build();
//    }

    public ApiResponse<PostResponse> toggleLike(String postId, String emojiSymbol) {
    String userId = getCurrentUserId();
    log.info("User {} attempting to toggle like on post {}", userId, postId);

    Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

    if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
        log.warn("User {} unauthorized to like private post {}", userId, postId);
        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.FORBIDDEN.value())
                .message("You are not allowed to like/cancel this article")
                .build();
    }

    if (post.getLikedUserIds() == null) post.setLikedUserIds(new ArrayList<>());
    if (post.getLikedEmojis() == null) post.setLikedEmojis(new ArrayList<>());

    boolean isCurrentlyLiked = post.getLikedUserIds().contains(userId);
    if (isCurrentlyLiked) {
        // Unlike logic
        log.info("User {} unliking post {}", userId, postId);
        post.setLike(post.getLike() - 1);
        post.setUnlike(post.getUnlike() + 1);
        post.getLikedUserIds().remove(userId);
        if (emojiSymbol != null) post.getLikedEmojis().remove(emojiSymbol);

        post = postRepository.save(post);
        log.info("Post {} updated after unlike: likes={}, unlikes={}", postId, post.getLike(), post.getUnlike());

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("POST_UNLIKE")
                .recipient(post.getUserId())
                .templateCode("POST_UNLIKE_TEMPLATE")
                .param(Map.of("userId", userId, "postId", postId))
                .subject("Your article has been canceled\n")
                .body("Your article has been canceled by users\n " + userId)
                .build();
        log.info("Sending unlike notification event for post {} to user {}", postId, post.getUserId());
        kafkaTemplate.send("post-unlike-event", notificationEvent);

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Hủy thích bài viết thành công")
                .result(postMapper.toPostResponse(post))
                .build();
    } else {
        // Like logic
        log.info("User {} liking post {}", userId, postId);
        post.setLike(post.getLike() + 1);
        if (post.getUnlike() > 0) {
            post.setUnlike(post.getUnlike() - 1);
        }
        post.getLikedUserIds().add(userId);
        if (emojiSymbol != null) post.getLikedEmojis().add(emojiSymbol);

        post = postRepository.save(post);
        log.info("Post {} updated after like: likes={}, unlikes={}", postId, post.getLike(), post.getUnlike());

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("POST_LIKE")
                .recipient(post.getUserId())
                .templateCode("POST_LIKE_TEMPLATE")
                .param(Map.of("userId", userId, "postId", postId))
                .subject("Your article has been liked")
                .body("Your article has been liked by users\n " + userId)
                .build();
        log.info("Sending like notification event for post {} to user {}", postId, post.getUserId());
        kafkaTemplate.send("post-like-event", notificationEvent);

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Like the article successfully\n")
                .result(postMapper.toPostResponse(post))
                .build();
    }
}

    // Toggle like/unlike a comment
    public ApiResponse<CommentResponse> LikeComment(String postId, String commentId, String emojiSymbol) {
        String userId = getCurrentUserId();

        // Kiểm tra bài viết
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
            return ApiResponse.<CommentResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to like/unlike this comment")
                    .build();
        }

        // Kiểm tra bình luận
        Comment comment = commentRespository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        // Khởi tạo danh sách nếu null
        if (comment.getLikedUserIds() == null) {
            comment.setLikedUserIds(new ArrayList<>());
        }
        if (comment.getLikedEmojis() == null) {
            comment.setLikedEmojis(new ArrayList<>());
        }

        // Kiểm tra trạng thái hiện tại: đã thích hay chưa
        boolean isCurrentlyLiked = comment.getLikedUserIds().contains(userId);
        if (isCurrentlyLiked) {
            // Unlike logic: Người dùng đã thích, giờ hủy thích
            comment.setLike(comment.getLike() - 1);
            comment.getLikedUserIds().remove(userId);
            if (emojiSymbol != null) {
                comment.getLikedEmojis().remove(emojiSymbol);
            }

            // Lưu bình luận
            comment = commentRespository.save(comment);

            // Gửi thông báo Kafka (nếu cần)
            NotificationEvent notificationEvent = NotificationEvent.builder()
                    .channel("COMMENT_UNLIKE")
                    .recipient(post.getUserId())
                    .templateCode("COMMENT_UNLIKE_TEMPLATE")
                    .param(Map.of("userId", userId, "commentId", commentId))
                    .subject("Your comment was unliked")
                    .body("Your comment was unliked by " + userId)
                    .build();
            kafkaTemplate.send("comment-unlike-event", notificationEvent);

            return ApiResponse.<CommentResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Comment unliked successfully")
                    .result(commentMapper.toCommentResponse(comment))
                    .build();
        } else {
            // Like logic: Người dùng chưa thích, giờ thích
            comment.setLike(comment.getLike() + 1);
            comment.getLikedUserIds().add(userId);
            if (emojiSymbol != null) {
                comment.getLikedEmojis().add(emojiSymbol);
            }

            // Lưu bình luận
            comment = commentRespository.save(comment);

            // Gửi thông báo Kafka (nếu cần)
            NotificationEvent notificationEvent = NotificationEvent.builder()
                    .channel("COMMENT_LIKE")
                    .recipient(post.getUserId())
                    .templateCode("COMMENT_LIKE_TEMPLATE")
                    .param(Map.of("userId", userId, "commentId", commentId))
                    .subject("Your comment was liked")
                    .body("Your comment was liked by " + userId)
                    .build();
            kafkaTemplate.send("comment-like-event", notificationEvent);

            return ApiResponse.<CommentResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Comment liked successfully")
                    .result(commentMapper.toCommentResponse(comment))
                    .build();
        }
    }

//    // Like a comment
//    public ApiResponse<CommentResponse> likeComment(String postId, String commentId, String emojiSymbol) {
//        String userId = getCurrentUserId();
//        Post post = postRepository.findById(postId)
//                .orElseThrow(() -> new RuntimeException("Post not found"));
//
//        // Check if the post is private and the user is not the owner
//        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
//            return ApiResponse.<CommentResponse>builder()
//                    .code(HttpStatus.FORBIDDEN.value())
//                    .message("You are not authorized to like this comment")
//                    .build();
//        }
//
//        Comment comment = commentRespository.findById(commentId)
//                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));
//
//        // Check if the user has already liked the comment
//        if (comment.getLikedUserIds() != null && comment.getLikedUserIds().contains(userId)) {
//            return ApiResponse.<CommentResponse>builder()
//                    .code(HttpStatus.BAD_REQUEST.value())
//                    .message("User has already liked this comment")
//                    .build();
//        }
//
//        // Update the like count
//        comment.setLike(comment.getLike() + 1);
//
//        // Add emoji to the list
//        if (comment.getLikedEmojis() == null) {
//            comment.setLikedEmojis(new ArrayList<>());
//        }
//        comment.getLikedEmojis().add(emojiSymbol);
//
//        // Add user ID to the list of users who liked the comment
//        if (comment.getLikedUserIds() == null) {
//            comment.setLikedUserIds(new ArrayList<>());
//        }
//        comment.getLikedUserIds().add(userId);
//
//        // Save the updated comment
//        comment = commentRespository.save(comment);
//
//        return ApiResponse.<CommentResponse>builder()
//                .code(HttpStatus.OK.value())
//                .message("Comment liked successfully")
//                .result(commentMapper.toCommentResponse(comment))
//                .build();
//    }
//
//    // Unlike a comment
//    public ApiResponse<CommentResponse> unlikeComment(String postId, String commentId) {
//        String userId = getCurrentUserId();
//        Comment comment = commentRespository.findById(commentId)
//                .orElseThrow(() -> new RuntimeException("Comment not found"));
//
//        // Check if the post is private and the user is not the owner
//        Post post = postRepository.findById(postId)
//                .orElseThrow(() -> new RuntimeException("Post not found"));
//        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
//            return ApiResponse.<CommentResponse>builder()
//                    .code(HttpStatus.FORBIDDEN.value())
//                    .message("You are not authorized to unlike this comment")
//                    .build();
//        }
//
//        // Check if the user has liked the comment
//        if (comment.getLikedUserIds() == null || !comment.getLikedUserIds().contains(userId)) {
//            return ApiResponse.<CommentResponse>builder()
//                    .code(HttpStatus.BAD_REQUEST.value())
//                    .message("User has not liked this comment")
//                    .build();
//        }
//
//        // Update the like count
//        comment.setLike(comment.getLike() - 1);
//
//        // Remove user ID from the list of users who liked the comment
//        comment.getLikedUserIds().remove(userId);
//
//        // Save the updated comment
//        comment = commentRespository.save(comment);
//
//        return ApiResponse.<CommentResponse>builder()
//                .code(HttpStatus.OK.value())
//                .message("Comment unliked successfully")
//                .result(commentMapper.toCommentResponse(comment))
//                .build();
//    }
}