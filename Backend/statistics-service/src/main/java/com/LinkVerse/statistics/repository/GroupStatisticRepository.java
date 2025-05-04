package com.LinkVerse.statistics.repository;

import com.LinkVerse.statistics.entity.GroupStatics;
import com.LinkVerse.statistics.entity.GroupVisibility;
import com.LinkVerse.statistics.entity.UserStatics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface GroupStatisticRepository extends JpaRepository<GroupStatics, String> {

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<GroupStatics> findAllByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByVisibility(GroupVisibility visibility);


}
