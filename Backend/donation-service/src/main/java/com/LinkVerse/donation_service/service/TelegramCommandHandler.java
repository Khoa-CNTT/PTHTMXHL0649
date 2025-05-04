package com.LinkVerse.donation_service.service;

import java.io.File;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.LinkVerse.donation_service.dto.request.GeminiRequest;
import com.LinkVerse.donation_service.entity.Donation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramCommandHandler {

    private final TelegramServiceAdmin telegramServiceAdmin;
    private final DonationService donationService;
    private final GeminiAiTeleService geminiAiTeleService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void handleUpdate(Map<String, Object> update) {
        Map<String, Object> message = (Map<String, Object>) update.get("message");
        if (message == null) {
            log.warn("No message found in Telegram update: {}", update);
            return;
        }

        String chatId = String.valueOf(((Map<String, Object>) message.get("chat")).get("id"));
        String text = (String) message.get("text");
        if (text == null || text.isBlank()) {
            log.warn("No text found in Telegram message: {}", message);
            telegramServiceAdmin.sendTo(chatId, "Vui lòng gửi một tin nhắn để tôi có thể hỗ trợ bạn! 📝");
            return;
        }

        try {
            if (text.equalsIgnoreCase("/start")) {
                telegramServiceAdmin.sendTo(
                        chatId,
                        """
						👋 *Xin chào!* Tôi là bot hỗ trợ của LinkVerse.
						Tôi có thể giúp bạn xem thông tin chiến dịch, giao dịch, hoặc thống kê quyên góp.

						📜 *Danh sách lệnh hỗ trợ:*
						/stats - Xem thống kê tổng giao dịch 💰
						/donation [mã] - Xem chi tiết giao dịch 🧾
						/campaign [mã] - Thống kê chiến dịch và xuất file Excel 📊
						/analyze [mã] - Phân tích tiến độ chiến dịch 📈
						/help - Hiển thị danh sách lệnh ℹ️

						Bạn cũng có thể hỏi tự do, ví dụ: "Thống kê chiến dịch abc123".
						""");
                return;
            }

            if (text.equalsIgnoreCase("/help")) {
                telegramServiceAdmin.sendTo(
                        chatId,
                        """
						📜 *Danh sách lệnh hỗ trợ:*
						/stats - Xem thống kê tổng giao dịch 💰
						/donation [mã] - Xem chi tiết giao dịch 🧾
						/campaign [mã] - Thống kê chiến dịch và xuất file Excel 📊
						/analyze [mã] - Phân tích tiến độ chiến dịch 📈
						/help - Hiển thị danh sách lệnh ℹ️

						Ngoài ra, bạn có thể hỏi tự do, ví dụ: "Thống kê chiến dịch abc123" hoặc "Chi tiết giao dịch xyz789".
						""");
                return;
            }

            if (text.equalsIgnoreCase("/stats")) {
                String result = donationService.getStatistics();
                telegramServiceAdmin.sendTo(chatId, "📊 *Thống kê tổng quan:*\n" + result);
                return;
            }

            if (text.startsWith("/donation")) {
                String[] parts = text.trim().split("\\s+");
                if (parts.length < 2) {
                    telegramServiceAdmin.sendTo(chatId, "⚠️ Vui lòng nhập mã giao dịch. Ví dụ: /donation abc123");
                    return;
                }
                String donationId = extractId(parts[1]);
                String result = donationService.getDonationInfo(donationId);
                telegramServiceAdmin.sendTo(chatId, result);
                return;
            }

            if (text.startsWith("/campaign")) {
                String[] parts = text.trim().split("\\s+");
                if (parts.length < 2) {
                    telegramServiceAdmin.sendTo(chatId, "⚠️ Vui lòng nhập mã chiến dịch. Ví dụ: /campaign abc123");
                    return;
                }
                String campaignId = extractId(parts[1]);
                String stat = donationService.getCampaignStatistics(campaignId);
                telegramServiceAdmin.sendTo(chatId, stat);
                File file = donationService.exportDonationsByCampaign(campaignId);
                telegramServiceAdmin.sendDocument(chatId, file, "📄 *Danh sách giao dịch của chiến dịch này:*");
                file.delete();
                return;
            }

            if (text.startsWith("/analyze")) {
                String[] parts = text.trim().split("\\s+");
                if (parts.length < 2) {
                    telegramServiceAdmin.sendTo(chatId, "⚠️ Vui lòng nhập mã chiến dịch. Ví dụ: /analyze abc123");
                    return;
                }
                String campaignId = extractId(parts[1]);
                String result = donationService.analyzeCampaignProgress(campaignId);
                telegramServiceAdmin.sendTo(chatId, result);
                return;
            }

            // Handle free-form questions using AI
            GeminiRequest intentRequest = new GeminiRequest(text, null);
            String intentJson = geminiAiTeleService.extractIntent(intentRequest);

            if (!intentJson.trim().startsWith("{")) {
                fallbackToFreeStyleAI(chatId, text);
                return;
            }

            JsonNode root = objectMapper.readTree(intentJson);
            String intent = root.path("intent").asText();

            switch (intent) {
                case "campaign_statistics" -> {
                    String campaignId = extractId(root.path("campaignId").asText());
                    if (campaignId == null) {
                        fallbackToFreeStyleAI(chatId, text);
                        return;
                    }

                    String stat = donationService.getCampaignStatistics(campaignId);
                    if (stat.contains("Không tìm thấy")) {
                        telegramServiceAdmin.sendTo(chatId, "⚠️ Không tìm thấy chiến dịch với mã này. 😔");
                        return;
                    }

                    GeminiRequest req = new GeminiRequest(
                            text,
                            stat + "\n\n👉 Hãy trả lời câu hỏi người dùng một cách ngắn gọn, rõ ràng, và tự nhiên.");

                    String reply = geminiAiTeleService.askGemini(req);
                    telegramServiceAdmin.sendTo(chatId, reply);
                }

                case "campaign_analyze" -> {
                    String campaignId = extractId(root.path("campaignId").asText());
                    if (campaignId == null) {
                        fallbackToFreeStyleAI(chatId, text);
                        return;
                    }
                    String result = donationService.analyzeCampaignProgress(campaignId);
                    telegramServiceAdmin.sendTo(chatId, result);
                }

                case "donation_detail" -> {
                    String donationId = extractId(root.path("donationId").asText());
                    if (donationId == null) {
                        fallbackToFreeStyleAI(chatId, text);
                        return;
                    }

                    String donationInfo = donationService.getDonationInfo(donationId);
                    if (donationInfo.contains("Không tìm thấy")) {
                        telegramServiceAdmin.sendTo(chatId, donationInfo);
                        return;
                    }

                    GeminiRequest req = new GeminiRequest(
                            text,
                            donationInfo
                                    + "\n\n👉 Hãy trả lời câu hỏi người dùng một cách rõ ràng và tự nhiên dựa trên thông tin trên.");

                    String reply = geminiAiTeleService.askGemini(req);
                    telegramServiceAdmin.sendTo(chatId, reply);
                }

                case "donation_status" -> {
                    String donationId = extractId(root.path("donationId").asText());
                    if (donationId == null) {
                        fallbackToFreeStyleAI(chatId, text);
                        return;
                    }

                    Donation donation = donationService.getDonationById(donationId);
                    if (donation == null) {
                        telegramServiceAdmin.sendTo(chatId, "❌ Không tìm thấy giao dịch với mã: " + donationId + " 😔");
                        return;
                    }

                    String context = String.format(
                            """
							Thông tin giao dịch từ hệ thống:
							- Trạng thái: %s
							""",
                            donation.getStatus());

                    GeminiRequest req = new GeminiRequest(
                            text,
                            context
                                    + "\n\n👉 Hãy trả lời câu hỏi người dùng một cách rõ ràng và tự nhiên, chỉ tập trung vào trạng thái giao dịch.");

                    String reply = geminiAiTeleService.askGemini(req);
                    telegramServiceAdmin.sendTo(chatId, reply);
                }

                case "donation_amount" -> {
                    String donationId = extractId(root.path("donationId").asText());
                    if (donationId == null) {
                        fallbackToFreeStyleAI(chatId, text);
                        return;
                    }

                    Donation donation = donationService.getDonationById(donationId);
                    if (donation == null) {
                        telegramServiceAdmin.sendTo(chatId, "❌ Không tìm thấy giao dịch với mã: " + donationId + " 😔");
                        return;
                    }

                    String context = String.format(
                            """
							Số tiền của giao dịch từ hệ thống:
							- Số tiền: %,d VND
							""",
                            donation.getAmount());

                    GeminiRequest req = new GeminiRequest(
                            text,
                            context
                                    + "\n\n👉 Hãy trả lời câu hỏi người dùng một cách rõ ràng và tự nhiên, chỉ tập trung vào số tiền giao dịch.");

                    String reply = geminiAiTeleService.askGemini(req);
                    telegramServiceAdmin.sendTo(chatId, reply);
                }

                case "system_statistics" -> {
                    String stats = donationService.getStatistics();
                    String totalTransactions = stats.split("\n")[0]
                            .replace("📊 Tổng số giao dịch: ", "")
                            .trim();
                    telegramServiceAdmin.sendTo(chatId, totalTransactions + " 📦");
                }

                case "unknown", "" -> fallbackToFreeStyleAI(chatId, text);

                default -> telegramServiceAdmin.sendTo(chatId, "⚠️ Ý định không được hỗ trợ. 😔");
            }

        } catch (Exception e) {
            log.error("❌ Lỗi xử lý AI", e);
            telegramServiceAdmin.sendTo(chatId, "⚠️ Có lỗi xảy ra. Vui lòng thử lại sau. 😔");
        }
    }

    private void fallbackToFreeStyleAI(String chatId, String userInput) {
        try {
            GeminiRequest request = new GeminiRequest(userInput, null);
            String reply = geminiAiTeleService.askGemini(request);
            telegramServiceAdmin.sendTo(chatId, reply);
        } catch (Exception e) {
            log.error("❌ Lỗi fallback AI", e);
            telegramServiceAdmin.sendTo(chatId, "⚠️ AI không thể trả lời lúc này. Vui lòng thử lại sau. 😔");
        }
    }

    private String extractId(String text) {
        Pattern pattern = Pattern.compile("([a-f0-9\\-]{36})");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1) : text;
    }
}
