package com.LinkVerse.profile.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class UserProfile implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String userId;
    String username;
    String email;
    String firstName;
    String lastName;
    Date dateOfBirth;
    String city;
    String phoneNumber;
    String imageUrl;

    @Enumerated(EnumType.STRING)
    Gender gender;

    @Column(length = 500)
    String bio;

    @Column(length = 255)
    String quote;

    @Column(length = 100)
    String jobTitle;

    @Column(length = 100)
    String company;

    String themeColor;
    String coverImageUrl;

    @Column(name = "private_profile", nullable = false)
    boolean privateProfile = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    UserStatus status = UserStatus.ONLINE;

    @Column(name = "email_verified", nullable = false)
    boolean emailVerified;

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    Set<Friendship> sentFriendships;

    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    Set<Friendship> receivedFriendships;
}
