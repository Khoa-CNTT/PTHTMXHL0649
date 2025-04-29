package com.LinkVerse.profile.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.LinkVerse.profile.service.QrCodeService;
import com.LinkVerse.profile.service.QrTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/qr")
@RequiredArgsConstructor
public class QrController {

    private final QrCodeService qrCodeService;
    private final QrTokenService qrTokenService;

    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateQrCode() {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        String token = qrTokenService.generateToken(currentUserId);

        String qrUrl = "http://localhost:8888/api/v1/profile/fr/qr?t=" + token;
        byte[] qrImage = qrCodeService.generateQRCodeImage(qrUrl);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header("Content-Disposition", "attachment; filename=friend-qr.png")
                .body(qrImage);
    }
}
