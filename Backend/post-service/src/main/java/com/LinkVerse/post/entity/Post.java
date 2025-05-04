package com.LinkVerse.post.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(value = "post")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {
    @MongoId
    String id;
    String userId;
    String content;
//    @DBRef
//    User user;
    String username;
String imageUrl;
    @ElementCollection
    List<String> imageUrls;
    String imgAvatarUrl;

    @Enumerated(EnumType.STRING)
     @Builder.Default
    PostVisibility visibility = PostVisibility.PUBLIC;

    Instant createdDate;
    Instant modifiedDate;
    int like;
    int unlike;
    int commentCount;
      @Builder.Default
    private List<Comment> comments = new ArrayList<>();
    List<String> likedEmojis;

    @DBRef
    List<SharedPost> sharedPosts = new ArrayList<>();

    boolean deleted = false;
    String language;
    @ElementCollection
    List<String> keywords = new ArrayList<>();
    String mostActiveUserId;
    String groupId;


    @DBRef
    List<Hashtag> hashtags = new ArrayList<>();
    //Phantich cam xuc
    String primarySentiment;
    double positiveScore;
    double negativeScore;
    double neutralScore;
    double mixedScore;
    private List<String> likedUserIds;
    boolean hasViolation = false;
    boolean violationResolved = false;
    int share = 0;
    @ElementCollection
    private List<String> savedBy = new ArrayList<>();
}