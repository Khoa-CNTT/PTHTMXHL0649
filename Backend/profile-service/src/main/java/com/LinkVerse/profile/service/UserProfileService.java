package com.LinkVerse.profile.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.LinkVerse.profile.dto.request.ProfileCreationRequest;
import com.LinkVerse.profile.dto.request.ProfileUpdateRequest;
import com.LinkVerse.profile.dto.request.UserProfileUpdateRequest;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.entity.UserStatus;
import com.LinkVerse.profile.exception.AppException;
import com.LinkVerse.profile.exception.ErrorCode;
import com.LinkVerse.profile.mapper.UserProfileMapper;
import com.LinkVerse.profile.repository.FriendshipRepository;
import com.LinkVerse.profile.repository.UserProfileRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileService {
    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;
    FriendshipRepository friendshipRepository;

    public void updateImage(String userId, String imageUrl) {
        UserProfile userProfile = userProfileRepository.findUserProfileByUserId(userId);
        if (userProfile == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        userProfile.setImageUrl(imageUrl);
        userProfileRepository.save(userProfile);
    }

    public UserProfileResponse createProfile(ProfileCreationRequest request) {
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().matches("\\d{10,15}")) {
            throw new AppException(ErrorCode.INVALID_PHONE_NUMBER);
        }

        UserProfile userProfile = userProfileMapper.toUserProfile(request);
        userProfile = userProfileRepository.save(userProfile);

        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    public UserProfileResponse getByUserId(String userId) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile userProfile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean isOwner = currentUserId.equals(userId);
        boolean isPrivate = userProfile.isPrivateProfile();

        if (isPrivate && !isOwner) {
            // Chỉ trả về thông tin cơ bản
            return UserProfileResponse.builder()
                    .username(userProfile.getUsername())
                    .imageUrl(userProfile.getImageUrl())
                    .bio("Hồ sơ này đang được đặt ở chế độ riêng tư.")
                    .privateProfile(true)
                    .build();
        }

        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    public UserProfileResponse getProfile(String id) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile userProfile =
                userProfileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean isOwner = currentUserId.equals(userProfile.getUserId());
        boolean isPrivate = userProfile.isPrivateProfile();

        if (isPrivate && !isOwner) {
            return UserProfileResponse.builder()
                    .username(userProfile.getUsername())
                    .imageUrl(userProfile.getImageUrl())
                    .bio("Hồ sơ này đang được đặt ở chế độ riêng tư.")
                    .privateProfile(true)
                    .build();
        }

        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    public List<UserProfileResponse> getAllProfiles() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        return userProfileRepository.findAll().stream()
                .map(profile -> {
                    if (profile.isPrivateProfile() && !profile.getUserId().equals(currentUserId)) {
                        return UserProfileResponse.builder()
                                .username(profile.getUsername())
                                .imageUrl(profile.getImageUrl())
                                .bio("Hồ sơ này đang được đặt ở chế độ riêng tư.")
                                .privateProfile(true)
                                .build();
                    }
                    return userProfileMapper.toUserProfileReponse(profile);
                })
                .toList();
    }

    public UserProfileResponse getMyProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var profile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileReponse(profile);
    }

    @Transactional
    public void deleteUserProfile(String userId) {
        UserProfile userProfile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        friendshipRepository.deleteByUserProfile(userProfile);
        userProfileRepository.delete(userProfile);
    }

    public UserProfileResponse updateStatus(String userId, String status) {
        UserProfile userProfile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userProfile.setStatus(UserStatus.valueOf(status));
        return userProfileMapper.toUserProfileReponse(userProfileRepository.save(userProfile));
    }

    @Transactional
    public UserProfileResponse updateProfile(ProfileUpdateRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByUserId(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        log.info("Updating user profile for ID: {}", userProfile.getUserId());
        if (request.getUsername() != null) {
            userProfile.setUsername(request.getUsername());
        }
        if (request.getFirstName() != null) {
            userProfile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            userProfile.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            userProfile.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            userProfile.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            userProfile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getCity() != null) {
            userProfile.setCity(request.getCity());
        }
        if (request.getGender() != null) {
            userProfile.setGender(request.getGender());
        }
        if (request.getImageUrl() != null) {
            userProfile.setImageUrl(request.getImageUrl());
        }
        userProfile = userProfileRepository.save(userProfile);
        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UserProfileUpdateRequest request) {
        UserProfile profile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getQuote() != null) profile.setQuote(request.getQuote());
        if (request.getJobTitle() != null) profile.setJobTitle(request.getJobTitle());
        if (request.getCompany() != null) profile.setCompany(request.getCompany());
        if (request.getThemeColor() != null) profile.setThemeColor(request.getThemeColor());
        if (request.getCoverImageUrl() != null) profile.setCoverImageUrl(request.getCoverImageUrl());
        if (request.getPrivateProfile() != null) profile.setPrivateProfile(request.getPrivateProfile());

        userProfileRepository.save(profile);

        return userProfileMapper.toUserProfileReponse(profile);
    }
}
