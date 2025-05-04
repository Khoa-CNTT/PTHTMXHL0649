package com.LinkVerse.statistics.dto;

import com.LinkVerse.statistics.entity.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
public class CampaignStatisticDTO {
    private LocalDate date;
    private long totalCampaigns;
    private long totalTargetAmount;

    private long totalCompleted;
    private long totalUncompleted;
    private double completionRate;
    private double uncompletionRate;

    private long createdToday;
    private long createdThisMonth;
    private long createdThisYear;
}
