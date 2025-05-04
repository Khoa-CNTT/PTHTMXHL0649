package com.LinkVerse.donation_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR(1009, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    ACCESS_DENIED(1010, "Access denied", HttpStatus.FORBIDDEN),
    INVALID_PHONE_NUMBER(1011, "Phone number invalid format", HttpStatus.BAD_REQUEST),
    VNPAY_SIGNING_FAILED(1012, "VNPAY signing failed", HttpStatus.INTERNAL_SERVER_ERROR),
    DONATION_NOT_FOUND(1013, "BOOKING_NOT_FOUND", HttpStatus.NOT_FOUND),
    VNPAY_CHECKSUM_FAILED(1014, "VNPAY_CHECKSUM_FAILED", HttpStatus.INTERNAL_SERVER_ERROR),
    CAMPAIGN_NOT_FOUND(1015, "Campaign not found", HttpStatus.NOT_FOUND),
    CAMPAIGN_FINISHED(1016, "Campaign has already finished", HttpStatus.INTERNAL_SERVER_ERROR),
    DONATION_ALREADY_PROCESSED(1017, "Donation has already processed", HttpStatus.INTERNAL_SERVER_ERROR),
    DONATION_ID_GENERATION_FAILED(1018, "Donation id generation failed", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_DONATION(1019, "Invalid donation", HttpStatus.BAD_REQUEST),
    ADCAMPAIGN_NOT_FOUND(1020, "AdCampaign not found", HttpStatus.NOT_FOUND),
    POST_NOT_FOUND(1021, "Post not found", HttpStatus.NOT_FOUND),
    ADDONATION_NOT_FOUND(1022, "AdDonation not found", HttpStatus.NOT_FOUND),
    MAIN_AD_CAMPAIGN_NOT_FOUND(1023, "MainAdCampaign not found", HttpStatus.NOT_FOUND),
    DUPLICATE_DONATION(1024, "Campaign already has a donation", HttpStatus.BAD_REQUEST),
    INVALID_DONATION_AMOUNT(1025, "Donation amount must be exactly {amount} VND", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
