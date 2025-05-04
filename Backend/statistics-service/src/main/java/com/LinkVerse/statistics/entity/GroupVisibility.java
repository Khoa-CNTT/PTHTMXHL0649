package com.LinkVerse.statistics.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum GroupVisibility {
    PUBLIC,
    PRIVATE,
    PROTECTED;

    @JsonCreator
    public static GroupVisibility fromValue(String value) {
        return switch (value.toLowerCase()) {
            case "public" -> PUBLIC;
            case "private" -> PRIVATE;
            case "protected" -> PROTECTED;
            default -> throw new IllegalArgumentException("Unknown status: " + value);
        };
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
