// CampaignStatisticRepository.java
package com.LinkVerse.statistics.repository;

import com.LinkVerse.statistics.entity.CampaignStatics;
import com.LinkVerse.statistics.entity.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface CampaignStatisticRepository extends JpaRepository<CampaignStatics, String> {

    @Query("SELECT c FROM CampaignStatics c WHERE c.startDate BETWEEN :start AND :end")
    List<CampaignStatics> findByStartDateBetween(Instant start, Instant end);

    @Query("SELECT c FROM CampaignStatics c WHERE c.startDate BETWEEN :start AND :end AND c.status = :status")
    List<CampaignStatics> findByStartDateBetweenAndStatus(Instant start, Instant end, CampaignStatus status);
}
