package com.LinkVerse.donation_service.event.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillEmailRequest {
    private String userId;
    private String campaignTitle;
    private long amount;
    private String donorName;
    private LocalDateTime time;
}
