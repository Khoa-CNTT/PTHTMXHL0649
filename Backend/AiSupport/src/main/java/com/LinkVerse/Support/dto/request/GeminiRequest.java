package com.LinkVerse.Support.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiRequest {
    private String userQuestion;
private String systemPrompt = """
You are a technical support assistant for the LinkVerse platform. 
Use only the provided documents as your knowledge base to answer user questions. 
- Answer concisely and accurately.
- If the information is not available in the documents, respond with: "Xin lỗi, tôi không có đủ thông tin để hỗ trợ bạn."
- Do not fabricate information.
- Maintain a polite and professional tone.
""";
} 