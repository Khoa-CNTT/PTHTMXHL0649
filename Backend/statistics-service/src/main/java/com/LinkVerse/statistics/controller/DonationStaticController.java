package com.LinkVerse.statistics.controller;

import com.LinkVerse.statistics.dto.DonationStatisticDTO;
import com.LinkVerse.statistics.service.DonationStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/donations")
@RequiredArgsConstructor
public class DonationStaticController {

    private final DonationStatisticService donationStatisticService;

    @GetMapping("/date-range")
    public ResponseEntity<List<DonationStatisticDTO>> getDonationStatisticsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        List<DonationStatisticDTO> statistics = donationStatisticService.getDonationStatisticsByDateRange(
                LocalDate.parse(startDate), LocalDate.parse(endDate));
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/today")
    public ResponseEntity<List<DonationStatisticDTO>> getDonationStatisticsForToday() {
        List<DonationStatisticDTO> statistics = donationStatisticService.getDonationStatisticsForToday();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/this-month")
    public ResponseEntity<List<DonationStatisticDTO>> getDonationStatisticsForThisMonth() {
        List<DonationStatisticDTO> statistics = donationStatisticService.getDonationStatisticsForThisMonth();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/this-year")
    public ResponseEntity<List<DonationStatisticDTO>> getDonationStatisticsForThisYear() {
        List<DonationStatisticDTO> statistics = donationStatisticService.getDonationStatisticsForThisYear();
        return ResponseEntity.ok(statistics);
    }
}
