package com.LinkVerse.donation_service.dto;

import com.LinkVerse.donation_service.dto.response.AdCampaignResponse;
import com.LinkVerse.donation_service.entity.AdCampaign;

import lombok.Data;

@Data
public class AdCampaignPublicView {
    private String id;
    private String title;
    private String postId;
    private Long donationAmount;
    private AdCampaign.AdCampaignStatus status;

    public static AdCampaignPublicView from(AdCampaignResponse response) {
        AdCampaignPublicView view = new AdCampaignPublicView();
        view.setId(response.getId());
        view.setTitle(response.getTitle());
        view.setPostId(response.getPostId());
        view.setDonationAmount(response.getDonationAmount());
        view.setStatus(response.getStatus());
        return view;
    }
}
