package com.LinkVerse.admin.repository.client;

import com.LinkVerse.admin.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.admin.dto.ApiResponse;
import com.LinkVerse.identity.dto.request.AdminPasswordChangeRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "identity", url = "http://localhost:8080/identity", configuration = {AuthenticationRequestInterceptor.class})
public interface IdentityServiceClient {

    @DeleteMapping("/users/admin/delete/{userId}")
    ResponseEntity<ApiResponse<Void>> deleteUserByAdmin(@PathVariable("userId") String userId);

    @PostMapping("/users/admin/change-password")
    ResponseEntity<ApiResponse<Void>> adminChangePassword(@RequestBody AdminPasswordChangeRequest request);

    @PostMapping("/users/admin/{userId}/lock")
    ResponseEntity<ApiResponse<Void>> lockUser(@PathVariable("userId") String userId);

    @PostMapping("/users/admin/{userId}/unlock")
    ResponseEntity<ApiResponse<Void>> unlockUser(@PathVariable("userId") String userId);
}