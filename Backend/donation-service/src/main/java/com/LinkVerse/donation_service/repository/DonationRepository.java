package com.LinkVerse.donation_service.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.LinkVerse.donation_service.entity.Donation;

import feign.Param;

public interface DonationRepository extends JpaRepository<Donation, String> {
    List<Donation> findByCampaignId(String campaignId);

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.status = 'SUCCESS'")
    Long sumAllAmount();

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.campaign.id = :campaignId")
    Long sumAmountByCampaignId(@Param("campaignId") String campaignId);

    Long countByCampaignId(String campaignId);

    @Query("SELECT d.campaign.id, d.campaign.title, SUM(d.amount), COUNT(d.id) "
            + "FROM Donation d GROUP BY d.campaign.id, d.campaign.title ORDER BY SUM(d.amount) DESC")
    List<Object[]> findTopCampaigns();

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.paymentTime >= :start")
    long countThisWeek(@Param("start") LocalDateTime start);

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.paymentTime >= :start")
    Long sumThisWeek(@Param("start") LocalDateTime start);

    @Query(
            """
					SELECT d.campaign.id, d.campaign.title, SUM(d.amount)
					FROM Donation d
					WHERE d.paymentTime >= :start
					GROUP BY d.campaign.id, d.campaign.title
					ORDER BY SUM(d.amount) DESC
					""")
    List<Object[]> topCampaignsThisWeek(@Param("start") LocalDateTime start);
}
