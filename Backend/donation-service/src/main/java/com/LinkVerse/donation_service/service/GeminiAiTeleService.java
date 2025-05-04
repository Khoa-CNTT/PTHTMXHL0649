package com.LinkVerse.donation_service.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.LinkVerse.donation_service.dto.request.GeminiRequest;
import com.LinkVerse.donation_service.entity.Donation;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiTeleService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final CampaignService campaignService;
    private final DonationService donationService;
    private final TelegramServiceAdmin telegramServiceAdmin;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String NATURAL_PROMPT =
            """
					Bạn là trợ lý AI thông minh cho nền tảng quyên góp LinkVerse, hoạt động trên Telegram.

					🎯 Vai trò:
					- Hỗ trợ người dùng tìm kiếm thông tin về chiến dịch, giao dịch, thống kê, hoặc người dùng.
					- Hiểu và trả lời các câu hỏi dù người dùng hỏi ngắn gọn, mơ hồ hoặc không cung cấp đầy đủ chi tiết.
					- Trả lời theo định dạng phù hợp với Telegram (ngắn gọn, sử dụng emoji hoặc định dạng in đậm *nếu cần*).

					✅ Cách trả lời:
					- Trả lời bằng tiếng Việt, tự nhiên, thân thiện, ngắn gọn và đúng trọng tâm.
					- Nếu câu hỏi có mã chiến dịch/giao dịch, trả lời dựa trên dữ liệu có sẵn từ hệ thống.
					- Nếu người dùng hỏi về số tiền giao dịch, chỉ trả lời số tiền (ví dụ: "10,000 VND 💰").
					- Nếu người dùng hỏi về trạng thái giao dịch, chỉ trả lời trạng thái (ví dụ: "Thành công ✅" hoặc "Đang xử lý ⏳").
					- Nếu người dùng hỏi về tổng số giao dịch trên hệ thống, chỉ trả lời số lượng giao dịch (ví dụ: "12,345 giao dịch 📦").
					- Nếu câu hỏi mơ hồ, cố gắng đoán ý định và đưa ra câu trả lời hợp lý nhất.
					- Nếu không tìm thấy thông tin, trả lời lịch sự: "Tôi không tìm thấy thông tin... 😔" hoặc "Vui lòng cung cấp thêm chi tiết 📝."
					- Nếu câu hỏi ngoài phạm vi, từ chối nhẹ nhàng: "Xin lỗi, tôi không thể hỗ trợ với câu hỏi này 😔."

					📌 Lưu ý:
					- Không bịa đặt thông tin.
					- Dựa trên dữ liệu hệ thống khi trả lời về thống kê, phân tích hoặc chi tiết cụ thể.
					- Ưu tiên trả lời ngắn gọn, dễ đọc trên Telegram.
			""";

    private static final String INTENT_PROMPT =
            """
					Bạn là trợ lý phân tích ý định của hệ thống LinkVerse.

					Dựa vào câu hỏi từ người dùng, xác định ý định và trả về JSON đúng định dạng:

					1. Nếu người dùng muốn thống kê một chiến dịch:
					{
						"intent": "campaign_statistics",
						"campaignId": "abc123"
					}

					2. Nếu người dùng muốn phân tích tiến độ chiến dịch:
					{
						"intent": "campaign_analyze",
						"campaignId": "abc123"
					}

					3. Nếu người dùng muốn xem chi tiết một giao dịch:
					{
						"intent": "donation_detail",
						"donationId": "abc123"
					}

					4. Nếu người dùng hỏi về trạng thái giao dịch:
					{
						"intent": "donation_status",
						"donationId": "abc123"
					}

					5. Nếu người dùng hỏi về số tiền của một giao dịch:
					{
						"intent": "donation_amount",
						"donationId": "abc123"
					}

					6. Nếu người dùng hỏi về tổng số giao dịch trên hệ thống:
					{
						"intent": "system_statistics"
					}

					7. Nếu không rõ ý định hoặc thiếu ID:
					{
						"intent": "unknown"
					}

					❗ Lưu ý:
					- Tìm ID trong câu hỏi (có thể là UUID hoặc chuỗi bất kỳ).
					- Nếu không tìm thấy ID nhưng ý định rõ ràng, trả về intent với campaignId/donationId là rỗng.
					- Chỉ trả về JSON, không thêm nội dung khác.
			""";

    public void processUserQuestion(GeminiRequest request, String chatId) {
        String userQuestion = request.getUserQuestion();
        if (userQuestion == null || userQuestion.trim().isEmpty()) {
            telegramServiceAdmin.sendTo(chatId, "Vui lòng cung cấp câu hỏi cụ thể hơn để tôi hỗ trợ bạn! 📝");
            return;
        }

        if (userQuestion.length() < 10 && !userQuestion.matches(".*[0-9a-fA-F-]{36}.*")) {
            telegramServiceAdmin.sendTo(
                    chatId,
                    "Câu hỏi của bạn hơi ngắn! Vui lòng cung cấp thêm chi tiết, ví dụ: mã chiến dịch, giao dịch hoặc nội dung bạn muốn biết. 📝");
            return;
        }

        String intentJson = extractIntent(request);
        try {
            Map<String, String> intentMap = objectMapper.readValue(intentJson, Map.class);
            String intent = intentMap.get("intent");
            String id = intentMap.getOrDefault("campaignId", intentMap.get("donationId"));

            String dataResponse =
                    switch (intent) {
                        case "campaign_statistics" -> id.isEmpty() ? null : donationService.getCampaignStatistics(id);
                        case "campaign_analyze" -> id.isEmpty() ? null : donationService.analyzeCampaignProgress(id);
                        case "donation_detail" -> id.isEmpty() ? null : donationService.getDonationInfo(id);
                        case "donation_status" -> {
                            if (id.isEmpty()) yield null;
                            Donation donation = donationService.getDonationById(id);
                            if (donation == null) {
                                telegramServiceAdmin.sendTo(chatId, "❌ Không tìm thấy giao dịch với mã: " + id);
                                yield null;
                            }
                            yield String.format(
                                    """
							Thông tin giao dịch từ hệ thống:
							- Trạng thái: %s
							""",
                                    donation.getStatus());
                        }
                        case "donation_amount" -> {
                            if (id.isEmpty()) yield null;
                            Donation donation = donationService.getDonationById(id);
                            if (donation == null) {
                                telegramServiceAdmin.sendTo(chatId, "❌ Không tìm thấy giao dịch với mã: " + id);
                                yield null;
                            }
                            yield String.format(
                                    """
							Số tiền của giao dịch từ hệ thống:
							- Số tiền: %,d VND
							""",
                                    donation.getAmount());
                        }
                        case "system_statistics" -> donationService.getStatistics();
                        default -> null; // Nếu ý định không xác định, để AI tự xử lý
                    };

            if (dataResponse != null) {
                // Nếu có dữ liệu, thêm vào prompt để AI trả lời dựa trên dữ liệu
                String enrichedPrompt = NATURAL_PROMPT + "\nDữ liệu từ hệ thống:\n" + dataResponse;
                String response = callGeminiApi(userQuestion, enrichedPrompt);
                telegramServiceAdmin.sendTo(chatId, response);
            } else if (intent.equals("unknown")) {
                // Nếu ý định không xác định, để AI tự trả lời
                String response = callGeminiApi(userQuestion, NATURAL_PROMPT);
                telegramServiceAdmin.sendTo(chatId, response);
            } else {
                // Nếu thiếu ID nhưng ý định rõ ràng
                telegramServiceAdmin.sendTo(
                        chatId, "Vui lòng cung cấp mã chiến dịch hoặc giao dịch để tôi có thể hỗ trợ bạn! 📝");
            }
        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý câu hỏi: {}", userQuestion, e);
            telegramServiceAdmin.sendTo(chatId, "⚠️ Không thể xử lý câu hỏi lúc này. Vui lòng thử lại sau. 😔");
        }
    }

    public String askGemini(GeminiRequest request) {
        String systemPrompt = request.getSystemPrompt() != null ? request.getSystemPrompt() : NATURAL_PROMPT;
        return callGeminiApi(request.getUserQuestion(), systemPrompt);
    }

    public String extractIntent(GeminiRequest request) {
        return callGeminiApi(request.getUserQuestion(), INTENT_PROMPT);
    }

    /**
     * Gọi Gemini API để lấy câu trả lời
     */
    private String callGeminiApi(String userText, String systemPrompt) {
        try {
            if (userText == null || userText.isBlank()) {
                log.warn("⚠️ userText rỗng hoặc null khi gọi Gemini API.");
                return systemPrompt.contains("intent")
                        ? "{\"intent\": \"unknown\"}"
                        : "Không thể xử lý yêu cầu AI lúc này. 😔";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Kết hợp systemPrompt và userText vào một tin nhắn user
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
            String errorMessage = e.getMessage();
            if (errorMessage.contains("400") && errorMessage.contains("Content with system role is not supported")) {
                return "Lỗi: Gemini API không hỗ trợ vai trò system. Vui lòng kiểm tra lại cấu hình API. 😔";
            }
            return "Không thể xử lý yêu cầu AI lúc này: " + e.getMessage() + " 😔";
        }
    }
}
