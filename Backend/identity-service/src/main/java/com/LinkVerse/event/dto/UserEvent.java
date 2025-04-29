package com.LinkVerse.event.dto;

import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserEvent {
    private String id;
    private String gender;
    private String status;
    private String city;
    private LocalDateTime createdAt;
}
