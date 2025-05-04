package com.LinkVerse.Support.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
