package com.LinkVerse.profile.service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.LinkVerse.profile.dto.response.FriendshipResponse;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.entity.Friendship;
import com.LinkVerse.profile.entity.FriendshipStatus;
import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.exception.AppException;
import com.LinkVerse.profile.exception.ErrorCode;
import com.LinkVerse.profile.exception.FriendRequestNotFoundException;
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
public class FriendService {
    FriendshipRepository friendshipRepository;
    UserProfileRepository userRepository;
    KafkaTemplate<String, String> kafkaTemplate;
    UserProfileMapper userProfileMapper;

    public FriendshipResponse unfriend(String recipientUserId) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile currentUser = getUser(currentUserId);
        UserProfile recipient = getUser(recipientUserId);

        Friendship friendship = friendshipRepository
                .findByUserProfiles(currentUser, recipient)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        friendshipRepository.delete(friendship);

        kafkaTemplate.send(
                "friendship-requests", "User " + currentUser.getUsername() + " unfriended " + recipient.getUsername());

        return FriendshipResponse.builder()
                .senderUsername(currentUser.getUsername())
                .recipientUsername(recipient.getUsername())
                .status(FriendshipStatus.NONE)
                .build();
    }

    public FriendshipResponse sendFriendRequest(String recipientUserId) {
        String senderUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        // Không cho gửi lời mời tới chính mình
        if (senderUserId.equals(recipientUserId)) {
            throw new RuntimeException("Bạn không thể gửi lời mời kết bạn cho chính mình.");
        }

        UserProfile sender = getUser(senderUserId);
        UserProfile recipient = getUser(recipientUserId);

        // Kiểm tra trạng thái block
        if (isBlocked(senderUserId, recipientUserId)) {
            throw new RuntimeException("Không thể gửi lời mời tới người bị chặn.");
        }

        // Kiểm tra nếu đã có mối quan hệ tồn tại
        Optional<Friendship> existing = friendshipRepository.findByUserProfiles(sender, recipient);

        if (existing.isPresent()) {
            Friendship f = existing.get();
            switch (f.getStatus()) {
                case PENDING -> throw new AppException(ErrorCode.FRIEND_ALREADY_REQUESTED);
                case ACCEPTED -> throw new AppException(ErrorCode.FRIEND_ALREADY);
                case BLOCKED -> throw new AppException(ErrorCode.FRIEND_BLOCKED);
                default -> throw new AppException(ErrorCode.FRIEND_ALREADY_REQUESTED);
            }
        }

        // Nếu không có, tiến hành gửi lời mời
        Friendship friendship = Friendship.builder()
                .sender(sender)
                .recipient(recipient)
                .status(FriendshipStatus.PENDING)
                .build();

        friendshipRepository.save(friendship);
        kafkaTemplate.send("friendship-requests", "Request sent from " + sender.getUsername());

        return FriendshipResponse.builder()
                .senderUsername(sender.getUsername())
                .recipientUsername(recipient.getUsername())
                .status(FriendshipStatus.PENDING)
                .build();
    }

    public FriendshipResponse cancelFriendRequest(String recipientUserId) {
        String senderUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile sender = getUser(senderUserId);
        UserProfile recipient = getUser(recipientUserId);

        Friendship friendship = friendshipRepository
                .findByUserProfiles(sender, recipient)
                .orElseThrow(() -> new FriendRequestNotFoundException("No pending request found"));

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Cannot cancel: Request is not in pending state");
        }

        if (!friendship.getSender().equals(sender)) {
            throw new RuntimeException("You can only cancel your own friend requests");
        }

        friendshipRepository.delete(friendship);

        kafkaTemplate.send(
                "friendship-requests",
                "Friend request from " + sender.getUsername() + " to " + recipient.getUsername() + " cancelled");

        return FriendshipResponse.builder()
                .senderUsername(sender.getUsername())
                .recipientUsername(recipient.getUsername())
                .status(FriendshipStatus.NONE)
                .build();
    }

    public FriendshipResponse acceptFriendRequest(String senderUserId) {
        String recipientUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile sender = getUser(senderUserId);
        UserProfile recipient = getUser(recipientUserId);

        Friendship friendship = friendshipRepository
                .findByUserProfiles(sender, recipient)
                .orElseThrow(() -> new FriendRequestNotFoundException("No pending request"));

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Not in pending state");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);

        kafkaTemplate.send("friendship-requests", "Accepted by " + recipient.getUsername());

        return FriendshipResponse.builder()
                .senderUsername(sender.getUsername())
                .recipientUsername(recipient.getUsername())
                .status(FriendshipStatus.ACCEPTED)
                .build();
    }

    public FriendshipResponse rejectFriendRequest(String senderUserId) {
        String recipientUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile sender = getUser(senderUserId);
        UserProfile recipient = getUser(recipientUserId);

        Friendship friendship = friendshipRepository
                .findByUserProfiles(sender, recipient)
                .orElseThrow(() -> new FriendRequestNotFoundException("No pending request"));

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Not in pending state");
        }

        friendshipRepository.delete(friendship);
        kafkaTemplate.send("friendship-requests", "Rejected by " + recipient.getUsername());

        return FriendshipResponse.builder()
                .senderUsername(sender.getUsername())
                .recipientUsername(recipient.getUsername())
                .status(FriendshipStatus.REJECTED)
                .build();
    }

    public Set<UserProfileResponse> getAllFriends(String userId) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile target =
                userRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (target.isPrivateProfile() && !currentUserId.equals(userId)) {
            throw new RuntimeException("Hồ sơ này ở chế độ riêng tư");
        }

        Set<Friendship> friendships =
                friendshipRepository.findFriendshipsByUserAndStatus(target, FriendshipStatus.ACCEPTED);

        return friendships.stream()
                .map(f -> f.getSender().equals(target) ? f.getRecipient() : f.getSender())
                .map(userProfileMapper::toUserProfileReponse)
                .collect(Collectors.toSet());
    }

    public Set<UserProfileResponse> getAllFriendsOfCurrentUser() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile currentUser = getUser(currentUserId);

        Set<Friendship> friendships =
                friendshipRepository.findFriendshipsByUserAndStatus(currentUser, FriendshipStatus.ACCEPTED);

        return friendships.stream()
                .map(f -> f.getSender().equals(currentUser) ? f.getRecipient() : f.getSender())
                .filter(friend -> !isBlocked(currentUserId, friend.getUserId())
                        && !isBlocked(
                                friend.getUserId(),
                                currentUserId)) // Loại bỏ bạn bè bị chặn hoặc chặn người dùng hiện tại
                .map(userProfileMapper::toUserProfileReponse)
                .collect(Collectors.toSet());
    }

    public Set<UserProfileResponse> getAllFriendsRequest() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile currentUser = getUser(currentUserId);

        Set<Friendship> requests =
                friendshipRepository.findFriendshipsByUserAndStatus(currentUser, FriendshipStatus.PENDING);

        return requests.stream()
                .filter(f -> f.getRecipient().equals(currentUser))
                .map(Friendship::getSender)
                .map(userProfileMapper::toUserProfileReponse)
                .collect(Collectors.toSet());
    }

    public Set<UserProfileResponse> getSentFriendRequests() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile currentUser = getUser(currentUserId);

        Set<Friendship> requests =
                friendshipRepository.findFriendshipsByUserAndStatus(currentUser, FriendshipStatus.PENDING);

        return requests.stream()
                .filter(f -> f.getSender().equals(currentUser))
                .map(Friendship::getRecipient)
                .map(userProfileMapper::toUserProfileReponse)
                .collect(Collectors.toSet());
    }

    public boolean isBlocked(String userId1, String userId2) {
        UserProfile u1 = getUser(userId1);
        UserProfile u2 = getUser(userId2);
        return friendshipRepository
                .findByUserProfiles(u1, u2)
                .map(f -> f.getStatus() == FriendshipStatus.BLOCKED)
                .orElse(false);
    }

    public boolean areFriend(String userId1, String userId2) {
        UserProfile u1 = getUser(userId1);
        UserProfile u2 = getUser(userId2);
        return friendshipRepository
                .findByUserProfiles(u1, u2)
                .map(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .orElse(false);
    }

    private UserProfile getUser(String userId) {
        return userRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }
}
