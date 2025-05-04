package com.LinkVerse.Support.service;

import com.LinkVerse.Support.dto.request.GeminiRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiTeleService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String DEFAULT_SYSTEM_PROMPT = """
                Bạn là trợ lý AI dành riêng cho hệ thống LinkVerse — một nền tảng quyên góp.
            
                - Chỉ trả lời các câu hỏi liên quan đến: campaign (chiến dịch), donation (quyên góp), user (người dùng), và thống kê.
                - Nếu câu hỏi nằm ngoài phạm vi hệ thống, hãy từ chối trả lời lịch sự.
                - Không được bịa đặt, không suy đoán nếu không có đủ thông tin.
                - Trả lời ngắn gọn, đúng trọng tâm, bằng tiếng Việt.
                - Nếu câu hỏi chứa mã chiến dịch, chỉ phản hồi theo dữ liệu có hoặc từ chối nếu không rõ.
            
                Ví dụ: Nếu người dùng hỏi về campaign "abc123" nhưng hệ thống không có, hãy trả lời "Tôi không tìm thấy thông tin chiến dịch này."
            """;

    public String askGemini(GeminiRequest request) {
        return callGeminiApi(request.getUserQuestion(),
                request.getSystemPrompt() != null ? request.getSystemPrompt() : DEFAULT_SYSTEM_PROMPT);
    }

    public String extractIntent(GeminiRequest request) {
        String intentPrompt = """
                    Bạn là trợ lý thống kê LinkVerse.
                    Dựa vào câu hỏi từ người dùng, hãy phân tích ý định và trả về JSON theo mẫu:
                    {
                      "intent": "campaign_statistics",
                      "campaignId": "abc123"
                    }
                    Nếu không hiểu ý định, hãy trả về:
                    {
                      "intent": "unknown"
                    }
                """;
        return callGeminiApi(request.getUserQuestion(), intentPrompt);
    }

    private String callGeminiApi(String userText, String systemPrompt) {
        try {
            if (userText == null || userText.isBlank()) {
                log.debug("⚠️ userText rỗng hoặc null khi gọi Gemini API.", userText);
                log.warn("⚠️ userText rỗng hoặc null khi gọi Gemini API.");
                return systemPrompt.contains("intent")
                        ? "{\"intent\": \"unknown\"}"
                        : "{\"message\": \"Không thể xử lý yêu cầu AI lúc này.\"}";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> message = Map.of(
                    "contents", List.of(
                            Map.of("role", "user", "parts", List.of(Map.of("text", systemPrompt))),
                            Map.of("role", "user", "parts", List.of(Map.of("text", userText)))
                    )
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(message, headers);
            String fullUrl = geminiApiUrl + "?key=" + geminiApiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, requestEntity, Map.class);

            Map candidate = (Map) ((List<?>) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidate.get("content");
            List<Map> parts = (List<Map>) content.get("parts");

            return parts.get(0).get("text").toString();

        } catch (Exception e) {
            log.error("❌ Lỗi khi gọi Gemini API", e);
            return systemPrompt.contains("intent")
                    ? "{\"intent\": \"unknown\"}"
                    : "{\"message\": \"Không thể xử lý yêu cầu AI lúc này.\"}";
        }
    }


}

