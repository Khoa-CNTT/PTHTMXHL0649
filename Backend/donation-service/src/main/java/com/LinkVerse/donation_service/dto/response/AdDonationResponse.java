package com.LinkVerse.donation_service.dto.response;

import java.time.LocalDateTime;

import com.LinkVerse.donation_service.entity.AdDonation;

import lombok.Data;

@Data
public class AdDonationResponse {
    private String id;

    private String donorId;
    private String adminId;
    private long amount;
    private LocalDateTime paymentTime;
    private String adCampaignId;
    private AdDonation.AdDonationStatus status;
    private InitPaymentResponse payment;
}
