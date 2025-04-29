package com.LinkVerse.profile.configuration;

import java.util.concurrent.ExecutionException;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.errors.TopicExistsException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

@Configuration
public class KafkaTopicConfig {

    private final KafkaAdmin kafkaAdmin;

    public KafkaTopicConfig(KafkaAdmin kafkaAdmin) {
        this.kafkaAdmin = kafkaAdmin;
    }

    @Bean
    public NewTopic createTopic() {
        String topicName = "friendship-requests";
        int partitions = 1;
        short replicationFactor = 1;

        try (AdminClient adminClient = AdminClient.create(kafkaAdmin.getConfigurationProperties())) {
            if (!adminClient.listTopics().names().get().contains(topicName)) {
                return new NewTopic(topicName, partitions, replicationFactor);
            }
        } catch (InterruptedException | ExecutionException e) {
            if (e.getCause() instanceof TopicExistsException) {
                // Topic already exists, no need to create it
            } else {
                throw new RuntimeException("Error while checking/creating topic", e);
            }
        }
        return null; // Topic already exists, return null or handle accordingly
    }
}
