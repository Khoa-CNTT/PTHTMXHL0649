package com.LinkVerse.event.dto;

import com.LinkVerse.statistics.entity.CampaignStatus;
import com.LinkVerse.statistics.entity.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignEvent {
    private String campaignId;
    private long targetAmount;
    private Instant startDate;
    private Instant endDate;
    private CampaignStatus status;
}
