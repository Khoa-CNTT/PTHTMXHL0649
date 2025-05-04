package com.LinkVerse.post.service;

import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostGroup;
import com.LinkVerse.post.entity.Sentiment;
import com.LinkVerse.post.repository.PostGroupRepository;
import com.LinkVerse.post.repository.PostRepository;
import com.LinkVerse.post.repository.SentimentRepository;
import com.LinkVerse.post.repository.SentimentSpikeDetectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.DetectDominantLanguageRequest;
import software.amazon.awssdk.services.comprehend.model.DetectDominantLanguageResponse;
import software.amazon.awssdk.services.comprehend.model.DetectSentimentRequest;
import software.amazon.awssdk.services.comprehend.model.DetectSentimentResponse;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SentimentAnalysisService {

    private final PostRepository postRepository;
    private final SentimentRepository sentimentRepository;
    private final ComprehendClient comprehendClient;
    private final SentimentSpikeDetectionRepository sentimentSpikeDetectionRepository;
    private final PostGroupRepository postGroupRepository;
    private final PsychologicalSupportService psychologicalSupportService;
//    private final ZoomMeetingService zoomMeetingService;

    private static final Set<String> SUPPORTED_LANGUAGES = new HashSet<>(List.of(
            "en", "es", "fr", "de", "it", "pt", "ar", "hi", "ja", "ko", "zh", "zh-TW"
    ));

    public long countNegativePostsInTimeRange(Instant start, Instant end) {
        Long count = sentimentSpikeDetectionRepository.countNegativePostsInTimeRange(start, end);
        return count != null ? count : 0L;
    }

    public void analyzeAndSaveSentiment(Post post) {
        try {
            String languageCode = detectLanguage(post.getContent());
            log.info("Detected language for post ID {}: {}", post.getId(), languageCode);

            if (!SUPPORTED_LANGUAGES.contains(languageCode)) {
                log.warn("Language '{}' is not supported for sentiment analysis. Skipping post ID {}.",
                        languageCode, post.getId());
                return;
            }

            DetectSentimentRequest detectSentimentRequest = DetectSentimentRequest.builder()
                    .text(post.getContent())
                    .languageCode(languageCode)
                    .build();

            DetectSentimentResponse detectSentimentResponse = comprehendClient.detectSentiment(detectSentimentRequest);

            post.setPrimarySentiment(detectSentimentResponse.sentimentAsString());
            post.setPositiveScore(detectSentimentResponse.sentimentScore().positive());
            post.setNegativeScore(detectSentimentResponse.sentimentScore().negative());
            post.setNeutralScore(detectSentimentResponse.sentimentScore().neutral());
            post.setMixedScore(detectSentimentResponse.sentimentScore().mixed());

            postRepository.save(post);

            Sentiment sentiment = Sentiment.builder()
                    .postId(post.getId())
                    .primarySentiment(detectSentimentResponse.sentimentAsString())
                    .positiveScore(detectSentimentResponse.sentimentScore().positive())
                    .negativeScore(detectSentimentResponse.sentimentScore().negative())
                    .neutralScore(detectSentimentResponse.sentimentScore().neutral())
                    .mixedScore(detectSentimentResponse.sentimentScore().mixed())
                    .build();

            sentimentRepository.save(sentiment);
            log.info("Sentiment analysis completed for post ID {}.", post.getId());

            if ("NEGATIVE".equalsIgnoreCase(detectSentimentResponse.sentimentAsString())) {
                psychologicalSupportService.connectToPsychologist();
//                String joinUrl = zoomMeetingService.createMeeting(post.getUserId(), "Psychological Support", "2025-01-10T10:00:00Z", 30, "Discuss your concerns");
//                log.info("Zoom meeting created for post ID {}. Join URL: {}", post.getId(), joinUrl);

            }
        } catch (Exception e) {
            log.error("Error while analyzing sentiment for post ID {}: ", post.getId(), e);
        }
    }

    public void analyzeAndSaveSentiment(PostGroup post) {
        try {
            String languageCode = detectLanguage(post.getContent());
            log.info("Detected language for post ID {}: {}", post.getId(), languageCode);

            if (!SUPPORTED_LANGUAGES.contains(languageCode)) {
                log.warn("Language '{}' is not supported for sentiment analysis. Skipping post ID {}.",
                        languageCode, post.getId());
                return;
            }

            DetectSentimentRequest detectSentimentRequest = DetectSentimentRequest.builder()
                    .text(post.getContent())
                    .languageCode(languageCode)
                    .build();

            DetectSentimentResponse detectSentimentResponse = comprehendClient.detectSentiment(detectSentimentRequest);

            post.setPrimarySentiment(detectSentimentResponse.sentimentAsString());
            post.setPositiveScore(detectSentimentResponse.sentimentScore().positive());
            post.setNegativeScore(detectSentimentResponse.sentimentScore().negative());
            post.setNeutralScore(detectSentimentResponse.sentimentScore().neutral());
            post.setMixedScore(detectSentimentResponse.sentimentScore().mixed());

            postGroupRepository.save(post);

            Sentiment sentiment = Sentiment.builder()
                    .postId(post.getId())
                    .primarySentiment(detectSentimentResponse.sentimentAsString())
                    .positiveScore(detectSentimentResponse.sentimentScore().positive())
                    .negativeScore(detectSentimentResponse.sentimentScore().negative())
                    .neutralScore(detectSentimentResponse.sentimentScore().neutral())
                    .mixedScore(detectSentimentResponse.sentimentScore().mixed())
                    .build();

            sentimentRepository.save(sentiment);
            log.info("Sentiment analysis completed for post ID {}.", post.getId());

            if ("NEGATIVE".equalsIgnoreCase(detectSentimentResponse.sentimentAsString())) {
                psychologicalSupportService.connectToPsychologist();
//                zoomMeetingService.createMeeting(post.getUserId(), "Psychological Support", "2025-01-10T10:00:00Z", 30, "Discuss your concerns");
            }
        } catch (Exception e) {
            log.error("Error while analyzing sentiment for post ID {}: ", post.getId(), e);
        }
    }

    private String detectLanguage(String content) {
        try {
            DetectDominantLanguageRequest request = DetectDominantLanguageRequest.builder()
                    .text(content)
                    .build();

            DetectDominantLanguageResponse response = comprehendClient.detectDominantLanguage(request);

            if (response.languages().isEmpty()) {
                log.warn("No dominant language detected for content: {}", content);
                return "en";
            }

            return response.languages().get(0).languageCode();
        } catch (Exception e) {
            log.error("Error detecting dominant language for content: ", e);
            return "en";
        }
    }
}