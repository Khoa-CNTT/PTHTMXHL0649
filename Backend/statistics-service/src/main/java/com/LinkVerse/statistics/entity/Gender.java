package com.LinkVerse.statistics.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Gender {
    MALE, FEMALE, OTHER;
    @JsonCreator
    public static Gender fromValue(String value) {
        return switch (value.toLowerCase()) {
            case "male" -> MALE;
            case "female" -> FEMALE;
            case "other" -> OTHER;
            default -> throw new IllegalArgumentException("Unknown gender: " + value);
        };
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}