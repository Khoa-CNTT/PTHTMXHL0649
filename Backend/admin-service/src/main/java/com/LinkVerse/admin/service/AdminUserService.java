package com.LinkVerse.admin.service;

import com.LinkVerse.admin.dto.ApiResponse;
import com.LinkVerse.admin.repository.client.IdentityServiceClient;
import com.LinkVerse.identity.dto.request.AdminPasswordChangeRequest;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final IdentityServiceClient identityServiceClient;

    public String deleteUserByAdmin(String userId) {
        try {
            ResponseEntity<ApiResponse<Void>> response = identityServiceClient.deleteUserByAdmin(userId);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Xóa tài khoản thành công: {}", response.getBody().getMessage());
                return response.getBody().getMessage();
            } else {
                log.error("Xóa tài khoản thất bại: {}", response.getBody().getMessage());
                throw new RuntimeException(response.getBody().getMessage());
            }
        } catch (FeignException e) {
            log.error("Lỗi khi gọi API xóa tài khoản: {}", e.getMessage());
            throw new RuntimeException("Không thể xóa tài khoản: " + e.getMessage(), e);
        }
    }

    public String adminChangePassword(AdminPasswordChangeRequest request) {
        try {
            ResponseEntity<ApiResponse<Void>> response = identityServiceClient.adminChangePassword(request);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Thay đổi mật khẩu thành công: {}", response.getBody().getMessage());
                return response.getBody().getMessage();
            } else {
                log.error("Thay đổi mật khẩu thất bại: {}", response.getBody().getMessage());
                throw new RuntimeException(response.getBody().getMessage());
            }
        } catch (FeignException e) {
            log.error("Lỗi khi gọi API thay đổi mật khẩu: {}", e.getMessage());
            throw new RuntimeException("Không thể thay đổi mật khẩu: " + e.getMessage(), e);
        }
    }

    public String lockUser(String userId) {
        try {
            ResponseEntity<ApiResponse<Void>> response = identityServiceClient.lockUser(userId);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Khóa tài khoản thành công: {}", response.getBody().getMessage());
                return response.getBody().getMessage();
            } else {
                log.error("Khóa tài khoản thất bại: {}", response.getBody().getMessage());
                throw new RuntimeException(response.getBody().getMessage());
            }
        } catch (FeignException e) {
            log.error("Lỗi khi gọi API khóa tài khoản: {}", e.getMessage());
            throw new RuntimeException("Không thể khóa tài khoản: " + e.getMessage(), e);
        }
    }

    public String unlockUser(String userId) {
        try {
            ResponseEntity<ApiResponse<Void>> response = identityServiceClient.unlockUser(userId);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Mở khóa tài khoản thành công: {}", response.getBody().getMessage());
                return response.getBody().getMessage();
            } else {
                log.error("Mở khóa tài khoản thất bại: {}", response.getBody().getMessage());
                throw new RuntimeException(response.getBody().getMessage());
            }
        } catch (FeignException e) {
            log.error("Lỗi khi gọi API mở khóa tài khoản: {}", e.getMessage());
            throw new RuntimeException("Không thể mở khóa tài khoản: " + e.getMessage(), e);
        }
    }
}