package com.LinkVerse.notification.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.LinkVerse.event.dto.BillEmailRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillEmailConsumer {

    private final EmailService emailService;

    @KafkaListener(topics = "bill.email.notifications", groupId = "notification-group")
    public void listen(BillEmailRequest notification) {
        try {
            log.info("📨 Nhận thông báo Kafka gửi hóa đơn cho userId: {}", notification.getUserId());
            emailService.sendBillEmail(notification);
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email hóa đơn từ Kafka listener:", e);
        }
    }
}
