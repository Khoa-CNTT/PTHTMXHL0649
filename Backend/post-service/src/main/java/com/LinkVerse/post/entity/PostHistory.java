package com.LinkVerse.post.entity;

import com.LinkVerse.post.dto.response.PostResponse;
import jakarta.persistence.ElementCollection;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "post-history")
public class PostHistory {
    @MongoId
    String id;
    String content;
        String username;
String imageUrl;
    @ElementCollection
    List<String> fileUrls;
    PostVisibility visibility;
    String userId;
    Instant createdDate;
    Instant modifiedDate;
    int like;
    int unlike;
    int commentCount;
    List<Comment> comments = new ArrayList<Comment>();
    List<PostResponse> sharedPost;
}