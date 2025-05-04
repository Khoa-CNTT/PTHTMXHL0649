package com.LinkVerse.post.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "comments")
@Data
@Builder
public class Comment {
    @Id
    private String id;
    private String commentId;
    private String userId;
    private String username;
    private String content;
    private String imageUrl;
    private List<String> imageUrls;
    private int like;
    private int unlike;
    private int likeCount;
    private Instant createdDate;
    private boolean deleted;
    private List<String> likedUserIds;
    private List<String> likedEmojis;
}