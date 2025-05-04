package com.LinkVerse.post.exception;

public class RekognitionException extends RuntimeException {
    public RekognitionException(String message) {
        super(message);
    }

    public RekognitionException(String message, Throwable cause) {
        super(message, cause);
    }
}