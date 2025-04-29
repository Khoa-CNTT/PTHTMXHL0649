package com.LinkVerse.profile.dto.request;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String bio;
    private String quote;
    private String jobTitle;
    private String company;
    private String themeColor;
    private String coverImageUrl;
    private Boolean privateProfile;
}
