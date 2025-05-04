package com.LinkVerse.donation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.LinkVerse.donation_service.entity.AiLog;

@Repository
public interface AiLogRepository extends JpaRepository<AiLog, Long> {
    List<AiLog> findByChatIdOrderByCreatedAtDesc(String chatId);
}
