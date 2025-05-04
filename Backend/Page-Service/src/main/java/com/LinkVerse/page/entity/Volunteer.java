package com.LinkVerse.page.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Volunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String userId;
    String campaignId;
    String message;

    @Enumerated(EnumType.STRING)
    Status status;

    LocalDateTime appliedAt;
    LocalDateTime updatedAt;

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
