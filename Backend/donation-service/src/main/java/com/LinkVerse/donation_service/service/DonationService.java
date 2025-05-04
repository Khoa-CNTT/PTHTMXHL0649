package com.LinkVerse.donation_service.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.LinkVerse.donation_service.dto.DonationNotification;
import com.LinkVerse.donation_service.dto.request.DonationRequest;
import com.LinkVerse.donation_service.dto.request.InitPaymentRequest;
import com.LinkVerse.donation_service.dto.response.DonationResponse;
import com.LinkVerse.donation_service.dto.response.InitPaymentResponse;
import com.LinkVerse.donation_service.dto.response.TopCampaignResponse;
import com.LinkVerse.donation_service.entity.Campaign;
import com.LinkVerse.donation_service.entity.Donation;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.mapper.DonationMapper;
import com.LinkVerse.donation_service.repository.CampaignRepository;
import com.LinkVerse.donation_service.repository.DonationRepository;
import com.LinkVerse.donation_service.repository.client.NotificationClient;
import com.LinkVerse.donation_service.service.payment.VNPayService;
import com.LinkVerse.event.dto.BillEmailRequest;
import com.LinkVerse.event.dto.DonationEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonationService {

    private final VNPayService vnPayService;
    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final DonationMapper mapper;
    private final TelegramServiceAdmin telegramServiceAdmin;
    private final NotificationClient notificationFeignClient;
    private final KafkaTemplate<String, DonationNotification> kafkaTemplate;
    private final KafkaTemplate<String, BillEmailRequest> billEmailKafkaTemplate;
    private final KafkaTemplate<String, DonationEvent> donationKafkaTemplate;

    @Transactional
    public DonationResponse donate(DonationRequest request) {
        try {
            log.info(
                    "Received donation request: campaignId={}, amount={}",
                    request.getCampaign_id(),
                    request.getAmount());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserId = authentication.getName();

            if (request.getCampaign_id() == null) {
                throw new IllegalArgumentException("Campaign ID must not be null");
            }

            Campaign campaign = campaignRepository
                    .findById(request.getCampaign_id())
                    .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));

            Donation donation = Donation.builder()
                    .donorId(currentUserId)
                    .receiverId(campaign.getReceiverId())
                    .campaign(campaign)
                    .amount(request.getAmount())
                    .status(Donation.DonationStatus.PAYMENT_PROCESSING)
                    .paymentTime(LocalDateTime.now())
                    .build();

            donation = donationRepository.save(donation);

            InitPaymentRequest paymentRequest = InitPaymentRequest.builder()
                    .userId(currentUserId)
                    .amount(request.getAmount())
                    .txnRef(donation.getId())
                    .ipAddress(request.getIpAddress())
                    .build();

            InitPaymentResponse initPaymentResponse = vnPayService.init(paymentRequest);
            log.info("Init payment response: {}", initPaymentResponse);

            DonationResponse donationResponse = mapper.toDonationResponse(donation);
            donationResponse.setPayment(initPaymentResponse);

            return donationResponse;
        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý donate: ", e);
            telegramServiceAdmin.send("❌ Lỗi khi xử lý donate:\n" + "🧍‍♂️ User: "
                    + SecurityContextHolder.getContext().getAuthentication().getName() + "\n" + "📛 Message: "
                    + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void markDonated(String donationId) {
        Donation donation = donationRepository
                .findById(donationId)
                .orElseThrow(() -> new AppException(ErrorCode.DONATION_NOT_FOUND));

        if (donation.getStatus() == Donation.DonationStatus.SUCCESS) {
            telegramServiceAdmin.send("Đã nhận được donation:  " + "\n👾 Người dùng: "
                    + donation.getDonorId() + "\n💵 Số tiền là: "
                    + donation.getAmount() + " VND. " + "\n📢 Chiến dịch: "
                    + donation.getCampaign().getTitle());
            return;
        }

        donation.setStatus(Donation.DonationStatus.SUCCESS);
        donation.setPaymentTime(LocalDateTime.now());

        Campaign campaign = donation.getCampaign();
        campaign.setCurrentAmount(campaign.getCurrentAmount() + donation.getAmount());
        campaignRepository.save(campaign);
        donationRepository.save(donation);

        DonationEvent donationEvent = DonationEvent.builder()
                .donationId(donation.getId())
                .amount(donation.getAmount())
                .status(donation.getStatus())
                .build();

        donationKafkaTemplate.send("donation-events", donationEvent);

        if (campaign.getCurrentAmount() >= campaign.getTargetAmount()) {
            telegramServiceAdmin.send("🎉 Chiến dịch \"" + campaign.getTitle() + "\" đã đạt mục tiêu quyên góp!\n"
                    + "🎯 Số tiền hiện tại: " + campaign.getCurrentAmount() + " VND");
        }

        DonationNotification notification = DonationNotification.builder()
                .receiverId(campaign.getReceiverId())
                .message("Bạn vừa nhận được donation từ người dùng " + donation.getDonorId())
                .time(LocalDateTime.now())
                .build();
        kafkaTemplate.send("donation.notifications", notification);

        try {
            String currentUserId = donation.getDonorId();
            if (currentUserId == null) {
                log.error("❌ donorId null trong donationId: {}", donationId);
                throw new AppException(ErrorCode.INVALID_DONATION);
            }

            log.info(
                    "🔍 DonorId: {}, CampaignTitle: {}, Amount: {}, PaymentTime: {}",
                    currentUserId,
                    campaign.getTitle(),
                    donation.getAmount(),
                    donation.getPaymentTime());

            BillEmailRequest emailNotification = BillEmailRequest.builder()
                    .userId(currentUserId)
                    .campaignTitle(campaign.getTitle())
                    .amount(donation.getAmount())
                    .donorName(currentUserId)
                    .time(donation.getPaymentTime())
                    .build();

            log.info("📤 Gửi BillEmailNotification: {}", emailNotification);
            billEmailKafkaTemplate.send("bill.email.notifications", emailNotification);
        } catch (Exception e) {
            log.error("❌ Lỗi khi cập nhật trạng thái donation: {}", donationId, e);
            telegramServiceAdmin.send("❌ Giao dịch lỗi khi cập nhật trạng thái donation:\n" + "🔍 Mã: "
                    + donationId + "\n" + "📛 Message: "
                    + e.getMessage());
            throw e;
        }
    }

    public List<DonationResponse> getDonationsByCampaign(String campaignId) {
        List<Donation> donations = donationRepository.findByCampaignId(campaignId);
        return donations.stream().map(mapper::toDonationResponse).toList();
    }

    public String getStatistics() {
        long totalCount = donationRepository.count();
        Long totalAmount = donationRepository.sumAllAmount();
        return String.format(
                "📊 Tổng số giao dịch: %d\n💰 Tổng số tiền: %,d VND",
                totalCount, totalAmount != null ? totalAmount : 0);
    }

    public String getDonationInfo(String donationId) {
        return donationRepository
                .findById(donationId)
                .map(donation -> {
                    String paymentTime = donation.getPaymentTime() != null
                            ? donation.getPaymentTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy - HH:mm"))
                            : "Không rõ";

                    return String.format(
                            """
							🧾 Mã giao dịch: %s
							💸 Số tiền: %,d VND
							🕒 Thời gian: %s
							🧍‍♂️ Người gửi: %s
							🎯 Chiến dịch: %s (ID: %s)
							🔄 Trạng thái: %s
							""",
                            donation.getId(),
                            donation.getAmount(),
                            paymentTime,
                            donation.getDonorId(),
                            donation.getCampaign().getTitle(),
                            donation.getCampaign().getId(),
                            donation.getStatus());
                })
                .orElse("❌ Không tìm thấy giao dịch với mã: " + donationId);
    }

    public String getCampaignStatistics(String campaignId) {
        Campaign campaign = campaignRepository
                .findById(campaignId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));

        long count = donationRepository.countByCampaignId(campaignId);
        Long total = donationRepository.sumAmountByCampaignId(campaignId);

        return String.format(
                """
				📊 Thống kê chiến dịch:
				🆔 ID: %s
				📌 Tên: %s
				ℹ️ Mô tả: %s
				🎯 Mục tiêu: %,d VND
				💰 Đã nhận: %,d VND
				🔄 Trạng thái: %s
				📦 Số giao dịch: %d
				💵 Tổng số tiền quyên góp: %,d VND
				""",
                campaign.getId(),
                campaign.getTitle(),
                campaign.getDescription(),
                campaign.getTargetAmount(),
                campaign.getCurrentAmount(),
                campaign.getStatus(),
                count,
                total != null ? total : 0);
    }

    public List<TopCampaignResponse> getTopCampaigns() {
        List<Object[]> rawList = donationRepository.findTopCampaigns();
        return rawList.stream()
                .map(row -> {
                    TopCampaignResponse dto = new TopCampaignResponse();
                    dto.setId((String) row[0]);
                    dto.setTitle((String) row[1]);
                    dto.setAmount((Long) row[2]);
                    dto.setCount((Long) row[3]);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public File exportDonationsByCampaign(String campaignId) {
        List<Donation> donations = donationRepository.findByCampaignId(campaignId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Donations");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Mã giao dịch");
            header.createCell(1).setCellValue("Người gửi");
            header.createCell(2).setCellValue("Số tiền");
            header.createCell(3).setCellValue("Thời gian");

            int rowIdx = 1;
            for (Donation d : donations) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(d.getId());
                row.createCell(1).setCellValue(d.getDonorId());
                row.createCell(2).setCellValue(d.getAmount());
                row.createCell(3)
                        .setCellValue(
                                d.getPaymentTime() != null ? d.getPaymentTime().toString() : "N/A");
            }

            File file = File.createTempFile("donations_", ".xlsx");
            try (FileOutputStream out = new FileOutputStream(file)) {
                workbook.write(out);
            }

            return file;
        } catch (IOException e) {
            throw new RuntimeException("❌ Lỗi khi tạo file Excel", e);
        }
    }

    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklyReportToTelegram() {
        String stats = generateWeeklyStats();
        telegramServiceAdmin.send("📊 Báo cáo tuần:\n" + stats);
    }

    public String generateWeeklyStats() {
        LocalDateTime startOfWeek = LocalDateTime.now()
                .with(java.time.DayOfWeek.MONDAY)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        long count = donationRepository.countThisWeek(startOfWeek);
        Long amount = donationRepository.sumThisWeek(startOfWeek);
        List<Object[]> top = donationRepository.topCampaignsThisWeek(startOfWeek);

        StringBuilder sb = new StringBuilder();
        sb.append("🔢 Giao dịch tuần: ").append(count).append("\n");
        sb.append("💰 Tổng tiền: ")
                .append(String.format("%,d VND", amount != null ? amount : 0))
                .append("\n");

        if (!top.isEmpty()) {
            sb.append("🏆 Top chiến dịch:\n");
            for (int i = 0; i < Math.min(3, top.size()); i++) {
                Object[] row = top.get(i);
                String title = (String) row[1];
                Long total = (Long) row[2];
                sb.append(String.format(" %d️⃣ %s - %,d VND\n", i + 1, title, total));
            }
        }

        return sb.toString();
    }

    public String analyzeCampaignProgress(String campaignId) {
        Campaign campaign = campaignRepository
                .findById(campaignId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));

        long total = donationRepository.sumAmountByCampaignId(campaignId);
        long target = campaign.getTargetAmount();
        double percent = (double) total / target * 100;

        long days = ChronoUnit.DAYS.between(campaign.getStartDate(), Instant.now());
        long perDay = days > 0 ? total / days : total;
        long estimatedDaysLeft = perDay > 0 ? (target - total) / perDay : -1;

        return String.format(
                """
				📈 Phân tích chiến dịch:
				📌 Tên: %s
				✅ Tiến độ: %.2f%%
				⏳ Ước tính còn %d ngày để đạt mục tiêu.
				""",
                campaign.getTitle(), percent, estimatedDaysLeft);
    }

    public Campaign getCampaignById(String campaignId) {
        return campaignRepository.findById(campaignId).orElse(null);
    }

    public Donation getDonationById(String id) {
        return donationRepository.findById(id).orElse(null);
    }
}
