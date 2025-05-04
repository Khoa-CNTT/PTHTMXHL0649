package com.LinkVerse.post.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Builder
@Document(value = "Emoji")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Emoji {
    String symbol;
    String name;

    public static List<Emoji> getAllEmojis() {
        return Arrays.asList(
                new Emoji("1", "grinning face"),
                new Emoji("2", "face with tears of joy"),
                new Emoji("3", "red heart"),
                new Emoji("4", "thumbs up"),
                new Emoji("5", "crying face")
                //Mún thêm thì cứ như trên, kéo xún
        );
    }
}
