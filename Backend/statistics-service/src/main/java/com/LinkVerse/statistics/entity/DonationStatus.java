package com.LinkVerse.statistics.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DonationStatus {
    SUCCESS,
    FAILED,
    PAYMENT_PROCESSING;

    @JsonCreator
    public static DonationStatus fromValue(String value) {
        return switch (value.toLowerCase()) {
            case "success" -> SUCCESS;
            case "failed" -> FAILED;
            case "payment_processing" -> PAYMENT_PROCESSING;
            default -> throw new IllegalArgumentException("Unknown status: " + value);
        };
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
