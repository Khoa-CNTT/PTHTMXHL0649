package com.LinkVerse.donation_service.dto.response;

import java.time.Instant;
import java.util.List;

import jakarta.persistence.ElementCollection;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CampaignResponse {
    private String id;
    private String receiverId;
    private String title;
    private String description;
    private long targetAmount;
    private long currentAmount;
    private String status;

    @ElementCollection
    private List<String> imageUrl;

    @ElementCollection
    private List<String> timeSlots;

    private Instant createdDate;
    private Instant modifiedDate;
}
