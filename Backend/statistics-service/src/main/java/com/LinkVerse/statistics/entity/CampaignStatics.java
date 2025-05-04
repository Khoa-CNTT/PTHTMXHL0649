package com.LinkVerse.statistics.entity;

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
public class CampaignStatics {
    @Id
    @Column(name = "campaign_id", nullable = false)
    private String campaignId;

    private long targetAmount;
    private Instant startDate;
    private Instant endDate;
    private CampaignStatus status;
}