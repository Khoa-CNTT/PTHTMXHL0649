package com.LinkVerse.identity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.LinkVerse.identity.entity.Chat;
import com.LinkVerse.identity.entity.User;

public interface ChatRepository extends JpaRepository<Chat, Integer> {
    @Query("select c from Chat c join c.users u where u.id=:userId")
    List<Chat> findChatByUserId(@Param("userId") String userId);

    @Query("select c from Chat c where c.isGroup=false and :user member of c.users and :reqUser member of c.users")
    Chat findSingleChatByUserIds(@Param("user") User user, @Param("reqUser") User reqUser);
}
