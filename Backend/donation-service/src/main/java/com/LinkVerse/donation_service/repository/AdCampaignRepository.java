package com.LinkVerse.donation_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.LinkVerse.donation_service.entity.AdCampaign;

public interface AdCampaignRepository extends JpaRepository<AdCampaign, String> {
    List<AdCampaign> findAllByUserId(String userId);
}
