package com.LinkVerse.identity.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.LinkVerse.identity.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Integer> {
    @Query("select m from Message m join m.chat c where c.id=:chatId")
    public List<Message> findByChatId(@Param("chatId") Integer chatId);

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.content LIKE %:keyword%")
    List<Message> searchMessages(Integer chatId, String keyword);

    @Transactional
    void deleteAllByChat_Id(Integer chatId);
}
