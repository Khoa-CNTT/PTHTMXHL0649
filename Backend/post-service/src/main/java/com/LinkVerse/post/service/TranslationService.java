package com.LinkVerse.post.service;

import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.translate.TranslateClient;
import software.amazon.awssdk.services.translate.model.TranslateTextRequest;
import software.amazon.awssdk.services.translate.model.TranslateTextResponse;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TranslationService {
    private final TranslateClient translateClient;
    private final PostRepository postRepository;
    private final PostMapper postMapper;

    public String translateText(String text, String sourceLanguage, String targetLanguage) {
        TranslateTextRequest request = TranslateTextRequest.builder()
                .text(text)
                .sourceLanguageCode(sourceLanguage)
                .targetLanguageCode(targetLanguage)
                .build();

        TranslateTextResponse response = translateClient.translateText(request);
        return response.translatedText();
    }

    public ApiResponse<PostResponse> translatePostContent(String postId, String targetLanguage) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        String translatedContent = translateText(post.getContent(), "auto", targetLanguage);

        post.setContent(translatedContent);
        post.setLanguage(targetLanguage);
        post.setModifiedDate(Instant.now());
        postRepository.save(post);

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Post content translated successfully")
                .result(postMapper.toPostResponse(post))
                .build();
    }
}