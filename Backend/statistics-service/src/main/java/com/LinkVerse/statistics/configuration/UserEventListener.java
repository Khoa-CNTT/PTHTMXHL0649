package com.LinkVerse.statistics.configuration;

import com.LinkVerse.event.dto.UserEvent;
import com.LinkVerse.statistics.entity.Gender;
import com.LinkVerse.statistics.entity.UserStatics;
import com.LinkVerse.statistics.entity.UserStatus;
import com.LinkVerse.statistics.repository.UserStatisticRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventListener {

    private final UserStatisticRepository userStatRepository;

    @KafkaListener(topics = "user-events", groupId = "statistic-service", containerFactory = "kafkaListenerContainerFactory")
    public void listenToUserEvents(UserEvent userEvent) {
        log.info("Received user event: {}", userEvent);

        UserStatics userStatistic = UserStatics.builder()
                .userId(userEvent.getId())
                .gender(Gender.valueOf(userEvent.getGender().toUpperCase()))
                .status(UserStatus.valueOf(userEvent.getStatus().toUpperCase()))
                .city(userEvent.getCity())
                .createdAt(userEvent.getCreatedAt())
                .build();

        userStatRepository.save(userStatistic);
    }

}