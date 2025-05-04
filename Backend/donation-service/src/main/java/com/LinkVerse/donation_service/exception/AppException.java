package com.LinkVerse.donation_service.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private ErrorCode errorCode;

    // Constructor với một tham số
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    // Constructor với hai tham số
    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }
}
