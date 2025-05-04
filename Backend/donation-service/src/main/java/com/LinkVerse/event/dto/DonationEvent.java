package com.LinkVerse.event.dto;

import java.time.LocalDateTime;

import com.LinkVerse.donation_service.entity.Donation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationEvent {
    private String donationId;
    private long amount;
    private Donation.DonationStatus status;
    private LocalDateTime paymentTime;
}
