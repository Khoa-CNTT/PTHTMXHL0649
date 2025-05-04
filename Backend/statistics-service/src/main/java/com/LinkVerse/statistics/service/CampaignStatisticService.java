// CampaignStatisticService.java
package com.LinkVerse.statistics.service;

import com.LinkVerse.statistics.dto.CampaignStatisticDTO;
import com.LinkVerse.statistics.entity.CampaignStatics;
import com.LinkVerse.statistics.entity.CampaignStatus;
import com.LinkVerse.statistics.repository.CampaignStatisticRepository;
import com.LinkVerse.statistics.repository.httpclient.CampaignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignStatisticService {

    private final CampaignStatisticRepository campaignStatisticRepository;
    private final CampaignClient campaignClient;


    public List<CampaignStatisticDTO> getStatisticsByDateRange(LocalDate startDate, LocalDate endDate) {
        Instant start = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<CampaignStatics> campaigns = campaignStatisticRepository.findByStartDateBetween(start, end);

        return campaigns.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getStartDate().atZone(ZoneOffset.UTC).toLocalDate(),
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            long totalTarget = list.stream().mapToLong(CampaignStatics::getTargetAmount).sum();
                            return CampaignStatisticDTO.builder()
                                    .date(list.get(0).getStartDate().atZone(ZoneOffset.UTC).toLocalDate())
                                    .totalCampaigns(list.size())
                                    .totalTargetAmount(totalTarget)
                                    .build();
                        })
                ))
                .values()
                .stream()
                .sorted(Comparator.comparing(CampaignStatisticDTO::getDate))
                .collect(Collectors.toList());
    }

    public double getAverageCampaignCompletionDuration(Instant start, Instant end) {
        return campaignClient.getAverageCompletionTimeInDays(start, end);
    }




    public List<CampaignStatics> getTop10CampaignsByTargetAmount() {
        return campaignStatisticRepository.findAll()
                .stream()
                .sorted((c1, c2) -> Long.compare(c2.getTargetAmount(), c1.getTargetAmount()))
                .limit(10)
                .collect(Collectors.toList());
    }
}
