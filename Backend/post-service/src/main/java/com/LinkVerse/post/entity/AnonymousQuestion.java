package com.LinkVerse.post.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@Document(collection = "anonymous_questions")
public class AnonymousQuestion {
    @Id
    String id;
    String content;
    String userId;
    Instant createdDate;
    List<String> fileUrls;
    GroupVisibility visibility;

}