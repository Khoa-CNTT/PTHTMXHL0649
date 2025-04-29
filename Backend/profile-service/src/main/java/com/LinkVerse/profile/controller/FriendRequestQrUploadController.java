package com.LinkVerse.profile.controller;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import javax.imageio.ImageIO;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.profile.dto.ApiResponse;
import com.LinkVerse.profile.dto.response.FriendshipResponse;
import com.LinkVerse.profile.exception.AppException;
import com.LinkVerse.profile.exception.ErrorCode;
import com.LinkVerse.profile.service.FriendService;
import com.LinkVerse.profile.service.QrTokenService;
import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/fr")
@RequiredArgsConstructor
@Slf4j
public class FriendRequestQrUploadController {

    private final QrTokenService qrTokenService;
    private final FriendService friendService;

    @PostMapping(value = "/qr/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FriendshipResponse>> uploadQrImage(@RequestParam("file") MultipartFile file) {
        try {
            log.info("📥 Nhận ảnh QR: {}", file.getOriginalFilename());

            String token = decodeQrFromImage(file);
            log.info("📦 Token giải mã từ ảnh: {}", token);

            String targetUserId = qrTokenService
                    .getUserIdFromToken(token)
                    .orElseThrow(() -> new AppException(ErrorCode.QR_TOKEN_INVALID));

            FriendshipResponse response = friendService.sendFriendRequest(targetUserId);

            return ResponseEntity.ok(ApiResponse.<FriendshipResponse>builder()
                    .message("Gửi lời mời thành công")
                    .result(response)
                    .build());

        } catch (AppException e) {
            ErrorCode errorCode = e.getErrorCode();
            return ResponseEntity.status(errorCode.getStatusCode())
                    .body(ApiResponse.<FriendshipResponse>builder()
                            .code(errorCode.getCode())
                            .message(errorCode.getMessage())
                            .build());
        } catch (IOException e) {
            log.error("❌ Lỗi đọc ảnh QR", e);
            throw new AppException(ErrorCode.QR_DECODE_FAIL);
        } catch (Exception e) {
            log.error("❌ Lỗi xử lý mã QR", e);
            throw new AppException(ErrorCode.QR_DECODE_FAIL);
        }
    }

    private String decodeQrFromImage(MultipartFile file) throws IOException {
        BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
        LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
        try {
            Result result = new MultiFormatReader().decode(bitmap);
            log.info("Nội dung QR đọc được: {}", result.getText());
            return extractTokenFromUrl(result.getText());
        } catch (NotFoundException e) {
            log.warn("Không đọc được QR từ ảnh đã upload", e);
            throw new AppException(ErrorCode.QR_NOT_FOUND);
        }
    }

    private String extractTokenFromUrl(String url) {
        try {
            URI uri = URI.create(url);
            return Arrays.stream(uri.getQuery().split("&"))
                    .filter(s -> s.startsWith("t="))
                    .map(s -> s.substring(2))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.QR_TOKEN_INVALID));
        } catch (Exception e) {
            throw new AppException(ErrorCode.QR_TOKEN_INVALID);
        }
    }
}
