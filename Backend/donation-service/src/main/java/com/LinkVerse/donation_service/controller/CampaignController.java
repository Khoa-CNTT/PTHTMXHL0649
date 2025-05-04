package com.LinkVerse.donation_service.controller;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.CampaignRequest;
import com.LinkVerse.donation_service.dto.response.CampaignResponse;
import com.LinkVerse.donation_service.entity.Campaign;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.mapper.CampaignMapper;
import com.LinkVerse.donation_service.repository.CampaignRepository;
import com.LinkVerse.donation_service.service.CampaignService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/campaigns")
@RequiredArgsConstructor
@Slf4j
public class CampaignController {

    private final CampaignService campaignService;
    private final CampaignMapper campaignMapper;
    private final CampaignRepository campaignRepository;

    @PostMapping(value = "/create")
    public ResponseEntity<ApiResponse<CampaignResponse>> createPostWithImage(
            @RequestPart("request") String requestJson, @RequestPart("files") List<MultipartFile> files)
            throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        CampaignRequest request = objectMapper.readValue(requestJson, CampaignRequest.class);

        ApiResponse<CampaignResponse> response = campaignService.createCampaign(request, files);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignResponse>> getCampaignById(@PathVariable String id) {
        Campaign campaign = campaignService.getCampaignById(id);
        CampaignResponse campaignResponse = campaignMapper.toCampaignResponse(campaign);
        ApiResponse<CampaignResponse> response = new ApiResponse<>(campaignResponse);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/close/{campaignId}")
    public ResponseEntity<ApiResponse<Void>> closeCampaign(@PathVariable String campaignId) {
        campaignService.closeCampaign(campaignId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Chiến dịch đã được đóng thành công")
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> getAllCampaigns() {
        List<CampaignResponse> campaigns = campaignService.getAllCampaigns();
        ApiResponse<List<CampaignResponse>> response = ApiResponse.<List<CampaignResponse>>builder()
                .code(200)
                .message("Campaigns fetched successfully")
                .result(campaigns)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/average-completion-time")
    public double getAverageCompletionTimeInDays(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        return campaignService.getAverageCompletionTimeInDays(startDate, endDate);
    }

    @GetMapping("/{campaignId}/donation-count")
    public ResponseEntity<Long> getDonationCountByCampaignId(@PathVariable String campaignId) {
        long count = campaignService.countDonationsByCampaignId(campaignId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{campaignId}/receiver")
    public ResponseEntity<ApiResponse<String>> getCampaignReceiver(@PathVariable String campaignId) {
        String receiverId = campaignService.getCampaignReceiverById(campaignId);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .code(200)
                .message("Receiver ID fetched successfully")
                .result(receiverId)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<CampaignResponse>> getRecommendedCampaignsForUser() {
        List<CampaignResponse> recommendedCampaigns = campaignService.getRecommendedCampaignsForUser();
        return ResponseEntity.ok(recommendedCampaigns);
    }

    @GetMapping("/{campaignId}/status")
    public ApiResponse<String> getCampaignStatus(@PathVariable String campaignId) {
        Campaign campaign = campaignRepository
                .findById(campaignId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));
        return ApiResponse.<String>builder()
                .code(200)
                .message("Campaign status fetched successfully")
                .result(campaign.getStatus().name()) // Trả về trạng thái của chiến dịch
                .build();
    }
}
