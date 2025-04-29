package com.LinkVerse.identity.repository.httpclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.identity.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.identity.configuration.FeignConfig;
import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.identity.dto.request.ProfileCreationRequest;
import com.LinkVerse.identity.dto.request.ProfileUpdateRequest;
import com.LinkVerse.identity.dto.response.UserProfileResponse;

// Connection to profile-service
@FeignClient(
        name = "profile-service",
        url = "${app.services.profile}",
        configuration = {AuthenticationRequestInterceptor.class, FeignConfig.class})
public interface ProfileClient {
    @PostMapping(value = "/internal/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request);

    @DeleteMapping("/{userId}")
    ResponseEntity<Void> deleteUserProfile(@PathVariable String userId);

    @PatchMapping(value = "/my-profile/status")
    ResponseEntity<UserProfileResponse> updateMyStatus(@RequestParam String status);

    @PatchMapping(value = "/update")
    ResponseEntity<UserProfileResponse> updateProfile(@RequestBody ProfileUpdateRequest request);
}
