package com.LinkVerse.post.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmojiRequest {
    String symbol;
    String name;
}
