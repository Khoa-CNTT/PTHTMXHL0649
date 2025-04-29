package com.LinkVerse.profile.controller;

import jakarta.validation.constraints.Min;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.LinkVerse.profile.dto.ApiResponse;
import com.LinkVerse.profile.dto.PageResponse;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.service.SearchService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchController {

    SearchService searchService;

    @GetMapping("/sorts")
    ApiResponse<PageResponse<UserProfileResponse>> getUsersWithSortsBy(
            @RequestParam(defaultValue = "0", required = false) int page,
            @Min(2) @RequestParam(defaultValue = "3", required = false) int size,
            @RequestParam(required = false) String... sorts) {
        return ApiResponse.<PageResponse<UserProfileResponse>>builder()
                .result(searchService.getUsersWithSortsByMultipleColumn(page, size, sorts))
                .build();
    }

    @GetMapping("/search")
    ApiResponse<PageResponse<UserProfileResponse>> getUsersWithSortByColumnAndSearch(
            @RequestParam(defaultValue = "0", required = false) int page,
            @RequestParam(defaultValue = "3", required = false) int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy) {
        return ApiResponse.<PageResponse<UserProfileResponse>>builder()
                .result(searchService.getUsersWithSortByColumnAndSearch(page, size, search, sortBy))
                .build();
    }

    @GetMapping("/criteria-search")
    ApiResponse<PageResponse<UserProfileResponse>> advancedSearchByCriteria(
            @RequestParam(defaultValue = "0", required = false) int page,
            @Min(2) @RequestParam(defaultValue = "3", required = false) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String... search // =String[] search
            ) {
        return ApiResponse.<PageResponse<UserProfileResponse>>builder()
                .result(searchService.advancedSearchByCriteria(page, size, sortBy, search))
                .build();
    }
}
