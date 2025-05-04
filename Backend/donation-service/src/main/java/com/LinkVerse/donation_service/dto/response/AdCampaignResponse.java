package com.LinkVerse.donation_service.dto.response;

import java.time.Instant;
import java.util.List;

import com.LinkVerse.donation_service.entity.AdCampaign;

import lombok.Data;

@Data
public class AdCampaignResponse {
    private String id;
    private String title;
    private String description;
    private String postId;
    private String mainAdCampaignId;
    private List<String> timeSlots;
    private String userId;
    private AdCampaign.AdCampaignStatus status;
    private Long donationAmount;
    private Instant startDate;
}
