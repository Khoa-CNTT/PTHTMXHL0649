package com.LinkVerse.donation_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopCampaignResponse {
    private String id;
    private String title;
    private Long amount;
    private Long count;
}
