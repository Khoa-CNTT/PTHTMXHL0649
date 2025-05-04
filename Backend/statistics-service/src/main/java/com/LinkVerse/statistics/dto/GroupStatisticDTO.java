package com.LinkVerse.statistics.dto;

import com.LinkVerse.statistics.entity.GroupStatics;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GroupStatisticDTO {
    long totalGroups;
    long createdToday;
    long createdThisMonth;
    long createdThisYear;
    private Map<String, String> visibilityStats;
}
