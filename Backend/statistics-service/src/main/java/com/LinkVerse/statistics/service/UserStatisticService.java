package com.LinkVerse.statistics.service;

import com.LinkVerse.statistics.dto.UserStatisticDTO;
import com.LinkVerse.statistics.entity.Gender;
import com.LinkVerse.statistics.entity.UserStatus;
import com.LinkVerse.statistics.repository.UserStatisticRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserStatisticService {

    private final UserStatisticRepository userStatisticRepository;

    public UserStatisticDTO calculateUserStatistics() {
        long total = userStatisticRepository.count();
        long male = userStatisticRepository.countByGender(Gender.MALE);
        long female = userStatisticRepository.countByGender(Gender.FEMALE);
        long other = userStatisticRepository.countByGender(Gender.OTHER);
        long online = userStatisticRepository.countByStatus(UserStatus.ONLINE);

        LocalDate now = LocalDate.now();

        long today = userStatisticRepository.countByCreatedAtBetween(
                now.atStartOfDay(), now.plusDays(1).atStartOfDay());

        long thisMonth = userStatisticRepository.countByCreatedAtBetween(
                now.withDayOfMonth(1).atStartOfDay(),
                now.plusMonths(1).withDayOfMonth(1).atStartOfDay());

        long thisYear = userStatisticRepository.countByCreatedAtBetween(
                now.withDayOfYear(1).atStartOfDay(),
                now.plusYears(1).withDayOfYear(1).atStartOfDay());

        return UserStatisticDTO.builder()
                .totalUsers(total)
                .maleUsers(male)
                .femaleUsers(female)
                .otherUsers(other)
                .onlineUsers(online)
                .offlineUsers(total - online)
                .onlinePercentage(total > 0 ? (online * 100.0 / total) : 0.0)
                .registeredToday(today)
                .registeredThisMonth(thisMonth)
                .registeredThisYear(thisYear)
                .build();
    }

    public Map<LocalDate, Long> getRegistrationChart(LocalDate startDate, LocalDate endDate) {
        return userStatisticRepository.findAllByCreatedAtBetween(
                        startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay())
                .stream()
                .collect(Collectors.groupingBy(
                        u -> u.getCreatedAt().toLocalDate(),
                        Collectors.counting()
                ));
    }
}
