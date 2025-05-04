package com.LinkVerse.donation_service.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.LinkVerse.donation_service.dto.AdCampaignPublicView;
import com.LinkVerse.donation_service.dto.request.GeminiRequest;
import com.LinkVerse.donation_service.dto.response.AdCampaignResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdTelegramAiHandler {

    private final AdTelegramBroadcaster adTelegramBroadcaster;
    private final GeminiAdCampaignService geminiAiTeleService;
    private final TelegramLinkingService telegramLinkingService;
    private final AdCampaignService adCampaignService;

    private final Map<String, String> lastCreatedCampaignTitleByUser = new java.util.concurrent.ConcurrentHashMap<>();

    public void handleUpdate(Map<String, Object> update) {
        Map<String, Object> message = (Map<String, Object>) update.get("message");
        if (message == null) return;

        String chatId = String.valueOf(((Map<String, Object>) message.get("chat")).get("id"));
        String text = (String) message.get("text");

        if (text == null || text.isBlank()) {
            adTelegramBroadcaster.sendTo(chatId, "❗️Vui lòng nhập nội dung để tôi hỗ trợ bạn.");
            return;
        }

        if (text.equalsIgnoreCase("/start")) {
            telegramLinkingService.link(chatId, message);
            adTelegramBroadcaster.sendTo(
                    chatId,
                    """
					👋 Chào mừng bạn đến với bot quảng cáo LinkVerse!

					Tôi có thể giúp bạn xem, phân tích và hỗ trợ các chiến dịch quảng cáo bài viết của bạn.

					✨ Bạn có thể hỏi tôi như:
					- “Danh sách quảng cáo của tôi?”
					- “Trạng thái chiến dịch ABC?”
					- “Tôi có bao nhiêu chiến dịch đang chạy?”
					- “Tóm tắt giúp tôi thông tin quảng cáo bài viết?”

					🛠 Lệnh hữu ích:
					/help - Hiển thị các lệnh hỗ trợ
					/ads - Danh sách chiến dịch
					/status [ID] - Trạng thái một chiến dịch cụ thể
					/summary [ID] - Tóm tắt thông tin chiến dịch
					/donations [ID] - Số lượt đóng góp
					/report - Xuất báo cáo hiệu quả
					""");
            return;
        }

        if (text.equalsIgnoreCase("/help")) {
            adTelegramBroadcaster.sendTo(
                    chatId,
                    """
					📘 Hướng dẫn sử dụng bot quảng cáo:

					/ads - Hiển thị danh sách quảng cáo hiện tại
					/status [ID] - Kiểm tra trạng thái chiến dịch
					/summary [ID] - Xem tóm tắt thông tin chiến dịch
					/donations [ID] - Số lượt đóng góp
					/report - Xuất báo cáo hiệu suất
					/help - Danh sách lệnh

					Bạn cũng có thể hỏi tự nhiên như:
					- "Chiến dịch abc123 có đang hoạt động không?"
					- "Quảng cáo của tôi còn mấy ngày nữa?"
					- "Tóm tắt thông tin chiến dịch xyz"
					- "Chiến dịch nào hiệu quả nhất?"
					""");
            return;
        }

        if (text.equalsIgnoreCase("/ads")) {
            String userId = telegramLinkingService.resolveUserId(chatId);
            if (userId == null) {
                adTelegramBroadcaster.sendTo(
                        chatId, "⚠️ Bạn chưa liên kết với hệ thống.\n👉 Vui lòng gõ /start để bắt đầu.");
                return;
            }
            List<AdCampaignResponse> ads = adCampaignService.getAdCampaignsByUser(userId);
            if (ads.isEmpty()) {
                String fallback = lastCreatedCampaignTitleByUser.get(userId);
                if (fallback != null) {
                    adTelegramBroadcaster.sendTo(
                            chatId,
                            """
⚠️ Dữ liệu chưa được cập nhật đầy đủ, nhưng tôi ghi nhận chiến dịch mới vừa được tạo là:
📌 %s

Hãy thử lại sau vài giây để tôi có thể phân tích đầy đủ nhé!
"""
                                    .formatted(fallback));
                    return;
                }
            }
            List<AdCampaignPublicView> publicViews =
                    ads.stream().map(AdCampaignPublicView::from).collect(Collectors.toList());
            String context = buildContextFromPublicAds(publicViews);
            adTelegramBroadcaster.sendTo(
                    chatId,
                    context
                            + """

💡 Gợi ý tiếp theo:
- Hỏi trạng thái một chiến dịch cụ thể
- Hỏi thời gian kết thúc
- Hỏi số lượt đóng góp hoặc nội dung bài viết
- Chiến dịch nào hiệu quả nhất?;
- Tổng kết hiệu suất quảng cáo?
- Chiến dịch nào sắp kết thúc?
- Trung bình mỗi chiến dịch kéo dài bao lâu?
""");
            return;
        }

        String userId = telegramLinkingService.resolveUserId(chatId);
        if (userId == null) {
            adTelegramBroadcaster.sendTo(
                    chatId,
                    """
					⚠️ Bạn chưa liên kết với hệ thống.
					👉 Vui lòng gõ /start để bắt đầu.
					""");
            return;
        }

        geminiAiTeleService.handleCampaignQuestion(new GeminiRequest(text, null), chatId);
    }

    private String extractCampaignId(String input) {
        Pattern pattern = Pattern.compile("[a-f0-9\\-]{8,}");
        Matcher matcher = pattern.matcher(input);
        return matcher.find() ? matcher.group() : null;
    }

    private String buildContextFromPublicAds(List<AdCampaignPublicView> ads) {
        if (ads.isEmpty()) return "Người dùng chưa có chiến dịch quảng cáo nào.";

        StringBuilder sb = new StringBuilder("📋 Danh sách chiến dịch quảng cáo:");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (AdCampaignPublicView ad : ads) {
            sb.append("\n\n📝 Tiêu đề: ")
                    .append(ad.getTitle())
                    .append("\n🆔 ID: ")
                    .append(ad.getId())
                    .append("\n📊 Trạng thái: ")
                    .append(ad.getStatus());

            if (ad.getDonationAmount() != null) {
                sb.append("\n💰 Mức đóng góp: ").append(String.format("%,d VND", ad.getDonationAmount()));
            }

            sb.append("\n📄 Bài viết ID: ").append(ad.getPostId()).append("\n——————");
        }

        return sb.toString();
    }

    public void notifyCampaignCreated(String userId, String title) {
        lastCreatedCampaignTitleByUser.put(userId, title);
    }
}
