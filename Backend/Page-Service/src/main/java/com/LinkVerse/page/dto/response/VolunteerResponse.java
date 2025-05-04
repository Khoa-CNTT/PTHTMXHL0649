package com.LinkVerse.page.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerResponse {
    private String id;
    private String campaignId;
    private String userId;
    private String message;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
