package com.LinkVerse.post.service;

import com.LinkVerse.post.repository.SentimentSpikeDetectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class SentimentSpikeDetectionService {
    private final SentimentSpikeDetectionRepository sentimentSpikeDetectionRepository;
    private final NotificationService notificationService;

    //Thong bao khi phat hien bai viet tieu cuc tang dot ngot
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void detectNegativeSentimentSpikes() {
        Instant now = Instant.now();
        Instant oneHourAgo = now.minus(1, ChronoUnit.HOURS);

        long negativePosts = sentimentSpikeDetectionRepository.countNegativePostsInTimeRange(oneHourAgo, now);
        long totalPosts = sentimentSpikeDetectionRepository.countTotalPostsInTimeRange(oneHourAgo, now);

        if (totalPosts > 0) {
            double negativeRatio = (double) negativePosts / totalPosts;
            if (negativeRatio > 0.5) {
                notificationService.sendAlert("High negative sentiment detected!");
            }
        }
    }
}