package com.LinkVerse.identity.service.report;

import java.util.List;

import org.springframework.stereotype.Service;

import com.LinkVerse.identity.dto.response.UserResponse;
import com.LinkVerse.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final UserRepository userRepository;

    public List<UserResponse> getUserReportData() {
        return userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .build())
                .toList();
    }
}
