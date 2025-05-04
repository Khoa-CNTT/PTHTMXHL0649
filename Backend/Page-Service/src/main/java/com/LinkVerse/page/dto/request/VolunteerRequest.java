package com.LinkVerse.page.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerRequest {
    private String campaignId;
    private String message;
}
