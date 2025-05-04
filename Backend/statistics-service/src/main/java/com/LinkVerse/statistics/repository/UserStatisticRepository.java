package com.LinkVerse.statistics.repository;

import com.LinkVerse.statistics.entity.Gender;
import com.LinkVerse.statistics.entity.UserStatics;
import com.LinkVerse.statistics.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface UserStatisticRepository extends JpaRepository<UserStatics, String> {

    long countByGender(Gender gender);

    long countByStatus(UserStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<UserStatics> findAllByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
