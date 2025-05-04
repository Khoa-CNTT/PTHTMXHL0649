package com.LinkVerse.donation_service.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.AdCampaignRequest;
import com.LinkVerse.donation_service.dto.response.AdCampaignResponse;
import com.LinkVerse.donation_service.entity.AdCampaign;
import com.LinkVerse.donation_service.entity.MainAdCampaign;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.mapper.AdCampaignMapper;
import com.LinkVerse.donation_service.repository.AdCampaignRepository;
import com.LinkVerse.donation_service.repository.MainAdCampaignRepository;
import com.LinkVerse.donation_service.repository.client.IdentityServiceClient;
import com.LinkVerse.donation_service.repository.client.PostClient;
import com.LinkVerse.event.dto.AdCampaignEvent;
import com.LinkVerse.identity.dto.response.UserInfoResponse;
import com.LinkVerse.post.dto.response.PostResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdCampaignService {
    private final AdCampaignRepository adCampaignRepository;
    private final MainAdCampaignRepository mainAdCampaignRepository;
    private final PostClient postClient;
    private final AdCampaignMapper mapper;
    private final S3Service s3Service;
    private final IdentityServiceClient identityServiceClient;
    private final KafkaTemplate<String, AdCampaignEvent> adCampaignKafkaTemplate;
    private final TelegramServiceAdmin telegramServiceAdmin;
    private final AdTelegramBroadcaster adTelegramBroadcaster;

    public List<AdCampaignResponse> getAdCampaignsByUser(String userId) {
        List<AdCampaign> campaigns = adCampaignRepository.findAllByUserId(userId);
        return campaigns.stream().map(mapper::toAdCampaignResponse).collect(Collectors.toList());
    }

    @Transactional
    public ApiResponse<AdCampaignResponse> createAdCampaign(AdCampaignRequest request, List<MultipartFile> files) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        MainAdCampaign mainAdCampaign = mainAdCampaignRepository
                .findById(request.getMainAdCampaignId())
                .orElseThrow(() -> new AppException(ErrorCode.MAIN_AD_CAMPAIGN_NOT_FOUND));

        try {
            com.LinkVerse.post.dto.ApiResponse<PostResponse> postResponse = postClient.getPostById(request.getPostId());
            if (postResponse.getResult() == null) {
                throw new AppException(ErrorCode.POST_NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error fetching post with ID {}: {}", request.getPostId(), e.getMessage());
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }

        List<String> imageUrls = (files != null && !files.isEmpty())
                ? s3Service.uploadFiles(
                        files.stream().filter(file -> !file.isEmpty()).collect(Collectors.toList()))
                : List.of();

        AdCampaign adCampaign = AdCampaign.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .userId(currentUserId)
                .postId(request.getPostId())
                .mainAdCampaign(mainAdCampaign)
                .status(AdCampaign.AdCampaignStatus.PENDING)
                .startDate(Instant.now())
                .imageUrls(imageUrls)
                .build();

        adCampaign = adCampaignRepository.save(adCampaign);

        AdCampaignEvent event = AdCampaignEvent.builder()
                .adCampaignId(adCampaign.getId())
                .postId(adCampaign.getPostId())
                .status(adCampaign.getStatus())
                .build();
        adCampaignKafkaTemplate.send("ad-campaign-events", event);

        try {
            UserInfoResponse userInfo = identityServiceClient.getUserInfo(currentUserId);
            String username = userInfo.getUsername();
            String caption = "📢 Người dùng " + username + " vừa tạo chiến dịch mới:\n"
                    + "📌 Tiêu đề: " + adCampaign.getTitle() + "\n"
                    + "📝 Bài viết ID: " + adCampaign.getPostId() + "\n"
                    + "💰 Mục tiêu: " + mainAdCampaign.getTargetAmount() + " VND";
            adTelegramBroadcaster.send(caption);
        } catch (Exception e) {
            log.warn("⚠️ Không thể lấy thông tin user {} để gửi thông báo Telegram", currentUserId);
        }

        return ApiResponse.<AdCampaignResponse>builder()
                .code(200)
                .message("Ad campaign created successfully")
                .result(mapper.toAdCampaignResponse(adCampaign))
                .build();
    }

    public List<AdCampaignResponse> getAllAdCampaigns() {
        return adCampaignRepository.findAll().stream()
                .filter(c -> c.getStatus() != AdCampaign.AdCampaignStatus.FINISHED)
                .map(mapper::toAdCampaignResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void closeAdCampaign(String adCampaignId) {
        AdCampaign adCampaign = adCampaignRepository
                .findById(adCampaignId)
                .orElseThrow(() -> new AppException(ErrorCode.ADCAMPAIGN_NOT_FOUND));

        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        if (!adCampaign.getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Only the campaign creator can close the campaign");
        }

        adCampaign.setStatus(AdCampaign.AdCampaignStatus.FINISHED);
        adCampaignRepository.save(adCampaign);

        log.info("❌ Quảng cáo '{}' của user {} đã được đóng.", adCampaign.getTitle(), currentUserId);
    }

    public AdCampaign getAdCampaignById(String id) {
        return adCampaignRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ADCAMPAIGN_NOT_FOUND));
    }

    public long countAdDonationsByAdCampaignId(String adCampaignId) {
        AdCampaign adCampaign = adCampaignRepository
                .findById(adCampaignId)
                .orElseThrow(() -> new AppException(ErrorCode.ADCAMPAIGN_NOT_FOUND));
        return adCampaign.getDonation() != null ? 1 : 0;
    }

    public double getAverageCompletionTimeInDays(Instant startDate, Instant endDate) {
        List<AdCampaign> campaigns = adCampaignRepository.findAll().stream()
                .filter(c -> c.getStatus() == AdCampaign.AdCampaignStatus.ACTIVE
                        || c.getStatus() == AdCampaign.AdCampaignStatus.FINISHED)
                .filter(c -> c.getStartDate() != null && c.getEndDate() != null)
                .filter(c ->
                        !c.getStartDate().isBefore(startDate) && !c.getEndDate().isAfter(endDate))
                .collect(Collectors.toList());

        if (campaigns.isEmpty()) {
            return 0.0;
        }

        double totalDays = campaigns.stream()
                .mapToLong(c -> ChronoUnit.DAYS.between(c.getStartDate(), c.getEndDate()))
                .sum();

        return totalDays / campaigns.size();
    }

    public String getAdCampaignUserById(String adCampaignId) {
        AdCampaign adCampaign = adCampaignRepository
                .findById(adCampaignId)
                .orElseThrow(() -> new AppException(ErrorCode.ADCAMPAIGN_NOT_FOUND));
        return adCampaign.getUserId();
    }

    public List<AdCampaignResponse> getRecommendedAdCampaignsForUser() {
        return adCampaignRepository.findAll().stream()
                .filter(c -> c.getStatus() == AdCampaign.AdCampaignStatus.PENDING)
                .map(mapper::toAdCampaignResponse)
                .limit(5)
                .collect(Collectors.toList());
    }
}
