package com.LinkVerse.identity.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.LinkVerse.identity.entity.User;
import com.LinkVerse.identity.repository.UserRepository;
import com.LinkVerse.identity.repository.httpclient.ProfileClient;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserCleanupTask {
    UserRepository userRepository;
    ProfileClient profileClient;

    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteMarkedUsers() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<User> users = userRepository.findUserByDeletedAtBefore(thirtyDaysAgo);
        for (User user : users) {
            profileClient.deleteUserProfile(user.getId()); // xoá profile
        }

        userRepository.deleteAllByDeletedAtBefore(thirtyDaysAgo);
        log.info("Deleted users marked for deletion before {}", thirtyDaysAgo);
    }
}
