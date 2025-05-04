package com.LinkVerse.statistics.controller;

import com.LinkVerse.statistics.dto.CampaignStatisticDTO;
import com.LinkVerse.statistics.dto.DonationStatisticDTO;
import com.LinkVerse.statistics.entity.CampaignStatics;
import com.LinkVerse.statistics.service.CampaignStatisticService;
import com.LinkVerse.statistics.service.DonationStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/campaign")
@RequiredArgsConstructor
public class CampaitnStaticController {

    private final CampaignStatisticService campaignStatisticService;

    @GetMapping("/date-range")
    public List<CampaignStatisticDTO> getStatsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return campaignStatisticService.getStatisticsByDateRange(from, to);
    }

    @GetMapping("/average-completion-time")
    public double getAverageCampaignCompletionTime(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        return campaignStatisticService.getAverageCampaignCompletionDuration(startDate, endDate);
    }



    @GetMapping("/top-amount-campaigns")
    public List<CampaignStatics> getTop10ByTargetAmount() {
        return campaignStatisticService.getTop10CampaignsByTargetAmount();
    }
}
