package com.LinkVerse.identity.dto.request;

import lombok.Data;

@Data
public class AdminPasswordChangeRequest {
    private String userId;
    private String newPassword;
    private String confirmPassword;
}
