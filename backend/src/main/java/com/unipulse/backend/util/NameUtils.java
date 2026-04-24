package com.unipulse.backend.util;

public final class NameUtils {

    private NameUtils() {
    }

    public static String[] splitFullName(String fullName) {
        if (fullName == null) {
            return new String[]{"", ""};
        }

        String normalized = fullName.trim().replaceAll("\\s+", " ");
        if (normalized.isEmpty()) {
            return new String[]{"", ""};
        }

        String[] parts = normalized.split(" ", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";
        return new String[]{firstName, lastName};
    }

    public static String buildFullName(String firstName, String lastName) {
        String safeFirstName = firstName == null ? "" : firstName.trim();
        String safeLastName = lastName == null ? "" : lastName.trim();
        return (safeFirstName + " " + safeLastName).trim();
    }
}
