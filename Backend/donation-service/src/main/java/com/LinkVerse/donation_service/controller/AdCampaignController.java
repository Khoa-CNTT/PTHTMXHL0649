package com.LinkVerse.donation_service.controller;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.AdCampaignRequest;
import com.LinkVerse.donation_service.dto.response.AdCampaignResponse;
import com.LinkVerse.donation_service.entity.AdCampaign;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.mapper.AdCampaignMapper;
import com.LinkVerse.donation_service.repository.AdCampaignRepository;
import com.LinkVerse.donation_service.service.AdCampaignService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/ad-campaigns")
@RequiredArgsConstructor
@Slf4j
public class AdCampaignController {

    private final AdCampaignService adCampaignService;
    private final AdCampaignMapper adCampaignMapper;
    private final AdCampaignRepository adCampaignRepository;

    @PostMapping(
            value = "/create",
            consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<AdCampaignResponse>> createAdCampaign(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files)
            throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        AdCampaignRequest request = objectMapper.readValue(requestJson, AdCampaignRequest.class);

        ApiResponse<AdCampaignResponse> response = adCampaignService.createAdCampaign(request, files);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdCampaignResponse>> getAdCampaignById(@PathVariable String id) {
        AdCampaign adCampaign = adCampaignService.getAdCampaignById(id);
        AdCampaignResponse adCampaignResponse = adCampaignMapper.toAdCampaignResponse(adCampaign);
        ApiResponse<AdCampaignResponse> response = ApiResponse.<AdCampaignResponse>builder()
                .code(200)
                .message("Ad campaign fetched successfully")
                .result(adCampaignResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/close/{adCampaignId}")
    public ResponseEntity<ApiResponse<Void>> closeAdCampaign(@PathVariable String adCampaignId) {
        adCampaignService.closeAdCampaign(adCampaignId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Chiến dịch quảng cáo đã được đóng thành công")
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdCampaignResponse>>> getAllAdCampaigns() {
        List<AdCampaignResponse> adCampaigns = adCampaignService.getAllAdCampaigns();
        ApiResponse<List<AdCampaignResponse>> response = ApiResponse.<List<AdCampaignResponse>>builder()
                .code(200)
                .message("Ad campaigns fetched successfully")
                .result(adCampaigns)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{adCampaignId}/status")
    public ApiResponse<String> getAdCampaignStatus(@PathVariable String adCampaignId) {
        AdCampaign adCampaign = adCampaignRepository
                .findById(adCampaignId)
                .orElseThrow(() -> new AppException(ErrorCode.ADCAMPAIGN_NOT_FOUND));
        return ApiResponse.<String>builder()
                .code(200)
                .message("Ad campaign status fetched successfully")
                .result(adCampaign.getStatus().name())
                .build();
    }

    @GetMapping("/average-completion-time")
    public ResponseEntity<Double> getAverageCompletionTimeInDays(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        double averageDays = adCampaignService.getAverageCompletionTimeInDays(startDate, endDate);
        return ResponseEntity.ok(averageDays);
    }

    @GetMapping("/{adCampaignId}/donation-count")
    public ResponseEntity<Long> getAdDonationCountByAdCampaignId(@PathVariable String adCampaignId) {
        long count = adCampaignService.countAdDonationsByAdCampaignId(adCampaignId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{adCampaignId}/user")
    public ResponseEntity<ApiResponse<String>> getAdCampaignUser(@PathVariable String adCampaignId) {
        String userId = adCampaignService.getAdCampaignUserById(adCampaignId);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .code(200)
                .message("User ID fetched successfully")
                .result(userId)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<AdCampaignResponse>> getRecommendedAdCampaignsForUser() {
        List<AdCampaignResponse> recommendedCampaigns = adCampaignService.getRecommendedAdCampaignsForUser();
        return ResponseEntity.ok(recommendedCampaigns);
    }
}
