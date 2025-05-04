package com.LinkVerse.donation_service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IpnResponse {

    @JsonProperty("RspCode")
    private String responseCode;

    @JsonProperty("Message")
    private String message;
}
