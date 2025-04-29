package com.LinkVerse.profile.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.LinkVerse.profile.dto.ApiResponse;
import com.LinkVerse.profile.dto.response.FriendshipResponse;
import com.LinkVerse.profile.exception.AppException;
import com.LinkVerse.profile.exception.ErrorCode;
import com.LinkVerse.profile.service.FriendService;
import com.LinkVerse.profile.service.QrTokenService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/fr")
@RequiredArgsConstructor
public class FriendRequestQrController {

    private final QrTokenService qrTokenService;
    private final FriendService friendService;

    @PostMapping("/qr")
    public ResponseEntity<ApiResponse<FriendshipResponse>> sendFriendRequestViaToken(@RequestParam("t") String token) {
        try {
            String targetUserId = qrTokenService
                    .getUserIdFromToken(token)
                    .orElseThrow(() -> new AppException(ErrorCode.QR_TOKEN_INVALID));

            qrTokenService.deleteToken(token);
            FriendshipResponse response = friendService.sendFriendRequest(targetUserId);

            return ResponseEntity.ok(ApiResponse.<FriendshipResponse>builder()
                    .message("Gửi lời mời thành công")
                    .result(response)
                    .build());

        } catch (AppException e) {
            ErrorCode code = e.getErrorCode();
            return ResponseEntity.status(code.getStatusCode())
                    .body(ApiResponse.<FriendshipResponse>builder()
                            .code(code.getCode())
                            .message(code.getMessage())
                            .build());
        }
    }

    @Data
    public static class QrTokenRequest {
        private String token;
    }
}
