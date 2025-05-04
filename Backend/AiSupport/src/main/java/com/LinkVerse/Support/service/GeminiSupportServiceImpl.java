package com.LinkVerse.Support.service;

import com.LinkVerse.Support.configuration.VectorStoreProperties;
import com.LinkVerse.Support.model.Answer;
import com.LinkVerse.Support.model.Questionn;
import lombok.RequiredArgsConstructor;
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
public class GeminiSupportServiceImpl implements GeminiServicee {

    private final RestTemplate restTemplate;
    private final VectorStoreProperties vectorStoreProperties;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Override
    public Answer getAnswer(Questionn questionn) {
        // Đọc nội dung từ tài liệu để tạo context
        List<String> contentList = vectorStoreProperties.getDocumentsToLoad().stream()
                .map(this::readFileContent)
                .collect(Collectors.toList());

        String context = contentList.isEmpty() ? "No relevant documents found." : String.join("\n", contentList);

        // ✅ Không gọi static method, thay vào đó gọi `questionn.getQuestion()`
        String prompt = """
                You are an AI assistant providing technical support. Use the following context to answer the question accurately.
                
                ### 📄 Context:
                %s
                
                ### ❓ Question:
                %s
                
                ### 🎯 Answer Format:
                - Trả lời chính xác và ngắn gọn.
                - Nếu không tìm thấy thông tin, trả lời: "Xin lỗi, tôi không có đủ thông tin để hỗ trợ bạn."
                """.formatted(context, questionn.getQuestion());

        // Gửi yêu cầu đến API AI
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of("contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
        )));
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl + "?key=" + apiKey,
                HttpMethod.POST,
                entity,
                Map.class
        );

        return new Answer(formatAnswer(response.getBody()));
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

        return (String) parts.get(0).get("text");
    }

    private String readFileContent(Resource resource) {
        try {
            byte[] fileData = FileCopyUtils.copyToByteArray(resource.getInputStream());
            return new String(fileData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "Error reading file: " + resource.getFilename();
        }
    }

}
