package com.LinkVerse.post.repository.client;

import com.LinkVerse.post.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "notification-service", url = "${app.services.notification}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface NotificationClient {
    @PostMapping("/email/send-support-join-url")
    ResponseEntity<Void> sendSupportJoinUrl(@RequestParam("email") String email, @RequestParam("joinUrl") String joinUrl);

}