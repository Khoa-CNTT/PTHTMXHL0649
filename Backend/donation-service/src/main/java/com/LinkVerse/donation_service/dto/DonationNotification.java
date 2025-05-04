package com.LinkVerse.donation_service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationNotification {
    private String receiverId; // User nhận (campaign owner)
    private String message;
    private LocalDateTime time;
}
