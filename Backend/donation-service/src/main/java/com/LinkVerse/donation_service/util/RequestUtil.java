package com.LinkVerse.donation_service.util;

import jakarta.servlet.http.HttpServletRequest;

public class RequestUtil {
    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            return request.getRemoteAddr(); // Lấy IP trực tiếp
        }
        return ip.split(",")[0].trim(); // Lấy IP đầu tiên từ chuỗi X-Forwarded-For
    }
}
