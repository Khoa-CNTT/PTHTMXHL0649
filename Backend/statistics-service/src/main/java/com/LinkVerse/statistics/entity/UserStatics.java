package com.LinkVerse.statistics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatics {
    @Id
    @Column(name = "user_id")
    private String userId;


    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private String city;

    private LocalDateTime createdAt;
}