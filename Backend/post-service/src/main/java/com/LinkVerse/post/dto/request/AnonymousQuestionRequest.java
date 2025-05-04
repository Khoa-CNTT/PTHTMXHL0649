package com.LinkVerse.post.dto.request;

import com.LinkVerse.post.entity.PostVisibility;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AnonymousQuestionRequest {
    String content;
    String groupId;
    PostVisibility visibility;
}