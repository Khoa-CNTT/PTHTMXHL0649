package com.LinkVerse.donation_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.LinkVerse.donation_service.dto.AdDonationNotification;
import com.LinkVerse.donation_service.dto.request.AdDonationRequest;
import com.LinkVerse.donation_service.dto.request.InitPaymentRequest;
import com.LinkVerse.donation_service.dto.response.AdDonationResponse;
import com.LinkVerse.donation_service.dto.response.InitPaymentResponse;
import com.LinkVerse.donation_service.entity.AdCampaign;
import com.LinkVerse.donation_service.entity.AdDonation;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.mapper.AdDonationMapper;
import com.LinkVerse.donation_service.repository.AdCampaignRepository;
import com.LinkVerse.donation_service.repository.AdDonationRepository;
import com.LinkVerse.donation_service.repository.client.PostClient;
import com.LinkVerse.donation_service.service.payment.VNPayService;
import com.LinkVerse.event.dto.AdCampaignEvent;
import com.LinkVerse.event.dto.AdDonationEvent;
import com.LinkVerse.post.dto.response.PostResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdDonationService {
    private final AdDonationRepository adDonationRepository;
    private final AdCampaignRepository adCampaignRepository;
    private final PostClient postClient;
    private final AdDonationMapper mapper;
    private final TelegramServiceAdmin telegramServiceAdmin;
    private final VNPayService vnPayService;
    private final KafkaTemplate<String, AdDonationEvent> adDonationKafkaTemplate;
    private final KafkaTemplate<String, AdCampaignEvent> adCampaignKafkaTemplate;
    private final KafkaTemplate<String, AdDonationNotification> adDonationNotificationKafkaTemplate;
    private final TelegramLinkingService telegramLinkingService;
    private final AdTelegramBroadcaster adTelegramBroadcaster;

    @Transactional
    public AdDonationResponse donate(AdDonationRequest request) {
        try {
            log.info(
                    "Received ad donation request: adCampaignId={}, amount={}",
                    request.getAdCampaignId(),
                    request.getAmount());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserId = authentication.getName();

            AdCampaign adCampaign = adCampaignRepository
                    .findById(request.getAdCampaignId())
                    .orElseThrow(() -> new AppException(ErrorCode.ADCAMPAIGN_NOT_FOUND));

            if (!adCampaign.getUserId().equals(currentUserId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED, "Only the campaign creator can donate");
            }

            if (adCampaign.getDonation() != null) {
                throw new AppException(ErrorCode.DUPLICATE_DONATION, "Campaign already has a donation");
            }

            long targetAmount = adCampaign.getMainAdCampaign().getTargetAmount();
            if (request.getAmount() != targetAmount) {
                throw new AppException(
                        ErrorCode.INVALID_DONATION_AMOUNT,
                        String.format("Donation amount must be exactly %d VND", targetAmount));
            }

            AdDonation adDonation = AdDonation.builder()
                    .donorId(currentUserId)
                    .adminId(adCampaign.getMainAdCampaign().getAdminId())
                    .amount(request.getAmount())
                    .adCampaign(adCampaign)
                    .status(AdDonation.AdDonationStatus.PAYMENT_PROCESSING)
                    .paymentTime(LocalDateTime.now())
                    .build();

            adDonation = adDonationRepository.save(adDonation);

            InitPaymentRequest paymentRequest = InitPaymentRequest.builder()
                    .userId(currentUserId)
                    .amount(request.getAmount())
                    .txnRef(adDonation.getId())
                    .ipAddress(request.getIpAddress())
                    .isAdDonation(true)
                    .build();

            InitPaymentResponse initPaymentResponse = vnPayService.init(paymentRequest);
            log.info("Init payment response: {}", initPaymentResponse);

            AdDonationResponse adDonationResponse = mapper.toAdDonationResponse(adDonation);
            adDonationResponse.setPayment(initPaymentResponse);

            return adDonationResponse;
        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý ad donation: ", e);
            telegramServiceAdmin.send("❌ Lỗi khi xử lý ad donation:\n" + "🧍‍♂️ User: "
                    + SecurityContextHolder.getContext().getAuthentication().getName() + "\n" + "📛 Message: "
                    + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void markDonated(String adDonationId) {
        AdDonation adDonation = adDonationRepository
                .findById(adDonationId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDONATION_NOT_FOUND));

        if (adDonation.getStatus() == AdDonation.AdDonationStatus.SUCCESS) {
            telegramServiceAdmin.send("Đã nhận được ad donation:  " + "\n👾 Người dùng: "
                    + adDonation.getDonorId() + "\n💵 Số tiền là: "
                    + adDonation.getAmount() + " VND. " + "\n📢 Chiến dịch: "
                    + adDonation.getAdCampaign().getTitle());
            return;
        }

        adDonation.setStatus(AdDonation.AdDonationStatus.SUCCESS);
        adDonation.setPaymentTime(LocalDateTime.now());

        AdCampaign adCampaign = adDonation.getAdCampaign();
        adCampaign.setStatus(AdCampaign.AdCampaignStatus.ACTIVE);
        adCampaignRepository.save(adCampaign);
        adDonationRepository.save(adDonation);

        String postContent = "Unknown";
        try {
            com.LinkVerse.post.dto.ApiResponse<PostResponse> postResponse =
                    postClient.getPostById(adCampaign.getPostId());
            PostResponse post = postResponse.getResult();
            postContent = post.getContent() != null ? post.getContent() : "No content available";
        } catch (Exception e) {
            log.error("Error fetching post with ID {}: {}", adCampaign.getPostId(), e.getMessage());
        }

        adTelegramBroadcaster.send("🎉 Chiến dịch quảng cáo \"" + adCampaign.getTitle() + "\" đã được kích hoạt!\n"
                + "📝 Bài viết \"" + postContent + "\" đang được quảng cáo.");

        try {
            String userId = adCampaign.getUserId();
            String chatId = telegramLinkingService.resolveChatId(userId);
            if (chatId != null) {
                String msg = "🚀 Chiến dịch *" + adCampaign.getTitle() + "* của bạn đã chính thức hoạt động!\n"
                        + "📌 Bài viết ID: " + adCampaign.getPostId() + "\n"
                        + "💰 Tổng tài trợ: " + adDonation.getAmount() + " VND\n"
                        + "🟢 Trạng thái: ĐANG CHẠY";
                adTelegramBroadcaster.sendTo(chatId, msg);

                // Gửi cho admin nếu có liên kết
                String adminChatId = telegramLinkingService.resolveChatId(adDonation.getAdminId());
                if (adminChatId != null) {
                    String adminMsg = "👨‍💼 Quản trị viên thân mến,\nChiến dịch \"" + adCampaign.getTitle()
                            + "\" đã nhận đủ tài trợ và bắt đầu hoạt động.\n"
                            + "📌 Bài viết: " + adCampaign.getPostId() + "\n"
                            + "💸 Số tiền: " + adDonation.getAmount() + " VND\n"
                            + "⏰ Bắt đầu lúc: " + adCampaign.getStartDate();
                    telegramServiceAdmin.sendTo(adminChatId, adminMsg);
                }
            }
        } catch (Exception ex) {
            log.warn("⚠️ Không thể gửi thông báo bot ads sau khi kích hoạt chiến dịch: {}", ex.getMessage());
        }

        AdCampaignEvent event = AdCampaignEvent.builder()
                .adCampaignId(adCampaign.getId())
                .postId(adCampaign.getPostId())
                .status(adCampaign.getStatus())
                .build();
        adCampaignKafkaTemplate.send("ad-campaign-events", event);

        AdDonationEvent donationEvent = AdDonationEvent.builder()
                .adDonationId(adDonation.getId())
                .amount(adDonation.getAmount())
                .status(adDonation.getStatus())
                .build();
        adDonationKafkaTemplate.send("ad-donation-events", donationEvent);

        AdDonationNotification notification = AdDonationNotification.builder()
                .receiverId(adCampaign.getMainAdCampaign().getAdminId())
                .message("Bạn vừa nhận được ad donation từ người dùng " + adDonation.getDonorId())
                .time(LocalDateTime.now())
                .build();
        adDonationNotificationKafkaTemplate.send("ad-donation.notifications", notification);
    }

    public List<AdDonationResponse> getAdDonationsByAdCampaign(String adCampaignId) {
        AdCampaign adCampaign = adCampaignRepository
                .findById(adCampaignId)
                .orElseThrow(() -> new AppException(ErrorCode.ADCAMPAIGN_NOT_FOUND));
        return adCampaign.getDonation() != null
                ? List.of(mapper.toAdDonationResponse(adCampaign.getDonation()))
                : List.of();
    }
}
