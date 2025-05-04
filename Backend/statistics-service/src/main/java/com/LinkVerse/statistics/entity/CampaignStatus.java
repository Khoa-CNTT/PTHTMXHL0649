package com.LinkVerse.statistics.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CampaignStatus {
    UNFINISHED, FINISHED;
    @JsonCreator
    public static CampaignStatus fromValue(String value) {
        return switch (value.toLowerCase()) {
            case "unfinished" -> UNFINISHED;
            case "finished" -> FINISHED;
            default -> throw new IllegalArgumentException("Unknown status: " + value);
        };
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}