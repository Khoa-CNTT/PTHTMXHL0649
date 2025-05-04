package com.LinkVerse.donation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.LinkVerse.donation_service.entity.AdDonation;

public interface AdDonationRepository extends JpaRepository<AdDonation, String> {
    List<AdDonation> findByAdCampaignId(String adCampaignId);
}
