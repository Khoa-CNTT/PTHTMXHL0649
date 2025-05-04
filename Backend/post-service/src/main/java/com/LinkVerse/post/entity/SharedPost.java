package com.LinkVerse.post.entity;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Document(value = "shared_post")  // Tên collection mới cho các bài viết chia sẻ
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SharedPost {
    @MongoId
    String id;
    String userId;
    String content;

    @ElementCollection
    List<String> imageUrls;
   String username;
String imageUrl;
    @Enumerated(EnumType.STRING)
    private PostVisibility visibility;
    List<Comment> comments = new ArrayList<Comment>();

    Instant createdDate;
    Instant modifiedDate;
    int like;
    int unlike;
    int commentCount;
    String language;
    String primarySentiment;
    @DBRef
    Post originalPost;

    @ElementCollection
    List<String> keywords = new ArrayList<>();
    int share = 0;

}
