package com.LinkVerse.post.service;

import com.LinkVerse.identity.dto.response.UserInfoResponse;
import com.LinkVerse.post.FileUtil;
import com.LinkVerse.post.Mapper.PostHistoryMapper;
import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.Mapper.ShareMapper;
import com.LinkVerse.post.configuration.TagProcessor;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.PageResponse;
import com.LinkVerse.post.dto.request.AiSuggestionRequest;
import com.LinkVerse.post.dto.request.PostRequest;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.*;
import com.LinkVerse.post.exception.AppException;
import com.LinkVerse.post.exception.ErrorCode;
import com.LinkVerse.post.repository.HashtagRepository;
import com.LinkVerse.post.repository.PostHistoryRepository;
import com.LinkVerse.post.repository.PostRepository;
import com.LinkVerse.post.repository.SharedPostRepository;
import com.LinkVerse.post.repository.client.AISupportClient;
import com.LinkVerse.post.repository.client.IdentityServiceClient;
import com.LinkVerse.post.repository.client.ProfileServiceClient;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.model.S3Object;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {
    PostRepository postRepository;
    PostMapper postMapper;
    SharedPostRepository sharedPostRepository;
    ShareMapper shareMapper;
    PostHistoryRepository postHistoryRepository;
    PostHistoryMapper postHistoryMapper;
    KeywordService keywordService;
    KafkaTemplate<String, Object> kafkaTemplate;
    S3Service s3Service;
    ContentModerationService contentModerationService;
    TranslationService translationService;
    RekognitionService rekognitionService;
    SentimentAnalysisService sentimentAnalysisService;
    IdentityServiceClient identityServiceClient;
    TagProcessor tagProcessor;
    HashtagRepository hashtagRepository;
    ProfileServiceClient profileServiceClient;
    AISupportClient aiSupportClient;
    @Autowired
    ObjectMapper objectMapper;

    public ApiResponse<List<String>> getPostSuggestions(String content) {
        try {
            List<String> aiSuggestions = aiSupportClient.getSuggestions(new AiSuggestionRequest(content));

            return ApiResponse.<List<String>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Gợi ý nội dung thành công")
                    .result(aiSuggestions)
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi lấy gợi ý nội dung từ AI", e);
            return ApiResponse.<List<String>>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Không thể lấy gợi ý từ AI")
                    .build();
        }
    }

    public ApiResponse<PostResponse> createPostWithAiSuggestion(PostRequest request, List<MultipartFile> files, boolean useAiSuggestion) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (useAiSuggestion) {
            try {
                String aiSuggestedContent = aiSupportClient.generateContent(new AiSuggestionRequest(request.getContent()));
                request.setContent(aiSuggestedContent);
            } catch (Exception e) {
                log.error("Failed to get AI suggestion", e);
                return ApiResponse.<PostResponse>builder()
                        .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message("Lỗi khi lấy gợi ý nội dung từ AI")
                        .build();
            }
        }

        if (!contentModerationService.isContentAppropriate(request.getContent())) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Post content is inappropriate and violates our content policy.")
                    .build();
        }

        try {
            List<String> fileUrls = (files != null && files.stream().anyMatch(file -> !file.isEmpty()))
                    ? s3Service.uploadFiles(files.stream().filter(file -> !file.isEmpty()).collect(Collectors.toList()))
                    : List.of();

            List<String> safeFileUrls = new ArrayList<>();
            for (String fileUrl : fileUrls) {
                String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
                S3Object s3Object = s3Service.getObject(fileName);
                if (rekognitionService.isImageSafe(s3Object)) {
                    safeFileUrls.add(fileUrl);
                } else {
                    s3Service.deleteFile(fileName);
                }
            }

            Post post = Post.builder()
                    .content(request.getContent())
                    .userId(authentication.getName())
                    .imageUrls(safeFileUrls)
                    .visibility(request.getVisibility() != null ? request.getVisibility() : PostVisibility.PUBLIC)
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .like(0)
                    .unlike(0)
                    .comments(List.of())
                    .share(0)
                    .build();

            post.setLanguage(keywordService.detectDominantLanguage(request.getContent()));
            post.setKeywords(keywordService.extractAndSaveKeyPhrases(request.getContent(), post.getId()).stream()
                    .map(Keyword::getId).collect(Collectors.toList()));
            post = postRepository.save(post);

            final Post finalPost = post;

            Set<String> hashtags = tagProcessor.extractHashtags(request.getContent());
            List<Hashtag> hashtagEntities = hashtags.stream()
                    .map(tag -> {
                        Hashtag existingHashtag = hashtagRepository.findByName(tag);
                        Hashtag hashtagEntity = existingHashtag != null ? existingHashtag : new Hashtag();
                        hashtagEntity.setName(tag);
                        hashtagEntity.addPost(finalPost);
                        return hashtagRepository.save(hashtagEntity);
                    })
                    .collect(Collectors.toList());

            post.setHashtags(hashtagEntities);
            sentimentAnalysisService.analyzeAndSaveSentiment(post);
            post = postRepository.save(post);

            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Post created successfully")
                    .result(postMapper.toPostResponse(post))
                    .build();
        } catch (SdkClientException e) {
            log.error("AWS S3 Exception: ", e);
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Failed to upload files due to AWS configuration issues.")
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error creating post: ", e);
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Unexpected error occurred.")
                    .build();
        }
    }

    public Page<Post> getPostsByHashtag(String hashtagName, Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : null;

        Hashtag hashtag = hashtagRepository.findByName(hashtagName);
        if (hashtag == null) {
            throw new AppException(ErrorCode.HASTAG_NOTFOUND);
        }

        List<Post> allPosts = hashtag.getPosts();
        List<Post> filteredPosts = allPosts.stream()
                .filter(post -> post.getVisibility() != PostVisibility.PRIVATE ||
                        (post.getUserId().equals(currentUserId)))
                .filter(post -> currentUserId == null ||
                        (!profileServiceClient.isBlocked(currentUserId, post.getUserId()) &&
                                !profileServiceClient.isBlocked(post.getUserId(), currentUserId)))
                .collect(Collectors.toList());

        int start = Math.min((int) pageable.getOffset(), filteredPosts.size());
        int end = Math.min(start + pageable.getPageSize(), filteredPosts.size());

        List<Post> paginatedPosts = filteredPosts.subList(start, end);
        return new PageImpl<>(paginatedPosts, pageable, filteredPosts.size());
    }

    public ApiResponse<PostResponse> postImageAvatar(PostRequest request, MultipartFile avatarFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        if (!contentModerationService.isContentAppropriate(request.getContent())) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Post content is inappropriate and violates our content policy.")
                    .build();
        }

        try {
            if (avatarFile == null || avatarFile.isEmpty() || !FileUtil.isImageFile(avatarFile)) {
                return ApiResponse.<PostResponse>builder()
                        .code(HttpStatus.BAD_REQUEST.value())
                        .message("Only non-empty image files are allowed.")
                        .build();
            }

            String avatarUrl = s3Service.uploadFile(avatarFile);

            PostVisibility visibility = request.getVisibility();
            if (visibility == null) {
                visibility = PostVisibility.PUBLIC;
            } else if (!EnumUtils.isValidEnum(PostVisibility.class, visibility.name())) {
                return ApiResponse.<PostResponse>builder()
                        .code(HttpStatus.BAD_REQUEST.value())
                        .message("Invalid visibility value.")
                        .build();
            }

            Post post = Post.builder()
                    .content(request.getContent())
                    .userId(currentUserId)
                    .imgAvatarUrl(avatarUrl)
                    .visibility(visibility)
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .like(0)
                    .unlike(0)
                    .comments(new ArrayList<>())
                    .build();

            String languageCode = keywordService.detectDominantLanguage(request.getContent());
            post.setLanguage(languageCode);

            List<Keyword> extractedKeywords = keywordService.extractAndSaveKeyPhrases(request.getContent(), post.getId());
            List<String> keywordIds = extractedKeywords.stream().map(Keyword::getId).collect(Collectors.toList());
            post.setKeywords(keywordIds);

            post = postRepository.save(post);

            Set<String> hashtags = tagProcessor.extractHashtags(request.getContent());
            List<Hashtag> hashtagEntities = new ArrayList<>();
            for (String hashtag : hashtags) {
                Hashtag existingHashtag = hashtagRepository.findByName(hashtag);
                if (existingHashtag == null) {
                    Hashtag newHashtag = new Hashtag();
                    newHashtag.setName(hashtag);
                    newHashtag.addPost(post);
                    hashtagEntities.add(hashtagRepository.save(newHashtag));
                } else {
                    existingHashtag.addPost(post);
                    hashtagEntities.add(hashtagRepository.save(existingHashtag));
                }
            }
            post.setHashtags(hashtagEntities);

            sentimentAnalysisService.analyzeAndSaveSentiment(post);

            post = postRepository.save(post);

            PostResponse postResponse = postMapper.toPostResponse(post);

            try {
                identityServiceClient.updateImage(currentUserId, post.getImgAvatarUrl());
                profileServiceClient.updateImage(currentUserId, post.getImgAvatarUrl());
            } catch (FeignException e) {
                log.error("Error updating avatar in profile-service: {}", e.getMessage(), e);
                return ApiResponse.<PostResponse>builder()
                        .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message("Failed to update avatar in profile-service.")
                        .build();
            }

            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Avatar post created successfully and profile updated.")
                    .result(postResponse)
                    .build();
        } catch (SdkClientException e) {
            log.error("AWS S3 Exception while uploading file: ", e);
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Failed to upload file due to AWS S3 issues.")
                    .build();
        } catch (Exception e) {
            log.error("Unexpected exception: ", e);
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("An unexpected error occurred.")
                    .build();
        }
    }

    public ApiResponse<PostResponse> createPostWithFiles(PostRequest request, List<MultipartFile> files) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        if (!contentModerationService.isContentAppropriate(request.getContent())) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Post content is inappropriate and violates our content policy.")
                    .build();
        }

        try {
            UserInfoResponse userInfo = getUserInfoWithFallback(userId);
            if (userInfo.getUsername() == null || userInfo.getUsername().equals("Unknown")) {
                log.warn("User info incomplete for userId: {}. Proceeding with default values.", userId);
            }
            List<String> fileUrls = (files != null && files.stream().anyMatch(file -> !file.isEmpty()))
                    ? s3Service.uploadFiles(files.stream().filter(file -> !file.isEmpty()).collect(Collectors.toList()))
                    : List.of();

            List<String> safeFileUrls = new ArrayList<>();
            for (String fileUrl : fileUrls) {
                String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
                S3Object s3Object = s3Service.getObject(fileName);
                log.info("Checking image safety for file: {}", fileName);
                if (rekognitionService.isImageSafe(s3Object)) {
                    safeFileUrls.add(fileUrl);
                } else {
                    log.warn("Unsafe content detected in file: {}", fileName);
                    s3Service.deleteFile(fileName);
                }
            }

            Post post = Post.builder()
                    .content(request.getContent())
                    .userId(userId)
                    .username(userInfo.getUsername())
                    .imageUrl(userInfo.getImageUrl())
                    .imageUrls(safeFileUrls)
                    .visibility(request.getVisibility())
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .like(0)
                    .unlike(0)
                    .comments(List.of())
                    .share(0)
                    .build();

            String languageCode = keywordService.detectDominantLanguage(request.getContent());
            post.setLanguage(languageCode);

            List<Keyword> extractedKeywords = keywordService.extractAndSaveKeyPhrases(request.getContent(), post.getId());
            List<String> keywordIds = extractedKeywords.stream().map(Keyword::getId).collect(Collectors.toList());
            post.setKeywords(keywordIds);

            post = postRepository.save(post);

            Set<String> hashtags = tagProcessor.extractHashtags(request.getContent());
            List<Hashtag> hashtagEntities = new ArrayList<>();
            for (String hashtag : hashtags) {
                Hashtag existingHashtag = hashtagRepository.findByName(hashtag);
                if (existingHashtag == null) {
                    Hashtag newHashtag = new Hashtag();
                    newHashtag.setName(hashtag);
                    newHashtag.addPost(post);
                    hashtagEntities.add(hashtagRepository.save(newHashtag));
                } else {
                    existingHashtag.addPost(post);
                    hashtagEntities.add(hashtagRepository.save(existingHashtag));
                }
            }
            post.setHashtags(hashtagEntities);

            sentimentAnalysisService.analyzeAndSaveSentiment(post);

            post = postRepository.save(post);

            PostResponse postResponse = postMapper.toPostResponse(post);
            postResponse.setUsername(userInfo.getUsername());
            postResponse.setImageUrl(userInfo.getImageUrl());

            return ApiResponse.<PostResponse>builder()
                    .code(200)
                    .message("Post created successfully")
                    .result(postResponse)
                    .build();
        } catch (SdkClientException e) {
            log.error("AWS S3 Exception: ", e);
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Failed to upload files due to AWS configuration issues.")
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error creating post: ", e);
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Unexpected error occurred.")
                    .build();
        }
    }

    public ApiResponse<Void> deletePost(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        if (!post.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        List<String> fileUrls = post.getImageUrls();
        if (fileUrls != null && !fileUrls.isEmpty()) {
            for (String fileUrl : fileUrls) {
                String decodedUrl = decodeUrl(fileUrl);
                String fileName = extractFileNameFromUrl(decodedUrl);
                if (fileName != null) {
                    String result = s3Service.deleteFile(fileName);
                    log.info(result);
                }
            }
        }

        List<PostResponse> sharedPostResponses = post.getSharedPosts() != null
                ? shareMapper.toPostResponseList(post.getSharedPosts())
                : null;

        PostHistory postHistory = PostHistory.builder()
                .id(post.getId())
                .content(post.getContent())
                .fileUrls(post.getImageUrls())
                .visibility(post.getVisibility())
                .userId(post.getUserId())
                .createdDate(post.getCreatedDate())
                .modifiedDate(post.getModifiedDate())
                .like(post.getLike())
                .unlike(post.getUnlike())
                .commentCount(post.getCommentCount())
                .comments(post.getComments())
                .sharedPost(sharedPostResponses)
                .build();

        postHistoryRepository.save(postHistory);
        postRepository.delete(post);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Post deleted and moved to history successfully")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<PostResponse>> getHistoryPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdDate")));
        var pageData = postHistoryRepository.findAll(pageable);
        List<PostHistory> posts = pageData.getContent();

        return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Deleted posts retrieved successfully")
                .result(PageResponse.<PostResponse>builder()
                        .currentPage(page)
                        .pageSize(pageData.getSize())
                        .totalPage(pageData.getTotalPages())
                        .totalElement(pageData.getTotalElements())
                        .data(posts.stream()
                                .map(postHistoryMapper::toPostResponse)
                                .collect(Collectors.toList()))
                        .build())
                .build();
    }

    public ApiResponse<PageResponse<PostResponse>> getPostsByLanguage(int page, int size, String language) {
        Sort sort = Sort.by(Sort.Order.desc("createdDate"));
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByLanguage(language, pageable);

        List<Post> posts = pageData.getContent().stream()
                .filter(post -> post.getVisibility() == PostVisibility.PUBLIC ||
                        (post.getVisibility() == PostVisibility.PRIVATE && post.getUserId().equals(SecurityContextHolder.getContext().getAuthentication().getName())))
                .collect(Collectors.toList());

        return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Posts retrieved successfully")
                .result(PageResponse.<PostResponse>builder()
                        .currentPage(page)
                        .pageSize(pageData.getSize())
                        .totalPage(pageData.getTotalPages())
                        .totalElement(pageData.getTotalElements())
                        .data(posts.stream().map(postMapper::toPostResponse).collect(Collectors.toList()))
                        .build())
                .build();
    }

    public ApiResponse<PostResponse> changePostVisibility(String postId, PostVisibility newVisibility) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to change the visibility of this post");
        }

        post.setVisibility(newVisibility);
        post.setModifiedDate(Instant.now());
        post = postRepository.save(post);

        PostResponse postResponse = postMapper.toPostResponse(post);

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Post visibility updated successfully")
                .result(postResponse)
                .build();
    }

    public ApiResponse<PageResponse<PostResponse>> getMyPosts(int page, int size, boolean includeDeleted) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = authentication.getName();

        Sort sort = Sort.by(Sort.Order.desc("createdDate"));
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserId(userID, pageable);

        List<Post> filteredPosts = pageData.getContent().stream()
                .filter(post -> post.getVisibility() == PostVisibility.PUBLIC ||
                        (post.getVisibility() == PostVisibility.FRIENDS && isFriend(userID, post.getUserId())) ||
                        post.getVisibility() == PostVisibility.PRIVATE)
                .filter(post -> includeDeleted || !post.isDeleted())
                .filter(post -> post.getGroupId() == null)
                .toList();

        return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(200)
                .message("My posts retrieved successfully")
                .result(PageResponse.<PostResponse>builder()
                        .currentPage(page)
                        .pageSize(pageData.getSize())
                        .totalPage(pageData.getTotalPages())
                        .totalElement(pageData.getTotalElements())
                        .data(filteredPosts.stream().map(postMapper::toPostResponse).collect(Collectors.toList()))
                        .build())
                .build();
    }

    public ApiResponse<PostResponse> sharePost(String postId, String content, PostVisibility visibility) {
        Post originalPost = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (originalPost.isDeleted()) {
            throw new RuntimeException("Cannot share a deleted post.");
        }

        if (visibility != PostVisibility.PUBLIC && visibility != PostVisibility.PRIVATE) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Visibility must be PUBLIC or PRIVATE")
                    .build();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        UserInfoResponse currentUserInfo = getUserInfoWithFallback(currentUserId);

        if (originalPost.getVisibility() == PostVisibility.PRIVATE && !originalPost.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to share this private post.");
        }

        UserInfoResponse originalPostUserInfo = originalPost.getUsername() != null && originalPost.getImageUrl() != null
                ? new UserInfoResponse(originalPost.getUsername(), originalPost.getImageUrl())
                : getUserInfoWithFallback(originalPost.getUserId());

        if (originalPost.getUsername() == null || originalPost.getImageUrl() == null) {
            originalPost.setUsername(originalPostUserInfo.getUsername());
            originalPost.setImageUrl(originalPostUserInfo.getImageUrl());
            postRepository.save(originalPost);
        }

        SharedPost sharedPost = SharedPost.builder()
                .content(content)
                .username(currentUserInfo.getUsername())
                .imageUrl(currentUserInfo.getImageUrl())
                .userId(currentUserId)
                .imageUrls(originalPost.getImageUrls())
                .visibility(visibility)
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .originalPost(originalPost)
                .build();

        sharedPostRepository.save(sharedPost);

        originalPost.setShare(originalPost.getShare() + 1);
        originalPost.getSharedPosts().add(sharedPost);
        postRepository.save(originalPost);

        PostResponse postResponse = shareMapper.toPostResponse(sharedPost);
        postResponse.setUsername(currentUserInfo.getUsername());
        postResponse.setImageUrl(currentUserInfo.getImageUrl());

        List<PostResponse> sharedPostResponses = postResponse.getSharedPost();
        if (sharedPostResponses != null && !sharedPostResponses.isEmpty()) {
            for (PostResponse nestedPost : sharedPostResponses) {
                if (nestedPost.getUsername() == null || nestedPost.getImageUrl() == null) {
                    nestedPost.setUsername(originalPostUserInfo.getUsername());
                    nestedPost.setImageUrl(originalPostUserInfo.getImageUrl());
                }
            }
        }

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Post shared successfully")
                .result(postResponse)
                .build();
    }

    public void deleteSharedPost(String sharedPostId) {
        SharedPost sharedPost = sharedPostRepository.findById(sharedPostId)
                .orElseThrow(() -> new RuntimeException("SharedPost not found"));

        Post originalPost = sharedPost.getOriginalPost();
        if (originalPost != null && originalPost.getShare() > 0) {
            originalPost.setShare(originalPost.getShare() - 1);
            originalPost.getSharedPosts().remove(sharedPost);
            postRepository.save(originalPost);
        }

        sharedPostRepository.delete(sharedPost);
    }

    public ApiResponse<PageResponse<PostResponse>> getAllPost(int page, int size) {
        if (page < 1 || size < 1) {
            return ApiResponse.<PageResponse<PostResponse>>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Page and size must be greater than 0")
                    .build();
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdDate")));
        Page<Post> pageData = postRepository.findByVisibilityNot(PostVisibility.PRIVATE, pageable);

        List<Post> posts = pageData.getContent().stream()
                .filter(post -> post.getGroupId() == null)
                .collect(Collectors.toList());

        Set<String> userIdsToFetch = posts.stream()
                .filter(post -> post.getUsername() == null || post.getImageUrl() == null)
                .map(Post::getUserId)
                .collect(Collectors.toSet());

        Map<String, UserInfoResponse> userInfoMap = userIdsToFetch.isEmpty() ? new HashMap<>() : batchFetchUserInfo(userIdsToFetch);

        List<PostResponse> postResponses = posts.stream()
                .map(post -> {
                    PostResponse postResponse = postMapper.toPostResponse(post);
                    String username = post.getUsername() != null ? post.getUsername() :
                            userInfoMap.getOrDefault(post.getUserId(),
                                    new UserInfoResponse("Unknown", null)).getUsername();
                    String imageUrl = post.getImageUrl() != null ? post.getImageUrl() :
                            userInfoMap.getOrDefault(post.getUserId(),
                                    new UserInfoResponse(null, "https://your-default-image.com/default-avatar.png")).getImageUrl();
                    postResponse.setUsername(username);
                    postResponse.setImageUrl(imageUrl);
                    return postResponse;
                })
                .collect(Collectors.toList());

        // Shuffle posts to randomize display order
        Collections.shuffle(postResponses);

        return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Posts retrieved successfully")
                .result(PageResponse.<PostResponse>builder()
                        .currentPage(page)
                        .pageSize(size)
                        .totalPage(pageData.getTotalPages())
                        .totalElement(pageData.getTotalElements())
                        .data(postResponses)
                        .build())
                .build();
    }

    public ApiResponse<PageResponse<PostResponse>> getUserPost(int page, int size, String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        Pageable pageable = PageRequest.of(page - 1, size);

        boolean isBlocked = profileServiceClient.isBlocked(currentUserId, userId) || profileServiceClient.isBlocked(userId, currentUserId);
        if (isBlocked) {
            return ApiResponse.<PageResponse<PostResponse>>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to view this user's posts.")
                    .build();
        }

        Page<Post> originalPostsPage = postRepository.findPostByUserId(userId, pageable);
        Page<SharedPost> sharedPostsPage = sharedPostRepository.findSharedPostByUserId(userId, pageable);
        boolean isFriend = profileServiceClient.areFriends(currentUserId, userId);

        List<Post> originalPosts = originalPostsPage.getContent().stream()
                .filter(post -> post.getVisibility() == PostVisibility.PUBLIC ||
                        (post.getVisibility() == PostVisibility.FRIENDS && isFriend) ||
                        (post.getVisibility() == PostVisibility.PRIVATE && post.getUserId().equals(currentUserId)))
                .filter(post -> post.getGroupId() == null)
                .toList();

        List<Post> sharedPosts = sharedPostsPage.getContent().stream()
                .filter(sharedPost -> sharedPost.getVisibility() == PostVisibility.PUBLIC ||
                        (sharedPost.getVisibility() == PostVisibility.FRIENDS && isFriend) ||
                        (sharedPost.getVisibility() == PostVisibility.PRIVATE && sharedPost.getUserId().equals(currentUserId)))
                .map(Post.class::cast)
                .toList();

        List<Post> combinedPosts = new ArrayList<>(originalPosts);
        combinedPosts.addAll(sharedPosts);
        combinedPosts.sort(Comparator.comparing(Post::getCreatedDate).reversed());

        return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Posts retrieved successfully")
                .result(PageResponse.<PostResponse>builder()
                        .currentPage(page)
                        .pageSize(size)
                        .totalPage(Math.max(originalPostsPage.getTotalPages(), sharedPostsPage.getTotalPages()))
                        .totalElement(originalPostsPage.getTotalElements() + sharedPostsPage.getTotalElements())
                        .data(combinedPosts.stream().map(postMapper::toPostResponse).collect(Collectors.toList()))
                        .build())
                .build();
    }

    public ApiResponse<PostResponse> getPostById(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getVisibility() == PostVisibility.PRIVATE &&
                !post.getUserId().equals(SecurityContextHolder.getContext().getAuthentication().getName())) {
            throw new RuntimeException("You are not authorized to view this post.");
        }

        PostResponse postResponse = postMapper.toPostResponse(post);

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Post retrieved successfully")
                .result(postResponse)
                .build();
    }

      public ApiResponse<PostResponse> savePost(String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getVisibility() == PostVisibility.PRIVATE &&
                !post.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to save this post.");
        }

        if (post.getSavedBy().contains(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Post already saved")
                    .build();
        }

        post.getSavedBy().add(currentUserId);
        post = postRepository.save(post);
        PostResponse postResponse = postMapper.toPostResponse(post);

        // Set username and imageUrl manually
        UserInfoResponse userInfo = getUserInfoWithFallback(post.getUserId());
        postResponse.setUsername(userInfo.getUsername());
        postResponse.setImageUrl(userInfo.getImageUrl());

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Post saved successfully")
                .result(postResponse)
                .build();
    }

    public ApiResponse<PostResponse> unSavePost(String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getVisibility() == PostVisibility.PRIVATE &&
                !post.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to unsave this post.");
        }

        if (!post.getSavedBy().contains(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Post not saved by the user")
                    .build();
        }

        post.getSavedBy().remove(currentUserId);
        post = postRepository.save(post);
        PostResponse postResponse = postMapper.toPostResponse(post);

        UserInfoResponse userInfo = getUserInfoWithFallback(post.getUserId());
        postResponse.setUsername(userInfo.getUsername());
        postResponse.setImageUrl(userInfo.getImageUrl());

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Post unsaved successfully")
                .result(postResponse)
                .build();
    }

    public ApiResponse<PageResponse<PostResponse>> getAllPostsave(int page, int size) {
        if (page < 1 || size < 1) {
            return ApiResponse.<PageResponse<PostResponse>>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Page and size parameters must be greater than 0.")
                    .build();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ApiResponse.<PageResponse<PostResponse>>builder()
                    .code(HttpStatus.UNAUTHORIZED.value())
                    .message("User is not authenticated.")
                    .build();
        }

        String currentUserId = authentication.getName();

        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Post> pageData = postRepository.findAllBySavedBy(currentUserId, pageable);

            List<PostResponse> postResponses = pageData.getContent().stream()
                    .filter(post -> post.getVisibility() == PostVisibility.PUBLIC ||
                            (post.getVisibility() == PostVisibility.PRIVATE && post.getUserId().equals(currentUserId)))
                    .map(post -> {
                        PostResponse response = postMapper.toPostResponse(post);
                        UserInfoResponse userInfo = getUserInfoWithFallback(post.getUserId());
                        response.setUsername(userInfo.getUsername());
                        response.setImageUrl(userInfo.getImageUrl());
                        return response;
                    })
                    .collect(Collectors.toList());

            PageResponse<PostResponse> pageResponse = PageResponse.<PostResponse>builder()
                    .currentPage(page)
                    .pageSize(size)
                    .totalPage(pageData.getTotalPages())
                    .totalElement(pageData.getTotalElements())
                    .data(postResponses)
                    .build();

            return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Saved posts retrieved successfully")
                .result(pageResponse)
                .build();
        } catch (Exception ex) {
            log.error("Failed to retrieve saved posts for user: {}", currentUserId, ex);
            return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("An error occurred while retrieving saved posts.")
                .build();
        }
    }
    public ApiResponse<PageResponse<PostResponse>> getSharedPostsByUserId(String userId, int page, int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isBlocked = profileServiceClient.isBlocked(currentUserId, userId) || profileServiceClient.isBlocked(userId, currentUserId);
        if (isBlocked) {
            return ApiResponse.<PageResponse<PostResponse>>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to view this user's shared posts.")
                    .build();
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdDate")));
        Page<SharedPost> sharedPostPage = sharedPostRepository.findSharedPostByUserId(userId, pageable);
        boolean isFriend = profileServiceClient.areFriends(currentUserId, userId);

        List<SharedPost> filteredSharedPosts = sharedPostPage.getContent().stream()
                .filter(sharedPost -> sharedPost.getVisibility() == PostVisibility.PUBLIC ||
                        (sharedPost.getVisibility() == PostVisibility.FRIENDS && isFriend) ||
                        (sharedPost.getVisibility() == PostVisibility.PRIVATE && sharedPost.getUserId().equals(currentUserId)))
                .collect(Collectors.toList());

        List<PostResponse> sharedPostResponses = filteredSharedPosts.stream()
                .map(shareMapper::toPostResponse)
                .collect(Collectors.toList());

        PageResponse<PostResponse> response = PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPage(sharedPostPage.getTotalPages())
                .totalElement(sharedPostPage.getTotalElements())
                .data(sharedPostResponses)
                .build();

        return ApiResponse.<PageResponse<PostResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Shared posts retrieved successfully")
                .result(response)
                .build();
    }

    public boolean isFriend(String currentUserId, String postUserId) {
        return profileServiceClient.areFriends(currentUserId, postUserId);
    }

    private String extractFileNameFromUrl(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        return fileName;
    }

    private String decodeUrl(String encodedUrl) {
        return URLDecoder.decode(encodedUrl, StandardCharsets.UTF_8);
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

    private Map<String, UserInfoResponse> batchFetchUserInfo(Set<String> userIds) {
        Map<String, UserInfoResponse> userInfoMap = new HashMap<>();
        for (String userId : userIds) {
            userInfoMap.put(userId, getUserInfoWithFallback(userId));
        }
        return userInfoMap;
    }

    public ApiResponse<PostResponse> translatePostContent(String postId, String targetLanguage) {
        return translationService.translatePostContent(postId, targetLanguage);
    }
}