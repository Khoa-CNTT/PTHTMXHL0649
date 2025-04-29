package com.LinkVerse.identity.dto.request;

import com.LinkVerse.identity.entity.GroupVisibility;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GroupRequest {
    String name;
    String description;
    GroupVisibility visibility;
}
