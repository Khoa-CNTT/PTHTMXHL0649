package com.LinkVerse.page.controller;

import com.LinkVerse.page.dto.ApiResponse;
import com.LinkVerse.page.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/volunteers/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    // Lưu thời gian rảnh
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> setAvailability(@RequestBody List<String> availability) {
        //Lưu thời gian rảnh
        ApiResponse<Void> response = availabilityService.saveAvailability(availability);
        return ResponseEntity.ok(response);
    }

    // Lấy thời gian rảnh
    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getAvailability() {
        //Lấy thời gian rảnh
        ApiResponse<List<String>> response = availabilityService.getAvailability();
        return ResponseEntity.ok(response);
    }
}
