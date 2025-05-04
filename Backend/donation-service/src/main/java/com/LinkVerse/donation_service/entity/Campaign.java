package com.LinkVerse.donation_service.entity;

import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
public class Campaign implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String title;
    String description;
    long targetAmount;
    long currentAmount = 0L;
    Instant startDate;
    Instant endDate;
    String receiverId;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<Donation> donations = new HashSet<>();

    @ElementCollection
    private List<String> imageUrl;

    @Enumerated(EnumType.STRING)
    CampaignStatus status;

    @ElementCollection
    private List<String> timeSlots;

    public enum CampaignStatus {
        UNFINISHED,
        FINISHED
    }
}
