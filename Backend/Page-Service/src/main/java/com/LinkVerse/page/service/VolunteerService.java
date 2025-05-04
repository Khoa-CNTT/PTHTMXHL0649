package com.LinkVerse.page.service;

import com.LinkVerse.page.dto.ApiResponse;
import com.LinkVerse.page.dto.request.VolunteerRequest;
import com.LinkVerse.page.dto.response.CampaignResponse;
import com.LinkVerse.page.dto.response.VolunteerResponse;
import com.LinkVerse.page.entity.Volunteer;
import com.LinkVerse.page.exception.AppException;
import com.LinkVerse.page.exception.ErrorCode;
import com.LinkVerse.page.mapper.VolunteerMapper;
import com.LinkVerse.page.repository.VolunteerRepository;
import com.LinkVerse.page.repository.client.CampaignClient;
import com.LinkVerse.page.repository.client.IdentityServiceClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VolunteerService {

    VolunteerRepository volunteerRepository;
    VolunteerMapper volunteerMapper;
    CampaignClient campaignClient;
    IdentityServiceClient identityServiceClient;

    @Transactional
    public ApiResponse<VolunteerResponse> apply(VolunteerRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        log.info("User {} applying to volunteer for campaign {}", userId, request.getCampaignId());

        // Lấy campaign qua Feign client
        ApiResponse<CampaignResponse> campaignResponse = campaignClient.getCampaignById(request.getCampaignId());

        if (campaignResponse.getResult() == null) {
            throw new AppException(ErrorCode.CAMPAIGN_NOT_FOUND);
        }
        // Check campaign status
        ApiResponse<String> campaignStatusResponse = campaignClient.getCampaignStatus(request.getCampaignId());
        String campaignStatus = campaignStatusResponse.getResult();
        if ("FINISHED".equalsIgnoreCase(campaignStatus)) {
            throw new AppException(ErrorCode.CAMPAIGN_CLOSED);  // Define CAMPAIGN_CLOSED in ErrorCode
        }
        // Kiểm tra đã tham gia chưa
        volunteerRepository.findByUserIdAndCampaignId(userId, request.getCampaignId())
                .ifPresent(v -> {
                    throw new AppException(ErrorCode.ALREADY_VOLUNTEERED);
                });

        // Lưu volunteer
        Volunteer volunteer = Volunteer.builder()
                .userId(userId)
                .campaignId(request.getCampaignId())
                .message(request.getMessage())
                .status(Volunteer.Status.PENDING)
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        volunteer = volunteerRepository.save(volunteer);

        VolunteerResponse response = volunteerMapper.toVolunteerResponse(volunteer);

        return ApiResponse.<VolunteerResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Applied to volunteer successfully")
                .result(response)
                .build();
    }


    @Transactional
    public ApiResponse<List<VolunteerResponse>> getVolunteersByCampaign(String campaignId) {
        String receiverId = getReceiverIdFromCampaign(campaignId);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !receiverId.equals(userId)) {
            throw new AppException(ErrorCode.PERMISSION_DENIED);
        }

        List<Volunteer> volunteers = volunteerRepository.findByCampaignId(campaignId);
        List<VolunteerResponse> responses = volunteers.stream()
                .map(volunteerMapper::toVolunteerResponse)
                .toList();

        return ApiResponse.<List<VolunteerResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Retrieved volunteers successfully")
                .result(responses)
                .build();
    }


    @Transactional
    public ApiResponse<Page<VolunteerResponse>> getVolunteersByCampaignWithPagination(String campaignId, Pageable pageable) {
        String receiverId = getReceiverIdFromCampaign(campaignId);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !receiverId.equals(userId)) {
            throw new AppException(ErrorCode.PERMISSION_DENIED);
        }

        Page<Volunteer> volunteerPage = volunteerRepository.findByCampaignId(campaignId, pageable);
        List<VolunteerResponse> responses = volunteerPage.getContent().stream()
                .map(volunteerMapper::toVolunteerResponse)
                .toList();

        return ApiResponse.<Page<VolunteerResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Retrieved volunteers successfully")
                .result(new PageImpl<>(responses, pageable, volunteerPage.getTotalElements()))
                .build();
    }


    @Transactional
    public ApiResponse<VolunteerResponse> updateVolunteerStatus(String volunteerId, Volunteer.Status status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new AppException(ErrorCode.VOLUNTEER_NOT_FOUND));

        String receiverId = getReceiverIdFromCampaign(volunteer.getCampaignId());
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !receiverId.equals(userId)) {
            throw new AppException(ErrorCode.PERMISSION_DENIED);
        }

        volunteer.setStatus(status);
        volunteer.setUpdatedAt(LocalDateTime.now());
        volunteer = volunteerRepository.save(volunteer);

        return ApiResponse.<VolunteerResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Volunteer status updated successfully")
                .result(volunteerMapper.toVolunteerResponse(volunteer))
                .build();
    }


    @Transactional
    public ApiResponse<Void> cancelVolunteer(String volunteerId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new AppException(ErrorCode.VOLUNTEER_NOT_FOUND));

        ApiResponse<CampaignResponse> campaignResponse = campaignClient.getCampaignById(volunteer.getCampaignId());
        if (campaignResponse.getResult() == null) {
            throw new AppException(ErrorCode.CAMPAIGN_NOT_FOUND);
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !volunteer.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.PERMISSION_DENIED);
        }

        volunteerRepository.delete(volunteer);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Volunteer registration cancelled successfully")
                .build();
    }

    public boolean isCampaignCreator(String volunteerId, String userId) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new AppException(ErrorCode.VOLUNTEER_NOT_FOUND));

        ApiResponse<CampaignResponse> campaignResponse = campaignClient.getCampaignById(volunteer.getCampaignId());
        if (campaignResponse.getResult() == null) {
            throw new AppException(ErrorCode.CAMPAIGN_NOT_FOUND);
        }

        return campaignResponse.getResult().getReceiverId().equals(userId);
    }

    public boolean isVolunteerUser(String volunteerId, String userId) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new AppException(ErrorCode.VOLUNTEER_NOT_FOUND));
        return volunteer.getUserId().equals(userId);
    }

    public boolean isCampaignCreatorByCampaignId(String campaignId, String userId) {
        ApiResponse<CampaignResponse> campaignResponse = campaignClient.getCampaignById(campaignId);
        if (campaignResponse.getResult() == null) {
            throw new AppException(ErrorCode.CAMPAIGN_NOT_FOUND);
        }

        return campaignResponse.getResult().getReceiverId().equals(userId);
    }

    private String getReceiverIdFromCampaign(String campaignId) {
        ApiResponse<String> receiverResponse = campaignClient.getCampaignReceiver(campaignId);
        if (receiverResponse.getResult() == null) {
            throw new AppException(ErrorCode.CAMPAIGN_NOT_FOUND);
        }
        return receiverResponse.getResult();
    }

}
