package com.LinkVerse.event.dto;

import java.time.Instant;

import com.LinkVerse.donation_service.entity.Campaign;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignEvent {
    private String campaignId;
    private long targetAmount;
    private Instant startDate;
    private Instant endDate;
    private Campaign.CampaignStatus status;
}
