package com.LinkVerse.donation_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.LinkVerse.donation_service.dto.response.DonationResponse;
import com.LinkVerse.donation_service.dto.response.DonationReturn;
import com.LinkVerse.donation_service.entity.Donation;

@Mapper(componentModel = "spring")
public interface DonationMapper {

    @Mapping(source = "campaign.id", target = "campaignId")
    DonationReturn toDonationReturn(Donation donation);

    default DonationResponse toDonationResponse(Donation donation) {
        DonationReturn donationReturn = toDonationReturn(donation);
        return DonationResponse.builder().donation(donationReturn).build();
    }
}
