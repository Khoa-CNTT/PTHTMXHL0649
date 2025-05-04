//
// package com.LinkVerse.notification.service;
//
// import com.LinkVerse.event.dto.NotificationEvent;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.kafka.annotation.KafkaListener;
// import org.springframework.messaging.simp.SimpMessagingTemplate;
// import org.springframework.stereotype.Service;
//
// @Service
// @Slf4j
// public class KafkaConsumerService {
//
//    private final SimpMessagingTemplate messagingTemplate;
//
//    public KafkaConsumerService(SimpMessagingTemplate messagingTemplate) {
//        this.messagingTemplate = messagingTemplate;
//    }
//
//    @KafkaListener(
//            topics = "post-like-event",
//            groupId = "group_id",
//            containerFactory = "notificationKafkaListenerContainerFactory")
//    public void consumePostLikeEvent(NotificationEvent notificationEvent) {
//        if (notificationEvent == null) {
//            log.error("Nhận được NotificationEvent null cho post-like-event");
//            return;
//        }
//        log.info("Nhận được sự kiện thông báo thích bài viết: channel={}, recipient={}, subject={}",
//                notificationEvent.getChannel(), notificationEvent.getRecipient(), notificationEvent.getSubject());
//
//        if (notificationEvent.getRecipient() == null) {
//            log.error("Recipient null trong NotificationEvent cho post-like-event");
//            return;
//        }
//
//        messagingTemplate.convertAndSendToUser(
//                notificationEvent.getRecipient(),
//                "/queue/like-notifications",
//                notificationEvent);
//        log.info("Đã gửi thông báo thích bài viết qua WebSocket đến người dùng {}", notificationEvent.getRecipient());
//    }
//
//    @KafkaListener(
//            topics = "post-unlike-event",
//            groupId = "group_id",
//            containerFactory = "notificationKafkaListenerContainerFactory")
//    public void consumePostUnlikeEvent(NotificationEvent notificationEvent) {
//        if (notificationEvent == null) {
//            log.error("Nhận được NotificationEvent null cho post-unlike-event");
//            return;
//        }
//        log.info("Nhận được sự kiện thông báo hủy thích bài viết: channel={}, recipient={}, subject={}",
//                notificationEvent.getChannel(), notificationEvent.getRecipient(), notificationEvent.getSubject());
//
//        if (notificationEvent.getRecipient() == null) {
//            log.error("Recipient null trong NotificationEvent cho post-unlike-event");
//            return;
//        }
//
//        messagingTemplate.convertAndSendToUser(
//                notificationEvent.getRecipient(),
//                "/queue/unlike-notifications",
//                notificationEvent);
//        log.info("Đã gửi thông báo hủy thích bài viết qua WebSocket đến người dùng {}",
// notificationEvent.getRecipient());
//    }
//
//    @KafkaListener(
//            topics = "comment-like-event",
//            groupId = "group_id",
//            containerFactory = "notificationKafkaListenerContainerFactory")
//    public void consumeCommentLikeEvent(NotificationEvent notificationEvent) {
//        if (notificationEvent == null) {
//            log.error("Nhận được NotificationEvent null cho comment-like-event");
//            return;
//        }
//        log.info("Nhận được sự kiện thông báo thích bình luận: channel={}, recipient={}, subject={}",
//                notificationEvent.getChannel(), notificationEvent.getRecipient(), notificationEvent.getSubject());
//
//        if (notificationEvent.getRecipient() == null) {
//            log.error("Recipient null trong NotificationEvent cho comment-like-event");
//            return;
//        }
//
//        messagingTemplate.convertAndSendToUser(
//                notificationEvent.getRecipient(),
//                "/queue/comment-like-notifications",
//                notificationEvent);
//        log.info("Đã gửi thông báo thích bình luận qua WebSocket đến người dùng {}",
// notificationEvent.getRecipient());
//    }
//
//    @KafkaListener(
//            topics = "comment-unlike-event",
//            groupId = "group_id",
//            containerFactory = "notificationKafkaListenerContainerFactory")
//    public void consumeCommentUnlikeEvent(NotificationEvent notificationEvent) {
//        if (notificationEvent == null) {
//            log.error("Nhận được NotificationEvent null cho comment-unlike-event");
//            return;
//        }
//        log.info("Nhận được sự kiện thông báo hủy thích bình luận: channel={}, recipient={}, subject={}",
//                notificationEvent.getChannel(), notificationEvent.getRecipient(), notificationEvent.getSubject());
//
//        if (notificationEvent.getRecipient() == null) {
//            log.error("Recipient null trong NotificationEvent cho comment-unlike-event");
//            return;
//        }
//
//        messagingTemplate.convertAndSendToUser(
//                notificationEvent.getRecipient(),
//                "/queue/comment-unlike-notifications",
//                notificationEvent);
//        log.info("Đã gửi thông báo hủy thích bình luận qua WebSocket đến người dùng {}",
// notificationEvent.getRecipient());
//    }
// }
