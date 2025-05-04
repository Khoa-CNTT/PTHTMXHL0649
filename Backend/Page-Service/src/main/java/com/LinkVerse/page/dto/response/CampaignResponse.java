package com.LinkVerse.page.dto.response;

import jakarta.persistence.ElementCollection;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

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

    private Instant createdDate;
    private Instant modifiedDate;
}
