package com.LinkVerse.post.repository.client;

import com.LinkVerse.post.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "profile", url = "http://localhost:8081/profile", configuration = {AuthenticationRequestInterceptor.class})
public interface ProfileServiceClient {
    @PutMapping("/{userId}")
    void updateImage(@PathVariable("userId") String userId, @RequestParam("imageFile") String imageFile);

    @GetMapping("/friends/check/are-friends")
    boolean areFriends(@RequestParam("userId1") String userId1, @RequestParam("userId2") String userId2);

    @GetMapping("/friends/check/is-blocked")
    boolean isBlocked(@RequestParam("userId1") String userId1, @RequestParam("userId2") String userId2);
}