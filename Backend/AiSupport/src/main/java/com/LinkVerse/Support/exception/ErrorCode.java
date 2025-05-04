package com.LinkVerse.Support.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    USER_NOT_FOUND(1008, "User not found", HttpStatus.NOT_FOUND),
    GROUP_NOT_FOUND(1009, "Group not found", HttpStatus.NOT_FOUND),
    FORBIDDEN(1010, "Forbidden", HttpStatus.FORBIDDEN),
    PERMISSION_DENIED(1011, "Permission denied", HttpStatus.FORBIDDEN),
    USER_EXISTED(1012, "User existed", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR(1013, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
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
