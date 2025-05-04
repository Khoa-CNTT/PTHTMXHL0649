package com.LinkVerse.donation_service.entity;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "ad_campaigns")
public class AdCampaign implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String title;
    String description;
    Instant startDate;
    Instant endDate;
    String userId; // ID người dùng tạo chiến dịch

    @Column(name = "post_id")
    String postId; // ID bài viết từ post-service

    @ManyToOne
    @JoinColumn(name = "main_ad_campaign_id", nullable = false)
    MainAdCampaign mainAdCampaign; // Liên kết với chiến dịch chính

    @OneToOne(mappedBy = "adCampaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    AdDonation donation; // Một donation duy nhất

    @ElementCollection
    List<String> imageUrls;

    @Enumerated(EnumType.STRING)
    AdCampaignStatus status;

    public enum AdCampaignStatus {
        PENDING,
        ACTIVE,
        FINISHED
    }
}
