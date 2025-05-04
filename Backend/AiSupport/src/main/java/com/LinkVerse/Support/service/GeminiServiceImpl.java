package com.LinkVerse.Support.service;

import com.LinkVerse.Support.configuration.VectorStoreProperties;
import com.LinkVerse.Support.dto.request.GeminiRequest;
import com.LinkVerse.Support.model.Answer;
import com.LinkVerse.Support.model.Question;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final VectorStoreProperties vectorStoreProperties;

    @Override
    public String askGemini(GeminiRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> message = Map.of(
                    "contents", List.of(
                            Map.of("role", "user", "parts", List.of(Map.of("text", request.getSystemPrompt()))),
                            Map.of("role", "user", "parts", List.of(Map.of("text", request.getUserQuestion())))
                    )
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(message, headers);
            String fullUrl = apiUrl + "?key=" + apiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, requestEntity, Map.class);
            Map candidate = (Map) ((List<?>) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidate.get("content");
            List<Map> parts = (List<Map>) content.get("parts");

            return parts.get(0).get("text").toString();
        } catch (Exception e) {
            log.error("❌ Lỗi gọi Gemini AI", e);
            return "❌ Không thể xử lý yêu cầu AI lúc này.";
        }
    }

    @Override
    public String extractIntentJson(GeminiRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> message = Map.of(
                    "contents", List.of(
                            Map.of("role", "user", "parts", List.of(Map.of("text", request.getSystemPrompt()))),
                            Map.of("role", "user", "parts", List.of(Map.of("text", request.getUserQuestion())))
                    )
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(message, headers);
            String fullUrl = apiUrl + "?key=" + apiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, requestEntity, Map.class);
            Map candidate = (Map) ((List<?>) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidate.get("content");
            List<Map> parts = (List<Map>) content.get("parts");

            return parts.get(0).get("text").toString();
        } catch (Exception e) {
            log.error("❌ Lỗi gọi Gemini AI", e);
            return "{\"intent\":\"unknown\"}";
        }
    }

    @Override
    public Answer getAnswer(Question question) {
        List<String> contentList = vectorStoreProperties.getDocumentsToLoad().stream()
                .map(this::readFileContent)
                .collect(Collectors.toList());

        String context = contentList.isEmpty() ? "No relevant documents found." : String.join("\n", contentList);

        String prompt = """
                You are an AI assistant. Use the following context to answer the question accurately.
                
                ### 📄 Context:
                %s
                
                ### ❓ Question:
                %s
                
                ### 🎯 Answer Format:
                - Trả lời dưới dạng danh sách nếu cần.
                - Dùng Markdown để hiển thị đẹp hơn.
                - Nếu không tìm thấy thông tin, trả lời: "Xin lỗi, tôi không có đủ thông tin để trả lời câu hỏi này."
                """.formatted(context, question.question());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of("contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
        ));
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl + "?key=" + apiKey,
                HttpMethod.POST,
                entity,
                Map.class
        );

        return new Answer(formatAnswer(response.getBody()));
    }

    private String readFileContent(Resource resource) {
        try {
            byte[] fileData = FileCopyUtils.copyToByteArray(resource.getInputStream());
            return new String(fileData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "Error reading file: " + resource.getFilename();
        }
    }

    private String formatAnswer(Map<String, Object> responseBody) {
        if (responseBody == null || !responseBody.containsKey("candidates")) {
            return "Không có phản hồi từ AI.";
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
        if (candidates.isEmpty()) return "Không có câu trả lời.";

        Map<String, Object> firstCandidate = candidates.get(0);
        if (!firstCandidate.containsKey("content")) return "Không có nội dung trong phản hồi.";

        Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
        if (!content.containsKey("parts")) return "Không có phần nội dung.";

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts.isEmpty() || !parts.get(0).containsKey("text")) return "Không có văn bản trả lời.";

        String answer = (String) parts.get(0).get("text");

        return "### 🎯 Trả lời:\n\n" + answer.replace("\n", "\n- ");
    }
}
