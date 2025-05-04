// CampaignStatisticRepository.java
package com.LinkVerse.statistics.repository;

import com.LinkVerse.statistics.entity.CampaignStatics;
import com.LinkVerse.statistics.entity.CampaignStatus;
import com.LinkVerse.statistics.entity.DonationStatics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public interface DonationStatisticRepository extends JpaRepository<DonationStatics, String> {
    List<DonationStatics> findAllByPaymentTimeBetween(LocalDateTime start, LocalDateTime end);

}
