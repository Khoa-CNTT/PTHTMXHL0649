package com.LinkVerse.donation_service.service;

import static com.LinkVerse.donation_service.exception.ErrorCode.CAMPAIGN_NOT_FOUND;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.CampaignRequest;
import com.LinkVerse.donation_service.dto.response.CampaignResponse;
import com.LinkVerse.donation_service.entity.Campaign;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.mapper.CampaignMapper;
import com.LinkVerse.donation_service.repository.CampaignRepository;
import com.LinkVerse.donation_service.repository.client.VolunteerAvailabilityClient;
import com.LinkVerse.event.dto.CampaignEvent;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CampaignService {
    private final CampaignRepository campaignRepository;

    @Qualifier("campaignMapper")
    private final CampaignMapper mapper;

    private final S3Service s3Service;
    private final TelegramServiceAdmin telegramServiceAdmin;
    private final VolunteerAvailabilityClient availabilityClient;
    private final KafkaTemplate<String, CampaignEvent> campaignKafkaTemplate;

    public List<CampaignResponse> getAllCampaigns() {
        List<Campaign> campaigns = campaignRepository.findAll().stream()
                .filter(c -> c.getStatus() != Campaign.CampaignStatus.FINISHED)
                .collect(Collectors.toList());

        return campaigns.stream().map(mapper::toCampaignResponse).collect(Collectors.toList());
    }

    @Transactional
    public ApiResponse<CampaignResponse> createCampaign(CampaignRequest request, List<MultipartFile> files) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        List<String> fileUrls = (files != null && files.stream().anyMatch(file -> !file.isEmpty()))
                ? s3Service.uploadFiles(
                        files.stream().filter(file -> !file.isEmpty()).collect(Collectors.toList()))
                : List.of();

        List<String> safeFileUrls = new ArrayList<>();
        for (String fileUrl : fileUrls) {
            String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
            log.info("Checking image safety for file: {}", fileName);
            safeFileUrls.add(fileUrl);
        }
        Campaign campaign = Campaign.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .receiverId(currentUserId)
                .targetAmount(request.getTargetAmount())
                .status(Campaign.CampaignStatus.UNFINISHED)
                .timeSlots(request.getTimeSlots())
                .startDate(Instant.now())
                .imageUrl(safeFileUrls)
                .build();

        // Save the post first to generate the ID
        campaign = campaignRepository.save(campaign);

        CampaignEvent campaignEvent = CampaignEvent.builder()
                .campaignId(campaign.getId())
                .targetAmount(campaign.getTargetAmount())
                .startDate(campaign.getStartDate())
                .endDate(campaign.getEndDate())
                .status(campaign.getStatus())
                .build();

        campaignKafkaTemplate.send("campaign-events", campaignEvent);

        CampaignResponse campaignResponse = mapper.toCampaignResponse(campaign);

        String caption = "📢 Chiến dịch mới được tạo:\n"
                + "📌 Tiêu đề: " + campaign.getTitle() + "\n"
                + "🎯 Mục tiêu: " + campaign.getTargetAmount() + " VND";

        if (!safeFileUrls.isEmpty()) {
            telegramServiceAdmin.sendPhoto(safeFileUrls.get(0), caption);
        } else {
            telegramServiceAdmin.send(caption);
        }

        return ApiResponse.<CampaignResponse>builder()
                .code(200)
                .message("Post created successfully")
                .result(campaignResponse)
                .build();
    }

    public List<CampaignResponse> getRecommendedCampaignsForUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName(); // lấy từ token

        List<String> userAvailability = availabilityClient.getAvailability().getResult();
        log.info("User {} has availability: {}", userId, userAvailability);

        List<Campaign> campaigns = campaignRepository.findAll();

        List<Campaign> matchingCampaigns = campaigns.stream()
                .filter(c ->
                        c.getTimeSlots() != null && c.getTimeSlots().stream().anyMatch(userAvailability::contains))
                .collect(Collectors.toList());

        return matchingCampaigns.stream().map(mapper::toCampaignResponse).toList();
    }

    public Campaign getCampaignById(String id) {
        return campaignRepository.findById(id).orElseThrow(() -> new AppException(CAMPAIGN_NOT_FOUND));
    }

    public String getCampaignReceiverById(String campaignId) {
        Campaign campaign = getCampaignById(campaignId); // dùng lại hàm đã có
        return campaign.getReceiverId();
    }

    public void closeCampaign(String campaignId) {
        Campaign campaign = getCampaignById(campaignId);

        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        if (!campaign.getReceiverId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Define thêm UNAUTHORIZED nếu chưa có
        }

        campaign.setStatus(Campaign.CampaignStatus.FINISHED);
        campaignRepository.save(campaign);

        telegramServiceAdmin.send("❌ Chiến dịch *" + campaign.getTitle() + "* đã được đóng.");
        log.info("Chiến dịch {} đã được đóng bởi user {}", campaignId, currentUserId);
    }

    public double getAverageCompletionTimeInDays(Instant from, Instant to) {
        List<Campaign> finishedCampaigns =
                campaignRepository.findAllByStatusAndStartDateBetween(Campaign.CampaignStatus.FINISHED, from, to);

        if (finishedCampaigns.isEmpty()) {
            return 0.0;
        }

        OptionalDouble averageDurationInSeconds = finishedCampaigns.stream()
                .filter(c -> c.getEndDate() != null && c.getStartDate() != null)
                .mapToLong(
                        c -> Duration.between(c.getStartDate(), c.getEndDate()).getSeconds())
                .average();

        return averageDurationInSeconds.orElse(0.0) / (60 * 60 * 24); // chuyển sang ngày
    }

    public long countDonationsByCampaignId(String campaignId) {
        return campaignRepository.countDonationsByCampaignId(campaignId);
    }

    private String extractFileNameFromUrl(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        return fileName;
    }

    private String decodeUrl(String encodedUrl) {
        return URLDecoder.decode(encodedUrl, StandardCharsets.UTF_8);
    }
}
