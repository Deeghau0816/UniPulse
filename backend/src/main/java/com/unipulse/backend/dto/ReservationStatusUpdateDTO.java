package com.unipulse.backend.dto;

import com.unipulse.backend.model.Reservation.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin status update actions (APPROVE / REJECT / CANCEL).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private ReservationStatus status;

    // Required for REJECTED or CANCELLED actions
    private String reason;

    // Admin identifier who performed the action
    private String reviewedBy;
}
