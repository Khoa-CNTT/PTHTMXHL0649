package com.LinkVerse.donation_service.configuration;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {
    @Bean
    public NewTopic donationNotificationTopic() {
        return new NewTopic("donation.notifications", 1, (short) 1);
    }
}
