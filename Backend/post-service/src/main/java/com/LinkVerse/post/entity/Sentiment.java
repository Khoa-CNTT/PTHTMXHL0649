package com.LinkVerse.post.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(value = "sentiment")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Sentiment {
    @MongoId
    String id;
    String postId;
    String primarySentiment;
    double positiveScore;
    double negativeScore;
    double neutralScore;
    double mixedScore;
}