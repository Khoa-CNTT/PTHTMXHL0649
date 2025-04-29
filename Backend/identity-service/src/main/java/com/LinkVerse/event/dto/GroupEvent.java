package com.LinkVerse.event.dto;

import java.time.LocalDateTime;

import com.LinkVerse.identity.entity.GroupVisibility;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GroupEvent {
    private String groupId;
    private int memberCount;
    private GroupVisibility visibility;
    private LocalDateTime createdAt;
}
