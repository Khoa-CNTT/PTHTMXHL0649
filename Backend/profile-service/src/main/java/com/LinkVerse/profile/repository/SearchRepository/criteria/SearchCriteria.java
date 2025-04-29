package com.LinkVerse.profile.repository.SearchRepository.criteria;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchCriteria {
    // firstName:T
    String key; // firstName, id, ...
    String operation; // =, >, <, ...
    Object value; // "John", 1, ...
}
