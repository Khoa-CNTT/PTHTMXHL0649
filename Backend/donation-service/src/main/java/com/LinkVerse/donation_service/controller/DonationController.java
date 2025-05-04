package com.LinkVerse.donation_service.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.DonationRequest;
import com.LinkVerse.donation_service.dto.response.DonationResponse;
import com.LinkVerse.donation_service.dto.response.TopCampaignResponse;
import com.LinkVerse.donation_service.service.DonationService;
import com.LinkVerse.donation_service.util.RequestUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/donations")
@RequiredArgsConstructor
@Slf4j
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    public ResponseEntity<ApiResponse<DonationResponse>> donate(
            @RequestBody @Valid DonationRequest request, HttpServletRequest httpServletRequest) {
        String ipAddress = RequestUtil.getClientIp(httpServletRequest);
        request.setIpAddress(ipAddress);

        if (request.getCampaign_id() == null) {
            throw new IllegalArgumentException("Campaign ID must not be null");
        }

        log.info("Donation Request: {}", request);
        DonationResponse response = donationService.donate(request);
        ApiResponse<DonationResponse> apiResponse = ApiResponse.<DonationResponse>builder()
                .code(1000)
                .message("Donation successful")
                .result(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{campaignId}/donations")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> getDonationsForCampaign(
            @PathVariable String campaignId) {
        List<DonationResponse> donations = donationService.getDonationsByCampaign(campaignId);
        return ResponseEntity.ok(ApiResponse.<List<DonationResponse>>builder()
                .code(200)
                .message("Donations fetched successfully")
                .result(donations)
                .build());
    }

    @GetMapping("/topCampaigns")
    public ResponseEntity<ApiResponse<List<TopCampaignResponse>>> getTopCampaigns() {
        List<TopCampaignResponse> result = donationService.getTopCampaigns();
        ApiResponse<List<TopCampaignResponse>> response = ApiResponse.<List<TopCampaignResponse>>builder()
                .code(200)
                .message("Top campaigns fetched successfully")
                .result(result)
                .build();
        return ResponseEntity.ok(response);
    }
}
