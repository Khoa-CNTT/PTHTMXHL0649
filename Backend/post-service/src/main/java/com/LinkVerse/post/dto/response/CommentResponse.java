package com.LinkVerse.post.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {
    String id;
    String userId;
            String username;
String imageUrl;
    List<String> imageUrls;
    String commentId;
    String content;
    Instant createdDate;
    int like;
    int unlike;


}
