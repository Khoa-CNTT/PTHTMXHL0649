package com.LinkVerse.post.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class AnonymousQuestionResponse {
    String id;
    String content;
    Instant createdDate;
    List<String> fileUrls;
}