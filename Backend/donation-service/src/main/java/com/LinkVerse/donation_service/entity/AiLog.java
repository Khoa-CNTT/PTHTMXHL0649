package com.LinkVerse.donation_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String chatId;

    @Lob
    String userInput;

    @Lob
    String aiResponse;

    String intent;
    String campaignId;

    @Column(name = "created_at")
    LocalDateTime createdAt;
}
