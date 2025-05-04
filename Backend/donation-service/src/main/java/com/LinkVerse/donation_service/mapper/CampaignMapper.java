package com.LinkVerse.donation_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import com.LinkVerse.donation_service.dto.response.CampaignResponse;
import com.LinkVerse.donation_service.entity.Campaign;

@Mapper(componentModel = "spring")
public interface CampaignMapper {

    @Mappings({
        @Mapping(source = "id", target = "id"),
        @Mapping(source = "receiverId", target = "receiverId"),
        @Mapping(source = "title", target = "title"),
        @Mapping(source = "description", target = "description"),
        @Mapping(source = "targetAmount", target = "targetAmount"),
        @Mapping(source = "currentAmount", target = "currentAmount"),
        @Mapping(source = "status", target = "status"),
        @Mapping(source = "imageUrl", target = "imageUrl"),
        @Mapping(source = "startDate", target = "createdDate"),
        @Mapping(source = "endDate", target = "modifiedDate"),
        @Mapping(source = "timeSlots", target = "timeSlots")
    })
    CampaignResponse toCampaignResponse(Campaign campaign);
}
