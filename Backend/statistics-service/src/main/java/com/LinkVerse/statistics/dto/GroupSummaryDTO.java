package com.LinkVerse.statistics.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GroupSummaryDTO {
    String groupId;
    int memberCount;
}
