package com.LinkVerse.profile.controller;

import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.profile.dto.response.FriendshipResponse;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.service.FriendService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendController {

    private final FriendService friendService;

    // Gửi yêu cầu kết bạn
    @PostMapping("/request/{recipientUserId}")
    public ResponseEntity<FriendshipResponse> sendFriendRequest(@PathVariable String recipientUserId) {
        return ResponseEntity.ok(friendService.sendFriendRequest(recipientUserId));
    }

    // Huỷ yêu cầu kết bạn
    @PostMapping("/cancel/{recipientUserId}")
    public ResponseEntity<FriendshipResponse> cancelSendFriendRequest(@PathVariable String recipientUserId) {
        return ResponseEntity.ok(friendService.cancelFriendRequest(recipientUserId));
    }

    // Chấp nhận lời mời kết bạn
    @PostMapping("/{senderUserId}/accept")
    public ResponseEntity<FriendshipResponse> acceptFriendRequest(@PathVariable String senderUserId) {
        return ResponseEntity.ok(friendService.acceptFriendRequest(senderUserId));
    }

    // Từ chối lời mời
    @PostMapping("/{senderUserId}/reject")
    public ResponseEntity<FriendshipResponse> rejectFriendRequest(@PathVariable String senderUserId) {
        return ResponseEntity.ok(friendService.rejectFriendRequest(senderUserId));
    }

    // Hủy kết bạn
    @DeleteMapping("/{recipientUserId}/unfriend")
    public ResponseEntity<FriendshipResponse> unFriendRequest(@PathVariable String recipientUserId) {
        return ResponseEntity.ok(friendService.unfriend(recipientUserId));
    }

    // Lấy danh sách bạn của user cụ thể
    @GetMapping("/user/{userId}")
    public ResponseEntity<Set<UserProfileResponse>> getFriendOfUser(@PathVariable String userId) {
        return ResponseEntity.ok(friendService.getAllFriends(userId));
    }

    // Lấy danh sách bạn của chính mình
    @GetMapping("/my")
    public ResponseEntity<Set<UserProfileResponse>> getMyFriends() {
        return ResponseEntity.ok(friendService.getAllFriendsOfCurrentUser());
    }

    // Danh sách lời mời đến (người khác gửi đến mình)
    @GetMapping("/my/requests/received")
    public ResponseEntity<Set<UserProfileResponse>> getFriendRequestsReceived() {
        return ResponseEntity.ok(friendService.getAllFriendsRequest());
    }

    // Danh sách lời mời mình đã gửi
    @GetMapping("/my/requests/sent")
    public ResponseEntity<Set<UserProfileResponse>> getFriendRequestsSent() {
        return ResponseEntity.ok(friendService.getSentFriendRequests());
    }

    // Kiểm tra có đang là bạn không
    @GetMapping("/check/are-friends")
    public ResponseEntity<Boolean> areFriends(@RequestParam String userId1, @RequestParam String userId2) {
        return ResponseEntity.ok(friendService.areFriend(userId1, userId2));
    }

    // Kiểm tra có đang bị block không
    @GetMapping("/check/is-blocked")
    public ResponseEntity<Boolean> isBlocked(@RequestParam String userId1, @RequestParam String userId2) {
        return ResponseEntity.ok(friendService.isBlocked(userId1, userId2));
    }
}
