package com.LinkVerse.donation_service.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.AdDonationRequest;
import com.LinkVerse.donation_service.dto.response.AdDonationResponse;
import com.LinkVerse.donation_service.service.AdDonationService;
import com.LinkVerse.donation_service.util.RequestUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/ad-donations")
@RequiredArgsConstructor
@Slf4j
public class AdDonationController {

    private final AdDonationService adDonationService;

    @PostMapping
    public ResponseEntity<ApiResponse<AdDonationResponse>> donate(
            @RequestBody @Valid AdDonationRequest request, HttpServletRequest httpServletRequest) {
        String ipAddress = RequestUtil.getClientIp(httpServletRequest);
        request.setIpAddress(ipAddress);

        log.info("AdDonation Request: {}", request);
        AdDonationResponse response = adDonationService.donate(request);
        ApiResponse<AdDonationResponse> apiResponse = ApiResponse.<AdDonationResponse>builder()
                .code(1000)
                .message("Donation successful")
                .result(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{adCampaignId}/donations")
    public ResponseEntity<ApiResponse<List<AdDonationResponse>>> getAdDonationsForAdCampaign(
            @PathVariable String adCampaignId) {
        List<AdDonationResponse> adDonations = adDonationService.getAdDonationsByAdCampaign(adCampaignId);
        return ResponseEntity.ok(ApiResponse.<List<AdDonationResponse>>builder()
                .code(200)
                .message("Ad donations fetched successfully")
                .result(adDonations)
                .build());
    }

    @PostMapping("/{adDonationId}/mark-donated")
    public ResponseEntity<ApiResponse<Void>> markDonated(@PathVariable String adDonationId) {
        adDonationService.markDonated(adDonationId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Ad donation marked as successful")
                .build());
    }
}
