package com.LinkVerse.admin.controller;

import com.LinkVerse.admin.service.AdminUserService;
import com.LinkVerse.identity.dto.request.AdminPasswordChangeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
//@RequestMapping("")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        String message = adminUserService.deleteUserByAdmin(userId);
        return ResponseEntity.ok(message);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody AdminPasswordChangeRequest request) {
        String message = adminUserService.adminChangePassword(request);
        return ResponseEntity.ok(message);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/lock")
    public ResponseEntity<String> lockUser(@PathVariable String userId) {
        String message = adminUserService.lockUser(userId);
        return ResponseEntity.ok(message);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/unlock")
    public ResponseEntity<String> unlockUser(@PathVariable String userId) {
        String message = adminUserService.unlockUser(userId);
        return ResponseEntity.ok(message);
    }
}