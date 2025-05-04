package com.LinkVerse.statistics.entity;

import com.LinkVerse.event.dto.DonationEvent;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaign_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationStatics {
    @Id
    @Column(name = "donation_id", nullable = false)
    private String donationId;

    private long amount;

    private DonationStatus status;

    private LocalDateTime paymentTime;

}