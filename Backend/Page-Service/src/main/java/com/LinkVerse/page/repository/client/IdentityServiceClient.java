package com.LinkVerse.page.repository.client;

import com.LinkVerse.page.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity", url = "http://localhost:8080/identity", configuration = {AuthenticationRequestInterceptor.class})
public interface IdentityServiceClient {

    @GetMapping("/groups/{groupId}/isPublic")
    boolean isPublic(@PathVariable String groupId);

    @GetMapping("/identity/users/{userId}")
    void getUser(@PathVariable("userId") String userId);

    @GetMapping("/groups/{groupId}/isUserInGroup")
    boolean isUserInGroup(@PathVariable String groupId);

    @GetMapping("/groups/{groupId}/isOwnerOrLeader")
    boolean isOwnerOrLeader(@PathVariable String groupId);
}