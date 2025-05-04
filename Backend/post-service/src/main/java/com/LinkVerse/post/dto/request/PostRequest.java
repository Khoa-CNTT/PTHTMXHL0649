package com.LinkVerse.post.dto.request;

import com.LinkVerse.post.entity.PostVisibility;
import jakarta.persistence.ElementCollection;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostRequest {
    String content;
 @Builder.Default
    PostVisibility visibility = PostVisibility.PUBLIC;
 String language;
    @ElementCollection
    List<String> ImageUrls;
    String imgAvatarUrl;
//    String PostId;
}