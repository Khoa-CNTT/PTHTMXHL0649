package com.LinkVerse.profile.exception;

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
    FRIEND_ALREADY_REQUESTED(1012, "Friend request already sent", HttpStatus.BAD_REQUEST),
    FRIEND_ALREADY(1013, "Already friends", HttpStatus.BAD_REQUEST),
    FRIEND_BLOCKED(1014, "You have blocked this user", HttpStatus.BAD_REQUEST),
    QR_TOKEN_INVALID(1015, "QR token invalid", HttpStatus.BAD_REQUEST),
    QR_DECODE_FAIL(1016, "QR decode fail", HttpStatus.BAD_REQUEST),
    QR_NOT_FOUND(1017, "QR not found", HttpStatus.BAD_REQUEST),
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
