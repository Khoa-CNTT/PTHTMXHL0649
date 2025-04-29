package com.LinkVerse.profile.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.LinkVerse.profile.dto.ApiResponse;
import com.LinkVerse.profile.dto.request.UserProfileUpdateRequest;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.mapper.UserProfileMapper;
import com.LinkVerse.profile.service.FriendRecommendationService;
import com.LinkVerse.profile.service.ProfileCompletionService;
import com.LinkVerse.profile.service.UserProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileCompletionService profileCompletionService;
    private final FriendRecommendationService friendRecommendationService;
    private final UserProfileMapper userProfileMapper;
    private final UserProfileService userProfileService;

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestBody UserProfileUpdateRequest request) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfileResponse updatedProfile = userProfileService.updateProfile(currentUserId, request);

        ApiResponse<UserProfileResponse> response = ApiResponse.<UserProfileResponse>builder()
                .code(200)
                .message("Cập nhật hồ sơ thành công")
                .result(updatedProfile)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/completion")
    public ResponseEntity<ApiResponse<Integer>> getProfileCompletion() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        int percent = profileCompletionService.calculateCompletion(currentUserId);

        ApiResponse<Integer> response = ApiResponse.<Integer>builder()
                .code(200)
                .message("Tính toán độ hoàn thiện hồ sơ thành công")
                .result(percent)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggest-friends")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> suggestFriends() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        List<UserProfile> friends = friendRecommendationService.suggestFriends(currentUserId);

        List<UserProfileResponse> responseList =
                friends.stream().map(userProfileMapper::toUserProfileReponse).toList();

        ApiResponse<List<UserProfileResponse>> response = ApiResponse.<List<UserProfileResponse>>builder()
                .code(200)
                .message("Gợi ý bạn bè thành công")
                .result(responseList)
                .build();

        return ResponseEntity.ok(response);
    }
}
