package com.LinkVerse.profile.service;

import org.springframework.stereotype.Service;

import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.repository.UserProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileCompletionService {
    private final UserProfileRepository userProfileRepository;

    public int calculateCompletion(String userId) {
        UserProfile user =
                userProfileRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("User not found"));

        int completed = 0;
        int total = 7;

        if (user.getBio() != null) completed++;
        if (user.getQuote() != null) completed++;
        if (user.getJobTitle() != null) completed++;
        if (user.getCoverImageUrl() != null) completed++;
        if (user.getThemeColor() != null) completed++;
        if (user.getCompany() != null) completed++;

        return (completed * 100) / total;
    }
}
