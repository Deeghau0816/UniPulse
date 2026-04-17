package com.unipulse.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for creating a new Reservation (POST /api/reservations).
 * Renamed from "BookingRequest" to avoid the "booking" terminology.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequestDTO {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotBlank(message = "User ID is required")
    private String userId;

    private String userName;

    @NotNull(message = "Reservation date is required")
    @FutureOrPresent(message = "Reservation date cannot be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reservationDate;

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @Min(value = 1, message = "At least 1 attendee required")
    private Integer expectedAttendees;

    @NotBlank(message = "Purpose is required")
    @Size(min = 10, max = 1000, message = "Purpose must be between 10 and 1000 characters")
    private String purpose;

    @Size(max = 500, message = "Special notes cannot exceed 500 characters")
    private String specialNotes;
}
