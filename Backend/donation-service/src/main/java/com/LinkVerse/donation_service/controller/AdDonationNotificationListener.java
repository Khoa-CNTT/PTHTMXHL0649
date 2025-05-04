package com.LinkVerse.donation_service.controller;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.LinkVerse.donation_service.dto.AdDonationNotification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdDonationNotificationListener {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "ad-donation.notifications", groupId = "ad-notification-group")
    public void listen(AdDonationNotification notification) {
        log.info("Kafka ad donation notification: {}", notification);

        messagingTemplate.convertAndSendToUser(notification.getReceiverId(), "/queue/ad-donations", notification);
    }
}
