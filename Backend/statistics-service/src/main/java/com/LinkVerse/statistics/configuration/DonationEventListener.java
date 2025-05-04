package com.LinkVerse.statistics.configuration;

import com.LinkVerse.event.dto.DonationEvent;
import com.LinkVerse.statistics.entity.DonationStatics;
import com.LinkVerse.statistics.repository.DonationStatisticRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DonationEventListener {
    private final DonationStatisticRepository donateRepo;

    @KafkaListener(topics = "donation-events", groupId = "statistic-service", containerFactory = "donationKafkaListenerContainerFactory")
    public void listenToDonationEvents(DonationEvent event) {
        log.info("Received donation event: {}", event);

        DonationStatics donateStat = DonationStatics.builder()
                .donationId(event.getDonationId())
                .amount(event.getAmount())
                .status(event.getStatus())
                .paymentTime(LocalDateTime.now())
                .build();

        donateRepo.save(donateStat);
    }
}
