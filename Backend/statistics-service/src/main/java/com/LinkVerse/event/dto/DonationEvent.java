package com.LinkVerse.event.dto;

import com.LinkVerse.statistics.entity.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationEvent {
    private String donationId;
    long amount;
    private DonationStatus status;
    private LocalDateTime paymentTime;

}
