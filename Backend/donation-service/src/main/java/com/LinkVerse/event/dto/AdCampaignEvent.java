package com.LinkVerse.event.dto;

import java.io.Serializable;
import java.time.Instant;

import com.LinkVerse.donation_service.entity.AdCampaign;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdCampaignEvent implements Serializable {
    private String adCampaignId;
    private String postId;
    private long targetAmount;
    private Instant startDate;
    private Instant endDate;
    private AdCampaign.AdCampaignStatus status;
}
