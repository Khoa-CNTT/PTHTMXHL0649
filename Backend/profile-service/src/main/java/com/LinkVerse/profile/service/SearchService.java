package com.LinkVerse.profile.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.LinkVerse.profile.dto.PageResponse;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.mapper.UserProfileMapper;
import com.LinkVerse.profile.repository.SearchRepository.SearchRepository;
import com.LinkVerse.profile.repository.UserProfileRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SearchService {
    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;
    SearchRepository searchRepository;
    FriendService friendService;

    // 0
    public PageResponse<UserProfileResponse> getUsersWithSortsByMultipleColumn(
            int pageNo, int pageSize, String... sorts) {
        int p = 0;
        if (pageNo > 0) {
            p = pageNo - 1;
        }
        List<Sort.Order> orders = new ArrayList<>();
        if (sorts != null) {
            for (String sortBy : sorts) {
                // firstName:asc,lastName:desc
                Pattern pattern = Pattern.compile("(\\w+?)(:)(.*)");
                Matcher matcher = pattern.matcher(sortBy);
                if (matcher.find()) {
                    if (matcher.group(3).equalsIgnoreCase("asc")) {
                        orders.add(new Sort.Order(Sort.Direction.ASC, matcher.group(1)));
                    } else {
                        orders.add(new Sort.Order(Sort.Direction.DESC, matcher.group(1)));
                    }
                }
            }
        }

        Pageable pageable = PageRequest.of(p, pageSize, Sort.by(orders));

        Page<UserProfile> users = userProfileRepository.findAll(pageable);
        return PageResponse.<UserProfileResponse>builder()
                .page(pageNo)
                .size(pageSize)
                .total(users.getTotalPages())
                .items(users.stream()
                        .map(userProfileMapper::toUserProfileReponse)
                        .toList())
                .build();
    }

    // 1
    // SearchService.java
    public PageResponse<UserProfileResponse> getUsersWithSortByColumnAndSearch(
            int pageNo, int pageSize, String search, String sortBy) {

        Page<UserProfile> users = searchRepository.getUsersWithSortByColumnAndSearch(pageNo, pageSize, sortBy, search);
        List<UserProfileResponse> userProfileResponses = users.getContent().stream()
                .map(userProfileMapper::toUserProfileReponse) // Đã bỏ logic lọc blocked user
                .collect(Collectors.toList());

        return PageResponse.<UserProfileResponse>builder()
                .page(users.getNumber())
                .size(users.getSize())
                .total(users.getTotalPages())
                .items(userProfileResponses)
                .build();
    }

    // 2
    public PageResponse<UserProfileResponse> advancedSearchByCriteria(
            int pageNo, int pageSize, String sortBy, String... search) {
        Page<UserProfile> users = searchRepository.advancedSearchUser(pageNo, pageSize, sortBy, search);
        return PageResponse.<UserProfileResponse>builder()
                .page(users.getNumber())
                .size(users.getSize())
                .total(users.getTotalPages())
                .items(users.stream()
                        .map(userProfileMapper::toUserProfileReponse)
                        .toList())
                .build();
    }
    // -------------------------------------------------------------------------------------------------------------------

}
