package com.LinkVerse.profile.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.profile.dto.ApiResponse;
import com.LinkVerse.profile.dto.request.ProfileUpdateRequest;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.exception.AppException;
import com.LinkVerse.profile.exception.ErrorCode;
import com.LinkVerse.profile.mapper.UserProfileMapper;
import com.LinkVerse.profile.repository.UserProfileRepository;
import com.LinkVerse.profile.service.UserProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;
    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateImage(@PathVariable("userId") String userId, @RequestParam String imageFile) {
        if (userId == null || userId.isEmpty() || imageFile == null || imageFile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            userProfileService.updateImage(userId, imageFile);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("User not found for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Failed to update user image for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users")
    ApiResponse<List<UserProfileResponse>> getAllProfiles() {
        // Bỏ xác thực ng dùng

        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getAllProfiles())
                .build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable String userId) {
        try {
            userProfileService.deleteUserProfile(userId);
            log.info("Successfully deleted user profile for ID: {}", userId);
            return ResponseEntity.noContent().build();
        } catch (AppException e) {
            log.error("Error deleting user profile for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Failed to delete user profile for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    @PatchMapping("/my-profile/status")
    public ResponseEntity<UserProfileResponse> updateMyStatus(@RequestParam String status) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfileResponse updatedProfile = userProfileService.updateStatus(userId, status);
        return ResponseEntity.ok(updatedProfile);
    }

    @PatchMapping("/update")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody ProfileUpdateRequest request) {
        UserProfileResponse response = userProfileService.updateProfile(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{profileId}")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable String profileId) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile profile = userProfileRepository
                .findById(profileId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean isOwner = profile.getUserId().equals(currentUserId);

        if (profile.isPrivateProfile() && !isOwner) {
            return ApiResponse.<UserProfileResponse>builder()
                    .code(200)
                    .message("Hồ sơ riêng tư")
                    .result(UserProfileResponse.builder()
                            .username(profile.getUsername())
                            .imageUrl(profile.getImageUrl())
                            .bio("Hồ sơ này đang được đặt ở chế độ riêng tư.")
                            .privateProfile(true)
                            .build())
                    .build();
        }

        return ApiResponse.<UserProfileResponse>builder()
                .code(200)
                .message("Lấy hồ sơ thành công")
                .result(userProfileMapper.toUserProfileReponse(profile))
                .build();
    }
}
