package com.LinkVerse.post.dto.response;

import jakarta.persistence.ElementCollection;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostPendingResponse {
    String id;
    String content;
    String username;
    String imageUrl;
    @ElementCollection
    List<String> imageUrls;
    String userId;
    Instant createdDate;
    Instant modifiedDate;
    int like;
    int unlike;
    int commentCount;
    String groupId;


    @Builder.Default
    List<CommentResponse> comments = new ArrayList<>(); // Initialize with an empty list
    @Builder.Default
    List<PostPendingResponse> sharedPost = new ArrayList<>();
    String language;
    private String primarySentiment;
}