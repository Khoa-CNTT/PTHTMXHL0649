package com.LinkVerse.identity.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.LinkVerse.identity.entity.Group;
import com.LinkVerse.identity.entity.GroupEvent;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GroupEventProducer {
    private final KafkaTemplate<String, GroupEvent> kafkaTemplate;

    @Autowired
    public GroupEventProducer(KafkaTemplate<String, GroupEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    // Phát sự kiện nhóm mới được tạo đến Kafka
    public void publishGroupCreatedEvent(Group group, String creatorRole) {
        GroupEvent groupEvent = new GroupEvent(group.getId(), creatorRole);
        kafkaTemplate.send("group-events", group.getId(), groupEvent); // Gửi GroupEvent
        System.out.println(
                "Group created event sent to Kafka: " + group.getName() + " with creator role: " + creatorRole);
    }

    // Phát sự kiện khi thêm thành viên vào nhóm
    public void publishMemberAddedEvent(String groupId, String memberRole) {
        GroupEvent memberEvent = new GroupEvent(groupId, memberRole);
        kafkaTemplate.send("group-events", groupId, memberEvent); // Gửi GroupEvent
        System.out.println("Member added event sent to Kafka: " + groupId + " with member role: " + memberRole);
    }

    public void publishMemberRemovedEvent(String groupId, String memberId) {
        log.info("Member with ID {} removed from group with ID {}", memberId, groupId);
    }
}
