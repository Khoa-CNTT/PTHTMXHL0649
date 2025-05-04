package com.LinkVerse.donation_service.repository.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.donation_service.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.response.PostResponse;

@FeignClient(
        name = "post-service",
        url = "${post.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface PostClient {
    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPostById(@PathVariable("postId") String postId);

    @PostMapping(value = "/post-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<PostResponse> createPost(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files);
}
