package com.LinkVerse.donation_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String donorId;
    String receiverId;
    long amount;
    LocalDateTime paymentTime;
    String message;
    String imageUrls;
    String transactionId;

    @ManyToOne
    @JoinColumn(name = "campaign_id", nullable = false)
    @JsonBackReference
    private Campaign campaign;

    @Enumerated(EnumType.STRING)
    Donation.DonationStatus status;

    public enum DonationStatus {
        SUCCESS,
        FAILED,
        PAYMENT_PROCESSING
    }
}
