package com.LinkVerse.page.repository.client;

import com.LinkVerse.page.configuration.AuthenticationRequestInterceptor;
import com.LinkVerse.page.dto.ApiResponse;
import com.LinkVerse.page.dto.response.CampaignResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
        name = "donation-service",
        url = "${app.services.campaign}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface CampaignClient {
    @GetMapping("/campaigns/{id}")
    ApiResponse<CampaignResponse> getCampaignById(@PathVariable("id") String id);

    @GetMapping("/campaigns")
    ApiResponse<List<CampaignResponse>> getAllCampaigns();

    @GetMapping("/campaigns/{campaignId}/receiver")
    ApiResponse<String> getCampaignReceiver(@PathVariable("campaignId") String campaignId);

    @GetMapping("/campaigns/{campaignId}/status")
    ApiResponse<String> getCampaignStatus(@PathVariable("campaignId") String campaignId);
}
