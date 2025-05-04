//
//package com.LinkVerse.post.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import org.springframework.data.elasticsearch.annotations.DateFormat;
//import org.springframework.data.elasticsearch.annotations.Document;
//import org.springframework.data.annotation.Id;
//import org.springframework.data.elasticsearch.annotations.Field;
//import org.springframework.data.elasticsearch.annotations.FieldType;
//
//import java.time.Instant;
//import java.util.ArrayList;
//import java.util.Date;
//import java.util.List;
//
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//@Document(indexName = "post_document")
//@FieldDefaults(level = AccessLevel.PUBLIC)
//public class PostDocument {
//
//    @Id
//    String id;
//
//    @Field(type = FieldType.Text, analyzer = "standard")
//    String content;
//
//    @Field(type = FieldType.Keyword)
//    String userId;
//
//    @Field(type = FieldType.Keyword)
//    List<String> imageUrl;
//
//    @Field(type = FieldType.Keyword)
//    String imgAvatarUrl;
//
//    @Field(type = FieldType.Keyword)
//    PostVisibility visibility;
//
//    @Field(type = FieldType.Date, format = DateFormat.date_time)
//    Instant createdAt;
//
//    @Field(type = FieldType.Date, format = DateFormat.date_time)
//    Instant updatedAt;
//
//    @Field(type = FieldType.Nested, includeInParent = true)
//    List<Comment> comments = new ArrayList<>();
//}
