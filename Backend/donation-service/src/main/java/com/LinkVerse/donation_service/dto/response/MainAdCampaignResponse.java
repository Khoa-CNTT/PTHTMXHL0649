package com.LinkVerse.donation_service.dto.response;

import lombok.Data;

@Data
public class MainAdCampaignResponse {
    private String id;
    private String title;
    private long targetAmount;
    private String adminId;
}
