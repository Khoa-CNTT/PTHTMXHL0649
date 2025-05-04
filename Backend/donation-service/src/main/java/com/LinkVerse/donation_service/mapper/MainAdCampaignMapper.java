package com.LinkVerse.donation_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.LinkVerse.donation_service.dto.response.MainAdCampaignResponse;
import com.LinkVerse.donation_service.entity.MainAdCampaign;

@Mapper(componentModel = "spring")
public interface MainAdCampaignMapper {
    @Mapping(source = "targetAmount", target = "targetAmount")
    MainAdCampaignResponse toMainAdCampaignResponse(MainAdCampaign mainAdCampaign);
}
