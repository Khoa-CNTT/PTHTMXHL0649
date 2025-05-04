package com.LinkVerse.event.dto;

import com.LinkVerse.statistics.entity.GroupVisibility;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

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