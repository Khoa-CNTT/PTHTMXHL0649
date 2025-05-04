package com.LinkVerse.Support.service;

import com.LinkVerse.Support.model.Answer;
import com.LinkVerse.Support.model.Questionn;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ContentSuggestionService {

    private final GeminiSupportServiceImpl geminiSupportService;
    private final LanguageDetectService languageDetectService;


    public List<String> suggestContent(String content) {
        String prompt = """
                Bạn là một trợ lý AI chuyên giúp tối ưu nội dung bài đăng trên mạng xã hội.
                
                - Hãy đưa ra **3 phiên bản cải tiến** của bài đăng bên dưới.
                - Mỗi phiên bản phải có phong cách khác nhau: 
                  1. Ngắn gọn & vui nhộn 🎉
                  2. Chuyên nghiệp & lôi cuốn 💼
                  3. Cảm xúc & truyền cảm hứng ❤️
                - Không giải thích, không kèm tiêu đề như "Gợi ý", chỉ trả về 3 phiên bản.
                
                Nội dung gốc:
                "%s"
                
                Hãy trả lời **chỉ với 3 phiên bản**, phân tách bằng dấu `###`.
                """.formatted(content);

        Answer answer = geminiSupportService.getAnswer(new Questionn(prompt));

        return Arrays.asList(answer.answer().split("###"));
    }


    public String generatePostFromAI(String inputText) {
        String lang = languageDetectService.detectLanguage(inputText);

        String promptVi = """
                Bạn là một AI chuyên viết lại nội dung mạng xã hội bằng tiếng Việt.
                
                Viết lại nội dung sau sao cho:
                - Giữ đúng tinh thần và ý nghĩa gốc
                - Dùng giọng văn tự nhiên, cảm xúc và thu hút hơn
                - Không thêm thông tin ngoài lề
                - Trả về duy nhất phần nội dung bài đăng
                
                Nội dung gốc: "%s"
                """.formatted(inputText);

        String promptEn = """
                You are an AI that rewrites social media posts.
                
                Rewrite the following content:
                - Keep the original meaning
                - Make it sound more natural, emotional, and engaging
                - Do NOT add unrelated content
                - ONLY return the rewritten post text
                
                Original content: "%s"
                """.formatted(inputText);

        String prompt = lang.equalsIgnoreCase("vi") ? promptVi : promptEn;

        Answer answer = geminiSupportService.getAnswer(new Questionn(prompt));
        return extractContentOnly(answer.answer());
    }


    private String extractContentOnly(String raw) {
        int index = raw.indexOf("\n\n");
        if (index != -1 && raw.length() > index + 2) {
            return raw.substring(index + 2).trim();
        }
        return raw.trim();
    }

}

