package com.LinkVerse.statistics.service;

import com.LinkVerse.statistics.dto.ApiResponse;
import com.LinkVerse.statistics.dto.GroupResponse;
import com.LinkVerse.statistics.dto.GroupStatisticDTO;
import com.LinkVerse.statistics.dto.GroupSummaryDTO;
import com.LinkVerse.statistics.entity.GroupVisibility;
import com.LinkVerse.statistics.repository.GroupStatisticRepository;
import com.LinkVerse.statistics.repository.httpclient.IdentityClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupStatisticService {

    private final GroupStatisticRepository groupStatisticRepository;
    private final IdentityClient identityClient;


    public GroupStatisticDTO calculateGroupStatistics() {
        LocalDate now = LocalDate.now();

        long total = groupStatisticRepository.count();

        long today = groupStatisticRepository.countByCreatedAtBetween(
                now.atStartOfDay(), now.plusDays(1).atStartOfDay());

        long thisMonth = groupStatisticRepository.countByCreatedAtBetween(
                now.withDayOfMonth(1).atStartOfDay(),
                now.plusMonths(1).withDayOfMonth(1).atStartOfDay());

        long thisYear = groupStatisticRepository.countByCreatedAtBetween(
                now.withDayOfYear(1).atStartOfDay(),
                now.plusYears(1).withDayOfYear(1).atStartOfDay());

        // Visibility stats
        Map<GroupVisibility, Long> visibilityCountMap = Arrays.stream(GroupVisibility.values())
                .collect(Collectors.toMap(
                        visibility -> visibility,
                        visibility -> groupStatisticRepository.countByVisibility(visibility)
                ));

        Map<String, String> visibilityStats = new HashMap<>();
        for (Map.Entry<GroupVisibility, Long> entry : visibilityCountMap.entrySet()) {
            String key = entry.getKey().name();
            String value = String.format("%d/%d", entry.getValue(), total);
            visibilityStats.put(key, value);
        }


        return GroupStatisticDTO.builder()
                .totalGroups(total)
                .createdToday(today)
                .createdThisMonth(thisMonth)
                .createdThisYear(thisYear)
                .visibilityStats(visibilityStats)
                .build();
    }


    public List<GroupResponse> getTop10Groups() {
        ApiResponse<List<GroupResponse>> response = identityClient.getTop10GroupsByMembers();
        if (response != null && response.getResult() != null) {
            return response.getResult();
        }
        return new ArrayList<>();
    }



    public Map<LocalDate, Long> getGroupCreationChart(LocalDate startDate, LocalDate endDate) {
        return groupStatisticRepository.findAllByCreatedAtBetween(
                        startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay())
                .stream()
                .collect(Collectors.groupingBy(
                        g -> g.getCreatedAt().toLocalDate(),
                        Collectors.counting()
                ));
    }
}