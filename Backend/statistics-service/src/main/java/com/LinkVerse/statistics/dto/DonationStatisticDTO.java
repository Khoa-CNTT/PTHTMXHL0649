package com.LinkVerse.statistics.dto;

import com.LinkVerse.statistics.entity.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DonationStatisticDTO {
    private DonationStatus status;
    private long donationCount;
    private long totalAmount;

}
