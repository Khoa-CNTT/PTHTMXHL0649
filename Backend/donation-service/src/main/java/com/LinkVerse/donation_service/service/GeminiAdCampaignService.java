package com.LinkVerse.donation_service.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.LinkVerse.donation_service.dto.request.GeminiRequest;
import com.LinkVerse.donation_service.dto.response.AdCampaignResponse;
import com.LinkVerse.donation_service.entity.AdCampaign;
import com.LinkVerse.donation_service.exception.AppException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAdCampaignService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final AdCampaignService adCampaignService;
    private final AdTelegramBroadcaster adTelegramBroadcaster;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String CAMPAIGN_PROMPT =
            """
			Bạn là trợ lý AI chuyên phân tích và phản hồi các câu hỏi liên quan đến chiến dịch quảng cáo bài viết trên nền tảng LinkVerse.

			🎯 Vai trò:
			- Hiểu và phản hồi các câu hỏi của người dùng về trạng thái, hiệu suất, thời gian, mục tiêu,... của chiến dịch quảng cáo.
			- Ưu tiên dựa vào dữ liệu hệ thống nếu có mã chiến dịch (UUID).
			- Trả lời bằng tiếng Việt, rõ ràng, ngắn gọn, phù hợp trên giao diện Telegram.

			📌 Định dạng phản hồi:
			- Nếu hỏi trạng thái: chỉ trả lời trạng thái hiện tại.
			- Nếu hỏi hiệu suất: mô tả ngắn hiệu quả (VD: "Đã đạt 80% mục tiêu")
			- Nếu không tìm thấy: "Không tìm thấy chiến dịch với mã ... 😔"
			""";

    public void handleCampaignQuestion(GeminiRequest request, String chatId) {
        try {
            String userText = request.getUserQuestion();
            String campaignId = extractCampaignId(userText);

            if (campaignId == null) {
                adTelegramBroadcaster.sendTo(
                        chatId,
                        "⚠️ Không tìm thấy mã chiến dịch nào trong câu hỏi của bạn. Vui lòng cung cấp mã hợp lệ.");
                return;
            }

            AdCampaignResponse campaign = null;
            try {
                AdCampaign adCampaign = adCampaignService.getAdCampaignById(campaignId);
                campaign = adCampaignService.getAdCampaignsByUser(adCampaign.getUserId()).stream()
                        .filter(c -> c.getId().equals(campaignId))
                        .findFirst()
                        .orElse(null);
            } catch (AppException e) {
                adTelegramBroadcaster.sendTo(chatId, "❌ Không tìm thấy chiến dịch với mã: " + campaignId);
                return;
            }

            if (campaign == null) {
                adTelegramBroadcaster.sendTo(chatId, "❌ Không thể truy xuất thông tin chiến dịch.");
                return;
            }

            String context = buildContextFromCampaign(campaign);
            String enrichedPrompt = CAMPAIGN_PROMPT + "\nThông tin chiến dịch:\n" + context;
            String reply = callGeminiApi(userText, enrichedPrompt);

            adTelegramBroadcaster.sendTo(chatId, reply);

        } catch (Exception e) {
            log.error("❌ Lỗi xử lý chiến dịch quảng cáo AI:", e);
            adTelegramBroadcaster.sendTo(chatId, "⚠️ Có lỗi xảy ra khi xử lý. Vui lòng thử lại sau.");
        }
    }

    private String buildContextFromCampaign(AdCampaignResponse ad) {
        Instant endDate = ad.getStartDate() != null ? ad.getStartDate().plus(1, ChronoUnit.DAYS) : null;

        return String.format(
                """
		📝 Tiêu đề: %s
		🆔 ID: %s
		📊 Trạng thái: %s
		📅 Ngày bắt đầu: %s
		📅 Ngày kết thúc dự kiến: %s
		💰 Đã quyên góp: %,d VND
		📄 Bài viết ID: %s
		""",
                ad.getTitle(),
                ad.getId(),
                ad.getStatus(),
                ad.getStartDate() != null
                        ? DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                                .withZone(ZoneId.systemDefault())
                                .format(ad.getStartDate())
                        : "Chưa xác định",
                endDate != null
                        ? DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                                .withZone(ZoneId.systemDefault())
                                .format(endDate)
                        : "Chưa xác định",
                ad.getDonationAmount() != null ? ad.getDonationAmount() : 0,
                ad.getPostId());
    }

    private String extractCampaignId(String input) {
        Pattern pattern = Pattern.compile("[a-f0-9\\-]{8,}");
        Matcher matcher = pattern.matcher(input);
        return matcher.find() ? matcher.group() : null;
    }

    private String callGeminiApi(String userText, String systemPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String combinedPrompt = systemPrompt + "\n\nNgười dùng hỏi: " + userText;

            Map<String, Object> message = Map.of(
                    "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", combinedPrompt)))));

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(message, headers);
            String fullUrl = geminiApiUrl + "?key=" + geminiApiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, requestEntity, Map.class);
            Map candidate = (Map) ((List<?>) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidate.get("content");
            List<Map> parts = (List<Map>) content.get("parts");

            return parts.get(0).get("text").toString();

        } catch (Exception e) {
            log.error("❌ Lỗi khi gọi Gemini API", e);
            return "Không thể xử lý yêu cầu AI lúc này. Vui lòng thử lại sau 😔";
        }
    }
}
