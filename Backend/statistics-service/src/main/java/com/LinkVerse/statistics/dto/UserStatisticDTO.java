package com.LinkVerse.statistics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatisticDTO {
    private long totalUsers;
    private long maleUsers;
    private long femaleUsers;
    private long otherUsers;
    private long onlineUsers;
    private long offlineUsers;
    private double onlinePercentage;
    private long registeredToday;
    private long registeredThisMonth;
    private long registeredThisYear;
}