package com.LinkVerse.statistics.service;

import com.LinkVerse.statistics.dto.DonationStatisticDTO;
import com.LinkVerse.statistics.entity.DonationStatics;
import com.LinkVerse.statistics.repository.DonationStatisticRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationStatisticService {

    private final DonationStatisticRepository donationStatisticRepository;

    public List<DonationStatisticDTO> getDonationStatisticsByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<DonationStatics> donations = donationStatisticRepository.findAllByPaymentTimeBetween(start, end);

        return donations.stream()
                .collect(Collectors.groupingBy(
                        donation -> donation.getStatus(),
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            long totalAmount = list.stream().mapToLong(DonationStatics::getAmount).sum();
                            return new DonationStatisticDTO(
                                    list.get(0).getStatus(),
                                    list.size(),
                                    totalAmount
                            );
                        })
                ))
                .values()
                .stream()
                .sorted((a, b) -> a.getStatus().compareTo(b.getStatus()))
                .collect(Collectors.toList());
    }

    public List<DonationStatisticDTO> getDonationStatisticsForToday() {
        LocalDate now = LocalDate.now();
        return getDonationStatisticsByDateRange(now, now);
    }

    public List<DonationStatisticDTO> getDonationStatisticsForThisMonth() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        return getDonationStatisticsByDateRange(startOfMonth, now);
    }

    public List<DonationStatisticDTO> getDonationStatisticsForThisYear() {
        LocalDate now = LocalDate.now();
        LocalDate startOfYear = now.withDayOfYear(1);
        return getDonationStatisticsByDateRange(startOfYear, now);
    }
}
