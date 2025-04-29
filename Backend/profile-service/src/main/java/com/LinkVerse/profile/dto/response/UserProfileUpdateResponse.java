package com.LinkVerse.profile.dto.response;

import lombok.Data;

@Data
public class UserProfileUpdateResponse {
    private String bio;
    private String quote;
    private String jobTitle;
    private String company;
    private String themeColor;
    private String coverImageUrl;
    private Boolean privateProfile;
}
