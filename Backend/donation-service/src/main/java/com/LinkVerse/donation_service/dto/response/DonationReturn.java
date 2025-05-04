package com.LinkVerse.donation_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DonationReturn {
    String id;
    String donorId;
    String receiverId;
    long amount;
    String paymentTime;
    String message;
    String imageUrls;
    String transactionId;
    String campaignId;
    String status;
}
