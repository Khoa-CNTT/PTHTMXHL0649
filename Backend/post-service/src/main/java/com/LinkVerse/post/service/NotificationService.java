package com.LinkVerse.post.service;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

@Service
public class NotificationService {
    public void sendAlert(String message) {
        // Use Amazon SNS to send alert
        SnsClient snsClient = SnsClient.builder().build();
        snsClient.publish(PublishRequest.builder()
                .topicArn("arn:aws:sns:us-east-2:202533519772:MyTopic")
                .message(message)
                .build());
    }
}