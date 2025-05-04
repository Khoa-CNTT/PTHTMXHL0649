package com.LinkVerse.donation_service.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.LinkVerse.donation_service.dto.ApiResponse;
import com.LinkVerse.donation_service.dto.request.MainAdCampaignRequest;
import com.LinkVerse.donation_service.dto.response.MainAdCampaignResponse;
import com.LinkVerse.donation_service.entity.MainAdCampaign;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.mapper.MainAdCampaignMapper;
import com.LinkVerse.donation_service.repository.MainAdCampaignRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MainAdCampaignService {
    private final MainAdCampaignRepository mainAdCampaignRepository;
    private final MainAdCampaignMapper mainAdCampaignMapper;

    @Transactional
    public ApiResponse<MainAdCampaignResponse> createMainAdCampaign(MainAdCampaignRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // Check admin role
        if (!isAdmin(authentication)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        MainAdCampaign mainAdCampaign = MainAdCampaign.builder()
                .title(request.getTitle())
                .targetAmount(request.getTargetAmount())
                .adminId(currentUserId)
                .build();

        mainAdCampaign = mainAdCampaignRepository.save(mainAdCampaign);

        return ApiResponse.<MainAdCampaignResponse>builder()
                .code(200)
                .message("Main ad campaign created successfully")
                .result(mainAdCampaignMapper.toMainAdCampaignResponse(mainAdCampaign))
                .build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
}
