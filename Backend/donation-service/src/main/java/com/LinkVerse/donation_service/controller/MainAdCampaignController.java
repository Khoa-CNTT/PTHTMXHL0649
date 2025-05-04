package com.LinkVerse.donation_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.MainAdCampaignRequest;
import com.LinkVerse.donation_service.dto.response.MainAdCampaignResponse;
import com.LinkVerse.donation_service.service.MainAdCampaignService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/main-ad-campaigns")
@RequiredArgsConstructor
@Slf4j
public class MainAdCampaignController {
    private final MainAdCampaignService mainAdCampaignService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<MainAdCampaignResponse>> createMainAdCampaign(
            @RequestBody MainAdCampaignRequest request) {
        ApiResponse<MainAdCampaignResponse> response = mainAdCampaignService.createMainAdCampaign(request);
        return ResponseEntity.ok(response);
    }
}
