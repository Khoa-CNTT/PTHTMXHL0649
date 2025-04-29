package com.LinkVerse.profile.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.LinkVerse.profile.dto.response.FriendshipResponse;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.entity.Friendship;
import com.LinkVerse.profile.entity.FriendshipStatus;
import com.LinkVerse.profile.entity.UserProfile;
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
public class BlockService {
    FriendshipRepository friendshipRepository;
    UserProfileRepository userRepository;
    UserProfileMapper userProfileMapper;

    public FriendshipResponse blockUser(String targetUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        UserProfile currentUser = userRepository
                .findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found: " + currentUserId));
        UserProfile targetUser = userRepository
                .findByUserId(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found: " + targetUserId));

        if (isBlocked(targetUser.getUserId(), currentUser.getUserId())) {
            throw new RuntimeException("Cannot block a user who has already blocked you.");
        }

        Friendship friendship = friendshipRepository
                .findByUserProfiles(currentUser, targetUser)
                .orElse(Friendship.builder()
                        .sender(currentUser)
                        .recipient(targetUser)
                        .build());

        friendship.setStatus(FriendshipStatus.BLOCKED);
        friendship.setBlockedAt(LocalDateTime.now());
        friendshipRepository.save(friendship);

        return FriendshipResponse.builder()
                .senderUsername(currentUser.getUsername())
                .recipientUsername(targetUser.getUsername())
                .status(FriendshipStatus.BLOCKED)
                .build();
    }

    public FriendshipResponse unblockUser(String targetUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        UserProfile currentUser = userRepository
                .findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found: " + currentUserId));
        UserProfile targetUser = userRepository
                .findByUserId(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found: " + targetUserId));

        Friendship friendship = friendshipRepository
                .findByUserProfiles(currentUser, targetUser)
                .orElseThrow(() -> new RuntimeException("No existing friendship to unblock."));

        if (friendship.getStatus() != FriendshipStatus.BLOCKED) {
            throw new RuntimeException("No existing block to unblock.");
        }

        friendshipRepository.delete(friendship);

        return FriendshipResponse.builder()
                .senderUsername(currentUser.getUsername())
                .recipientUsername(targetUser.getUsername())
                .status(FriendshipStatus.NONE)
                .build();
    }

    public Set<UserProfileResponse> getBlockedUsers() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile currentUser = userRepository
                .findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        Set<Friendship> blocks = friendshipRepository.findBySenderAndStatus(currentUser, FriendshipStatus.BLOCKED);

        return blocks.stream()
                .map(Friendship::getRecipient)
                .map(userProfileMapper::toUserProfileReponse)
                .collect(Collectors.toSet());
    }

    private boolean isBlocked(String targetUserId, String currentUserId) {
        Optional<Friendship> friendshipOpt = friendshipRepository.findByUserProfiles(
                userRepository
                        .findByUserId(targetUserId)
                        .orElseThrow(() -> new RuntimeException("Target user not found")),
                userRepository
                        .findByUserId(currentUserId)
                        .orElseThrow(() -> new RuntimeException("Current user not found")));
        return friendshipOpt.isPresent() && friendshipOpt.get().getStatus() == FriendshipStatus.BLOCKED;
    }
}
