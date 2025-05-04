package com.LinkVerse.donation_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.LinkVerse.donation_service.dto.response.AdCampaignResponse;
import com.LinkVerse.donation_service.entity.AdCampaign;

@Mapper(componentModel = "spring")
public interface AdCampaignMapper {
    @Mapping(target = "status", source = "status")
    @Mapping(source = "startDate", target = "startDate")
    @Mapping(target = "mainAdCampaignId", source = "mainAdCampaign.id")
    @Mapping(
            target = "donationAmount",
            expression = "java(adCampaign.getDonation() != null ? adCampaign.getDonation().getAmount() : null)")
    AdCampaignResponse toAdCampaignResponse(AdCampaign adCampaign);
}
