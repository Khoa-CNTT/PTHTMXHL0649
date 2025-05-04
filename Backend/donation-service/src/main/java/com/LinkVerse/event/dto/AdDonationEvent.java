package com.LinkVerse.event.dto;

import java.io.Serializable;

import com.LinkVerse.donation_service.entity.AdDonation;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdDonationEvent implements Serializable {
    private String adDonationId;
    private long amount;
    private AdDonation.AdDonationStatus status;
}
