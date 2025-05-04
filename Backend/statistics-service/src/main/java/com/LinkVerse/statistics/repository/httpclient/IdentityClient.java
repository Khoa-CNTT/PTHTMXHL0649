package com.LinkVerse.statistics.repository.httpclient;

import com.LinkVerse.statistics.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.statistics.dto.ApiResponse;
import com.LinkVerse.statistics.dto.GroupResponse;
import com.LinkVerse.statistics.dto.GroupSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "identity-service", url = "${identity-service.url}/identity", configuration = {AuthenticationRequestInterceptor.class})
public interface IdentityClient {

    @GetMapping("/groups/top10")
    ApiResponse<List<GroupResponse>> getTop10GroupsByMembers();
}

