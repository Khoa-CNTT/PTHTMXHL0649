package com.LinkVerse.statistics.configuration;

import com.LinkVerse.event.dto.GroupEvent;
import com.LinkVerse.statistics.entity.GroupStatics;
import com.LinkVerse.statistics.repository.GroupStatisticRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroupEventListener {

    private final GroupStatisticRepository groupRepo;

    @KafkaListener(topics = "groups-events", groupId = "statistic-service", containerFactory = "groupKafkaListenerContainerFactory")
    public void listenToGroupEvents(GroupEvent event) {
        log.info("Received group event: {}", event);

        GroupStatics groupStat = GroupStatics.builder()
                .groupId(event.getGroupId())
                .memberCount(event.getMemberCount())
                .visibility(event.getVisibility())
                .build();

        groupRepo.save(groupStat);
    }
}
