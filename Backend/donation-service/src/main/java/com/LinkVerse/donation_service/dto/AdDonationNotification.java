package com.LinkVerse.donation_service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdDonationNotification {
    private String receiverId;
    private String message;
    private LocalDateTime time;
}
