package com.LinkVerse.profile.dto.response;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;

import com.LinkVerse.profile.entity.Gender;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
    String id;
    String userId;
    String username;
    String status;
    String email;
    String firstName;
    String lastName;
    String imageUrl;
    Gender gender;
    String phoneNumber;
    Date dateOfBirth;
    String city;
    boolean emailVerified;
    Set<RoleResponse> roles;
    LocalDateTime createdAt;

    String bio;
    String quote;
    String jobTitle;
    String company;
    String themeColor;
    String coverImageUrl;
    Boolean privateProfile;
}
