package com.LinkVerse.post.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostGroupRequest {
    String groupId;
    String content;
    String language;
    private Boolean forceAnonymous;
}