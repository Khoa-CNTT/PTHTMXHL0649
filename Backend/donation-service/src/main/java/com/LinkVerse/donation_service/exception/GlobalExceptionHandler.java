package com.LinkVerse.donation_service.exception;

import java.util.Map;
import java.util.Objects;

import jakarta.validation.ConstraintViolation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.service.TelegramServiceAdmin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";
    private final TelegramServiceAdmin telegramServiceAdmin;

    // ✅ Xử lý tất cả exception không rõ loại
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<String>> handlingRuntimeException(RuntimeException exception) {
        log.error("❌ Exception: ", exception);
        telegramServiceAdmin.send(
                "❌ [EXCEPTION] " + exception.getClass().getSimpleName() + ": " + exception.getMessage());

        return ResponseEntity.badRequest()
                .body(ApiResponse.<String>builder()
                        .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
                        .message(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
                        .result(null)
                        .build());
    }

    // ✅ Xử lý các exception do AppException tự định nghĩa
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<String>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<String>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .result(null)
                        .build());
    }

    // ✅ Truy cập trái phép (Security)
    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<ApiResponse<String>> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<String>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .result(null)
                        .build());
    }

    // ✅ Xử lý lỗi validate @Valid (DTO validation)
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<String>> handlingValidation(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;

        try {
            errorCode = ErrorCode.valueOf(enumKey);

            ConstraintViolation<?> violation =
                    exception.getBindingResult().getAllErrors().getFirst().unwrap(ConstraintViolation.class);

            attributes = violation.getConstraintDescriptor().getAttributes();
            log.info("Validation attributes: {}", attributes);
        } catch (IllegalArgumentException ignored) {
        }

        String message =
                Objects.nonNull(attributes) ? mapAttribute(errorCode.getMessage(), attributes) : errorCode.getMessage();

        return ResponseEntity.badRequest()
                .body(ApiResponse.<String>builder()
                        .code(errorCode.getCode())
                        .message(message)
                        .result(null)
                        .build());
    }

    // Helper để thay thế {min} trong message nếu có
    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));
        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}
