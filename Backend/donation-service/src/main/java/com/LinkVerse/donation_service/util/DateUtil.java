package com.LinkVerse.donation_service.util;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class DateUtil {
    protected static final SimpleDateFormat ISO_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");
    protected static final SimpleDateFormat VNPAY_DATE_FORMAT = new SimpleDateFormat("yyyyMMddHHmmss");
    public static final Calendar VN_CALENDAR = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));

    public static Date parseISO(String date) {
        try {
            return ISO_DATE_FORMAT.parse(date);
        } catch (Exception e) {
            return null;
        }
    }

    public static long getDiffInDays(LocalDate date1, LocalDate date2) {
        return ChronoUnit.DAYS.between(date1, date2);
    }

    public static LocalDate parse(String date) {
        return LocalDate.parse(date);
    }

    public static String getVnTime() {
        return VNPAY_DATE_FORMAT.format(VN_CALENDAR.getTime());
    }

    public static String formatVnTime(Calendar calendar) {
        return VNPAY_DATE_FORMAT.format(calendar.getTime());
    }
}
