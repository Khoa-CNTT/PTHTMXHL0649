package com.LinkVerse.statistics.configuration;

import com.LinkVerse.event.dto.CampaignEvent;
import com.LinkVerse.event.dto.GroupEvent;
import com.LinkVerse.statistics.entity.CampaignStatics;
import com.LinkVerse.statistics.entity.GroupStatics;
import com.LinkVerse.statistics.repository.CampaignStatisticRepository;
import com.LinkVerse.statistics.repository.GroupStatisticRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CampaignEventListener {

    private final CampaignStatisticRepository campaignStatisticRepository;

    @KafkaListener(topics = "campaign-events", groupId = "statistic-service", containerFactory = "campaignKafkaListenerContainerFactory")
    public void listenToGroupEvents(CampaignEvent event) {
        log.info("Received campaign event: {}", event);

        CampaignStatics campaignStatics = CampaignStatics.builder()
                .campaignId(event.getCampaignId())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .targetAmount(event.getTargetAmount())
                .status(event.getStatus())
                .build();

        campaignStatisticRepository.save(campaignStatics);
    }
}
