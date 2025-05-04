package com.LinkVerse.post.service;

import com.LinkVerse.post.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoryCleanupService {
    private final StoryRepository storyRepository;

    @Transactional
    @Scheduled(fixedRate = 3600000)
    public void deleteExpiredStories() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thresholdTime = now.minusHours(24);
        storyRepository.deleteByPostedAtBefore(thresholdTime);
        log.info("Stories older than 24 hours deleted successfully at {}", now);
    }
}
