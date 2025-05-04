package com.LinkVerse.post.service;

import com.LinkVerse.identity.dto.response.UserInfoResponse;
import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.PageResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostVisibility;
import com.LinkVerse.post.repository.PostRepository;
import com.LinkVerse.post.repository.client.IdentityServiceClient;
import com.LinkVerse.post.repository.client.ProfileServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostsBySentiment {
    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final ProfileServiceClient profileServiceClient;
    private final IdentityServiceClient identityServiceClient;

    public ApiResponse<PageResponse<PostResponse>> getPostsBySentiment(int page, int size, String sentiment) {
        if (page < 1 || size < 1) {
            return ApiResponse.<PageResponse<PostResponse>>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Page và size phải lớn hơn 0")
                    .build();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : null;

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdDate")));
        var pageData = postRepository.findAllByPrimarySentiment(sentiment, pageable);

        List<Post> posts = pageData.getContent().stream()
                .filter(post -> !post.isDeleted())
                .filter(post -> post.getVisibility() != PostVisibility.PRIVATE ||
                        (post.getUserId().equals(currentUserId)))
                .filter(post -> currentUserId == null ||
                        (!profileServiceClient.isBlocked(currentUserId, post.getUserId()) &&
                                !profileServiceClient.isBlocked(post.getUserId(), currentUserId)))
                .collect(Collectors.toList());

        Set<String> userIds = posts.stream()
                .map(Post::getUserId)
                .collect(Collectors.toSet());
        Map<String, UserInfoResponse> userInfoMap = batchFetchUserInfo(userIds);

        List<PostResponse> postResponses = posts.stream()
                .map(post -> {
                    PostResponse postResponse = postMapper.toPostResponse(post);
                    UserInfoResponse userInfo = userInfoMap.getOrDefault(post.getUserId(),
                            new UserInfoResponse("Unknown", "https://res.cloudinary.com/duktr2ml5/image/upload/v1745753671/blankavatar_fupmly.jpg"));
                    postResponse.setUsername(userInfo.getUsername());
                    postResponse.setImageUrl(userInfo.getImageUrl());
                    return postResponse;
                })
                .collect(Collectors.toList());

        return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Posts retrieved successfully")
                .result(PageResponse.<PostResponse>builder()
                        .currentPage(page)
                        .pageSize(pageData.getSize())
                        .totalPage(pageData.getTotalPages())
                        .totalElement(pageData.getTotalElements())
                        .data(postResponses)
                        .build())
                .build();
    }

    private Map<String, UserInfoResponse> batchFetchUserInfo(Set<String> userIds) {
        Map<String, UserInfoResponse> userInfoMap = new HashMap<>();
        for (String userId : userIds) {
            userInfoMap.put(userId, getUserInfoWithFallback(userId));
        }
        return userInfoMap;
    }

    private UserInfoResponse getUserInfoWithFallback(String userId) {
        try {
            UserInfoResponse userInfo = identityServiceClient.getUserInfo(userId);
            if (userInfo == null || userInfo.getUsername() == null) {
                log.warn("User info is null or incomplete for userId: {}", userId);
                return new UserInfoResponse("Unknown", "https://res.cloudinary.com/duktr2ml5/image/upload/v1745753671/blankavatar_fupmly.jpg");
            }
            log.info("Fetched user info: {} - {}", userInfo.getUsername(), userInfo.getImageUrl());
            return userInfo;
        } catch (Exception e) {
            log.error("Failed to fetch user info for userId {}: ", userId, e);
            return new UserInfoResponse("Unknown", "https://res.cloudinary.com/duktr2ml5/image/upload/v1745753671/blankavatar_fupmly.jpg");
        }
    }
}