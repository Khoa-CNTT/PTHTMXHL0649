package com.LinkVerse.Support.service;

import com.LinkVerse.Support.dto.request.GeminiRequest;
import com.LinkVerse.Support.model.Answer;
import com.LinkVerse.Support.model.Question;

public interface GeminiService {
    String askGemini(GeminiRequest request);

    String extractIntentJson(GeminiRequest request);

    Answer getAnswer(Question question);
}
