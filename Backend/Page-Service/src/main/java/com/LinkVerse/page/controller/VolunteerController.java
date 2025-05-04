package com.LinkVerse.page.controller;

import com.LinkVerse.page.dto.ApiResponse;
import com.LinkVerse.page.dto.request.VolunteerRequest;
import com.LinkVerse.page.dto.response.VolunteerResponse;
import com.LinkVerse.page.entity.Volunteer;
import com.LinkVerse.page.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/volunteers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VolunteerController {

    VolunteerService volunteerService;

    // Đăng ký tham gia tình nguyện
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<VolunteerResponse>> apply(@RequestBody @Valid VolunteerRequest request) {
        log.info("Received request to apply for volunteering, campaignId: {}", request.getCampaignId());
        ApiResponse<VolunteerResponse> response = volunteerService.apply(request);
        return ResponseEntity.ok(response);
    }

    // Lấy danh sách tình nguyện viên theo chiến dịch
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<ApiResponse<List<VolunteerResponse>>> getVolunteersByCampaign(@PathVariable String campaignId) {
        log.info("Fetching volunteers for campaign: {}", campaignId);
        ApiResponse<List<VolunteerResponse>> response = volunteerService.getVolunteersByCampaign(campaignId);
        return ResponseEntity.ok(response);
    }

    // Lấy danh sách tình nguyện viên với phân trang
    @GetMapping("/campaign/{campaignId}/paged")
    public ResponseEntity<ApiResponse<Page<VolunteerResponse>>> getVolunteersByCampaignWithPagination(
            @PathVariable String campaignId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching volunteers for campaign: {} with pagination, page: {}, size: {}", campaignId, page, size);
        Pageable pageable = PageRequest.of(page, size);
        ApiResponse<Page<VolunteerResponse>> response = volunteerService.getVolunteersByCampaignWithPagination(campaignId, pageable);
        return ResponseEntity.ok(response);
    }

    // Cập nhật trạng thái tình nguyện viên
    @PatchMapping("/{volunteerId}/status")
    public ResponseEntity<ApiResponse<VolunteerResponse>> updateVolunteerStatus(
            @PathVariable String volunteerId,
            @RequestParam Volunteer.Status status) {
        log.info("Updating volunteer status, volunteerId: {}, new status: {}", volunteerId, status);
        ApiResponse<VolunteerResponse> response = volunteerService.updateVolunteerStatus(volunteerId, status);
        return ResponseEntity.ok(response);
    }

    // Hủy đăng ký tình nguyện
    @DeleteMapping("/{volunteerId}")
    public ResponseEntity<ApiResponse<Void>> cancelVolunteer(@PathVariable String volunteerId) {
        log.info("Cancelling volunteer registration, volunteerId: {}", volunteerId);
        ApiResponse<Void> response = volunteerService.cancelVolunteer(volunteerId);
        return ResponseEntity.ok(response);
    }
}
