package com.LinkVerse.statistics.controller;

import com.LinkVerse.statistics.dto.UserStatisticDTO;
import com.LinkVerse.statistics.service.UserStatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserStaticController {

    private final UserStatisticService userStatisticService;

    @GetMapping("/all")
    public UserStatisticDTO getUserStatistics() {
        return userStatisticService.calculateUserStatistics();
    }

    //số user regis từng ngày trong 1 khoảng thời gian
    @GetMapping("/chart")
    public Map<LocalDate, Long> getRegistrationChart(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return userStatisticService.getRegistrationChart(start, end);
    }





}