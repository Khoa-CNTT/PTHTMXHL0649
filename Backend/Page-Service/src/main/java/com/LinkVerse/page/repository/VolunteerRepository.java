package com.LinkVerse.page.repository;

import com.LinkVerse.page.entity.Volunteer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, String> {
    List<Volunteer> findByCampaignId(String campaignId);

    // Thêm phương thức mới để hỗ trợ phân trang
    Page<Volunteer> findByCampaignId(String campaignId, Pageable pageable);

    List<Volunteer> findByUserId(String userId);

    Optional<Volunteer> findByUserIdAndCampaignId(String userId, String campaignId);
}