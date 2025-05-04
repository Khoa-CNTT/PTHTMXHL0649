package com.LinkVerse.Support.repository;

import com.LinkVerse.Support.entity.AiLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiLogRepository extends JpaRepository<AiLog, Long> {
    List<AiLog> findByChatIdOrderByCreatedAtDesc(String chatId);
}
