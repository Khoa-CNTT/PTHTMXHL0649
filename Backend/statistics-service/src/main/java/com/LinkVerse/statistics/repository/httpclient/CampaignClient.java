package com.LinkVerse.statistics.repository.httpclient;

import com.LinkVerse.statistics.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.time.LocalDateTime;

@FeignClient(name = "donation-service", url = "${donation-service.url}/donation", configuration = {AuthenticationRequestInterceptor.class})
public interface CampaignClient {

    @GetMapping("/campaigns/average-completion-time")
    double getAverageCompletionTimeInDays(
            @RequestParam("startDate") Instant startDate,
            @RequestParam("endDate") Instant endDate
    );
}


