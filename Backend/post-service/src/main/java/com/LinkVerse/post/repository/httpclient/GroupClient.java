package com.LinkVerse.post.repository.httpclient;

import com.LinkVerse.identity.entity.Group;
import com.LinkVerse.post.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.post.dto.request.GroupRequest;
import com.LinkVerse.post.dto.response.GroupResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Connection to identity-service
@FeignClient(name = "identity-service", url = "http://localhost:8080/identity", configuration = {AuthenticationRequestInterceptor.class})
public interface GroupClient {

    @PostMapping("/groups")
    GroupResponse createGroup(@RequestBody GroupRequest request);

    @GetMapping("/groups/{groupId}")
    Group getGroup(@PathVariable("groupId") String groupId);
}
