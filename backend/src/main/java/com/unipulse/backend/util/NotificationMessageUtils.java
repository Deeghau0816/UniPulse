package com.unipulse.backend.util;

import com.unipulse.backend.model.Role;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class NotificationMessageUtils {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM dd, yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private NotificationMessageUtils() {
    }

    public static String formatEventTimestamp(LocalDateTime timestamp) {
        return timestamp.format(DATE_FORMATTER) + " at " + timestamp.format(TIME_FORMATTER);
    }

    public static String formatRole(Role role) {
        if (role == null) {
            return "Unknown Role";
        }

        return switch (role) {
            case STUDENT -> "Student";
            case ACADEMIC -> "Academic Staff";
            case NON_ACADEMIC -> "Non-Academic Staff";
            case TECHNICIAN -> "Technician";
            case SYSTEM_ADMIN -> "System Admin";
        };
    }

    public static String describeDevice(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Unknown device";
        }

        String normalized = userAgent.toLowerCase(Locale.ENGLISH);
        return detectBrowser(normalized) + " on " + detectOperatingSystem(normalized);
    }

    private static String detectBrowser(String userAgent) {
        if (userAgent.contains("edg/")) {
            return "Microsoft Edge";
        }
        if (userAgent.contains("opr/") || userAgent.contains("opera")) {
            return "Opera";
        }
        if (userAgent.contains("chrome/")) {
            return "Chrome";
        }
        if (userAgent.contains("safari/")) {
            return "Safari";
        }
        if (userAgent.contains("firefox/")) {
            return "Firefox";
        }
        if (userAgent.contains("trident/") || userAgent.contains("msie")) {
            return "Internet Explorer";
        }
        return "Web browser";
    }

    private static String detectOperatingSystem(String userAgent) {
        if (userAgent.contains("iphone")) {
            return "iPhone";
        }
        if (userAgent.contains("ipad")) {
            return "iPad";
        }
        if (userAgent.contains("android")) {
            return "Android";
        }
        if (userAgent.contains("windows")) {
            return "Windows";
        }
        if (userAgent.contains("mac os x") || userAgent.contains("macintosh")) {
            return "macOS";
        }
        if (userAgent.contains("linux")) {
            return "Linux";
        }
        return "Unknown OS";
    }
}
