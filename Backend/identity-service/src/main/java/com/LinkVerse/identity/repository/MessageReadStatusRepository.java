package com.LinkVerse.identity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.LinkVerse.identity.entity.Message;
import com.LinkVerse.identity.entity.MessageReadStatus;
import com.LinkVerse.identity.entity.User;

public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {
    List<MessageReadStatus> findByMessage_Id(Integer messageId);

    Optional<MessageReadStatus> findByMessageAndUser(Message message, User user);
}
