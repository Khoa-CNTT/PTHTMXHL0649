package com.LinkVerse.post.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.DetectSentimentRequest;
import software.amazon.awssdk.services.comprehend.model.DetectSentimentResponse;
import software.amazon.awssdk.services.comprehend.model.SentimentType;

@Slf4j
@Service
public class ContentModerationService {

    private final ComprehendClient comprehendClient;

    @Autowired
    public ContentModerationService(ComprehendClient comprehendClient) {
        this.comprehendClient = comprehendClient;
    }

    public boolean isContentAppropriate(String content) {
        try {
            DetectSentimentRequest detectSentimentRequest = DetectSentimentRequest.builder()
                    .text(content)
                    .languageCode("en")
                    .build();
            DetectSentimentResponse detectSentimentResult = comprehendClient.detectSentiment(detectSentimentRequest);

            SentimentType sentiment = detectSentimentResult.sentiment();
            float negativeScore = detectSentimentResult.sentimentScore().negative();

            log.info("Sentiment: {}, Negative Score: {}", sentiment, negativeScore);

            // Chặn nếu tiêu cực vượt ngưỡng
            return !(sentiment == SentimentType.NEGATIVE && negativeScore > 1);
        } catch (Exception e) {
            log.error("Error detecting sentiment: AWS SDK v2 error. Check AWS credentials and connection.", e);
            return false;
        }
    }


}
