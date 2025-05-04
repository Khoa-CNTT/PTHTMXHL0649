package com.LinkVerse.donation_service.dto;

import com.LinkVerse.donation_service.dto.response.CampaignResponse;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    @Builder.Default
    int code = 1000;

    String message;
    T result;

    public ApiResponse(CampaignResponse campaignResponse) {
        this.code = 200;
        this.message = "Success";
        this.result = (T) campaignResponse; // Safe cast nếu dùng đúng kiểu
    }
}
