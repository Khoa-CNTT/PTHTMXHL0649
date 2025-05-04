package com.LinkVerse.donation_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.LinkVerse.donation_service.dto.response.AdDonationResponse;
import com.LinkVerse.donation_service.entity.AdDonation;

@Mapper(componentModel = "spring")
public interface AdDonationMapper {
    @Mapping(target = "adCampaignId", source = "adCampaign.id")
    @Mapping(target = "payment", ignore = true)
    AdDonationResponse toAdDonationResponse(AdDonation adDonation);
}
