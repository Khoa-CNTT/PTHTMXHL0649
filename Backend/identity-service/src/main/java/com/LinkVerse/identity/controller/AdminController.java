package com.LinkVerse.identity.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.identity.dto.request.AdminPasswordChangeRequest;
import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.identity.exception.AppException;
import com.LinkVerse.identity.service.AuthenticationService;
import com.LinkVerse.identity.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminController {
    UserService userService;
    AuthenticationService authenticationService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/admin/delete/{userId}")
    public ApiResponse<Void> deleteUserByAdmin(@PathVariable String userId) {
        try {
            userService.deleteUserByAdmin(userId);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.OK.value())
                    .message("User has been permanently deleted by QTV.")
                    .build();
        } catch (AppException ex) {
            return ApiResponse.<Void>builder()
                    .code(ex.getErrorCode().getCode())
                    .message(ex.getErrorCode().getMessage())
                    .build();
        } catch (Exception ex) {
            log.error("Admin failed to delete user", ex);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("An error occurred while deleting user by admin")
                    .build();
        }
    }

    @PostMapping("/admin/change-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> adminChangePassword(@RequestBody @Valid AdminPasswordChangeRequest request) {
        try {
            authenticationService.adminChangeUserPassword(request);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.OK.value())
                    .message("User's password updated successfully.")
                    .build();

        } catch (AppException ex) {
            return ApiResponse.<Void>builder()
                    .code(ex.getErrorCode().getCode())
                    .message(ex.getErrorCode().getMessage())
                    .build();

        } catch (Exception ex) {
            log.error("Admin failed to change user password", ex);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("An error occurred while admin changing user password")
                    .build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{userId}/lock")
    public ApiResponse<Void> lockUser(@PathVariable String userId) {
        try {
            userService.lockUser(userId);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.OK.value())
                    .message("User locked successfully.")
                    .build();
        } catch (AppException ex) {
            return ApiResponse.<Void>builder()
                    .code(ex.getErrorCode().getCode())
                    .message(ex.getErrorCode().getMessage())
                    .build();
        } catch (Exception ex) {
            log.error("Admin failed to lock user", ex);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("An error occurred while locking user")
                    .build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{userId}/unlock")
    public ApiResponse<Void> unlockUser(@PathVariable String userId) {
        try {
            userService.unlockUser(userId);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.OK.value())
                    .message("User unlocked successfully.")
                    .build();
        } catch (AppException ex) {
            return ApiResponse.<Void>builder()
                    .code(ex.getErrorCode().getCode())
                    .message(ex.getErrorCode().getMessage())
                    .build();
        } catch (Exception ex) {
            log.error("Admin failed to unlock user", ex);
            return ApiResponse.<Void>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("An error occurred while unlocking user")
                    .build();
        }
    }
}
