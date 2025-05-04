package com.LinkVerse.post.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(value = "image_violations")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageViolation {

    @Id
    Long id;

    @Column(nullable = false)
    String postId;

    @Column(nullable = false)
    String fileUrl;

    @Column(nullable = false)
    Instant violationTime; // Thời gian phát hiện vi phạm

    @Column(nullable = false)
    boolean resolved = false; // Trạng thái xử lý vi phạm
}
