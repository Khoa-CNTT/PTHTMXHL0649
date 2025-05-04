package com.LinkVerse.donation_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DonationResponse {
    DonationReturn donation;
    private InitPaymentResponse payment;
}
