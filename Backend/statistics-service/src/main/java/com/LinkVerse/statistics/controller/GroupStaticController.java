package com.LinkVerse.statistics.controller;

import com.LinkVerse.statistics.dto.DonationStatisticDTO;
import com.LinkVerse.statistics.dto.GroupResponse;
import com.LinkVerse.statistics.dto.GroupStatisticDTO;
import com.LinkVerse.statistics.service.DonationStatisticService;
import com.LinkVerse.statistics.service.GroupStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupStaticController {

    private final GroupStatisticService groupStatisticService;

    @GetMapping("/all")
    public GroupStatisticDTO getGroupStatistics() {
        return groupStatisticService.calculateGroupStatistics();
    }

    @GetMapping("/chart")
    public Map<LocalDate, Long> getGroupChart(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return groupStatisticService.getGroupCreationChart(start, end);
    }

    @GetMapping("/top10")
    public List<GroupResponse> getTop10Groups() {
        return groupStatisticService.getTop10Groups();
    }
}
