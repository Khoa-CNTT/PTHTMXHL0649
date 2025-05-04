package com.LinkVerse.donation_service.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Locale {
    VIETNAM("vn"),
    US("us"),
    ;

    private final String code;
}
