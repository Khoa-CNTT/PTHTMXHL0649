package com.LinkVerse.statistics.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserStatus {
    ONLINE, OFFLINE;

    @JsonCreator
    public static UserStatus fromValue(String value) {
        return switch (value.toLowerCase()) {
            case "online" -> ONLINE;
            case "offline" -> OFFLINE;
            default -> throw new IllegalArgumentException("Unknown status: " + value);
        };
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
