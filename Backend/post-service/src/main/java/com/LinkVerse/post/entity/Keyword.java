package com.LinkVerse.post.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(value = "keyword")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Keyword {
    @MongoId
    String id;
    String phrase; // này là key
    int usageCount; // Số lần từ khóa được sử dụng
    String type;
    List<String> linkedContentIds; //bai viet chua khoa
}