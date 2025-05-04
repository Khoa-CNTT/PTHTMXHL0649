package com.LinkVerse.post.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedPostResponse {
    private String id;
    private String userId;
     String username;
    String imageUrl;
    private String content;
    private List<String> imageUrls;
    private PostResponse originalPost;
    private Instant createdDate;
    private Instant modifiedDate;
    private int like;
    private int unlike;
    private int commentCount;
    private List<String> keywords;
}
