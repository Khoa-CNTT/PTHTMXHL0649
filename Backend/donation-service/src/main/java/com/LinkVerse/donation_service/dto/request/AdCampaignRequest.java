package com.LinkVerse.donation_service.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class AdCampaignRequest {
    private String title;
    private String description;
    private String postId;
    private String mainAdCampaignId; // ID chiến dịch chính
    private List<String> timeSlots;
}
