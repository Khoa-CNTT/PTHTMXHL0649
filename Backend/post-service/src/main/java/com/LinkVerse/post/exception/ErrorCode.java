package com.LinkVerse.post.exception;

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
    SDK_CLIENT_EXCEPTION(1012, "SDK client exception", HttpStatus.INTERNAL_SERVER_ERROR),
    VIOLATION_POLICY(1013, "VIOLATION_POLICY", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1014, "User not existed", HttpStatus.NOT_FOUND),
    GROUP_ALREADY_EXISTS(1015, "Group already exists", HttpStatus.BAD_REQUEST),
    GROUP_NOT_EXISTED(1016, "Group not existed", HttpStatus.NOT_FOUND),
    ALREADY_MEMBER(1017, "Already member", HttpStatus.BAD_REQUEST),
    HASTAG_NOTFOUND(1018, "Hashtag not found", HttpStatus.NOT_FOUND),
    POST_NOT_FOUND(1019, "Post not found", HttpStatus.NOT_FOUND),
    COMMENT_NOT_FOUND(1020, "Comment not found", HttpStatus.NOT_FOUND),
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
