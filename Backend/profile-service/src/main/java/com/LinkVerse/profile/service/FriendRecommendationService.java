package com.LinkVerse.profile.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.LinkVerse.profile.entity.FriendshipStatus;
import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.repository.FriendshipRepository;
import com.LinkVerse.profile.repository.UserProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FriendRecommendationService {
    private final UserProfileRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendService friendService;

    public List<UserProfile> suggestFriends(String currentUserId) {
        UserProfile currentUser = userRepository
                .findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<UserProfile> all = userRepository.findAll();
        return all.stream()
                .filter(u -> !u.getUserId().equals(currentUserId))
                .filter(u -> !friendshipRepository
                        .findByUserProfiles(currentUser, u)
                        .filter(f ->
                                f.getStatus() == FriendshipStatus.ACCEPTED || f.getStatus() == FriendshipStatus.PENDING)
                        .isPresent())
                .filter(u -> !friendService.isBlocked(currentUserId, u.getUserId())
                        && !friendService.isBlocked(u.getUserId(), currentUserId))
                .limit(5)
                .collect(Collectors.toList());
    }
}
