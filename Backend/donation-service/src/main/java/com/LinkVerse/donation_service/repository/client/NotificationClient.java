package com.LinkVerse.donation_service.repository.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.LinkVerse.donation_service.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.event.dto.BillEmailRequest;

@FeignClient(
        name = "notification-service",
        url = "${app.services.notification}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface NotificationClient {
    @PostMapping("/email/bill")
    ApiResponse<Void> sendBillEmail(@RequestBody BillEmailRequest request);

    @GetMapping("/email/user/id")
    ResponseEntity<String> getUserEmailById(@RequestParam("id") String id);
}
