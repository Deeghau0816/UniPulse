package com.unipulse.backend.Controller;

import com.unipulse.backend.dto.*;
import com.unipulse.backend.model.Reservation.ReservationStatus;
import com.unipulse.backend.model.ReservationResource.ResourceType;
import com.unipulse.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Module B – Reservation Management.
 *
 * Endpoints implemented (Member 2):
 *   POST   /api/reservations                  – Create new reservation
 *   GET    /api/reservations/user/{userId}    – Get user's reservations
 *   GET    /api/reservations/summary/{userId} – Get user dashboard summary
 *   GET    /api/reservations                  – Admin: get all reservations
 *   PUT    /api/reservations/{id}/status      – Admin: approve/reject/cancel
 *   DELETE /api/reservations/{id}             – Cancel/delete a reservation
 *   GET    /api/reservations/calendar         – Calendar date-range query
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {

    private final ReservationService reservationService;

    // ─── POST: Create Reservation ─────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponseDTO>> createReservation(
            @Valid @RequestBody ReservationRequestDTO requestDTO) {
        ReservationResponseDTO created = reservationService.createReservation(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reservation request submitted successfully", created));
    }

    // ─── GET: User's Reservations ─────────────────────────────────────────────────
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReservationResponseDTO>>> getUserReservations(
            @PathVariable String userId) {
        List<ReservationResponseDTO> reservations = reservationService.getReservationsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Reservations retrieved successfully", reservations));
    }

    // ─── GET: User Summary (Dashboard Cards) ─────────────────────────────────────
    @GetMapping("/summary/{userId}")
    public ResponseEntity<ApiResponse<ReservationSummaryDTO>> getUserSummary(
            @PathVariable String userId) {
        ReservationSummaryDTO summary = reservationService.getReservationSummaryByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Summary retrieved successfully", summary));
    }

    // ─── GET: All Reservations (Admin) with optional filters ─────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResponseDTO>>> getAllReservations(
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) ResourceType resourceType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<ReservationResponseDTO> reservations;
        if (status != null || resourceType != null || date != null) {
            reservations = reservationService.getReservationsWithFilters(status, resourceType, date);
        } else {
            reservations = reservationService.getAllReservations();
        }
        return ResponseEntity.ok(ApiResponse.success("Reservations retrieved successfully", reservations));
    }

    // ─── GET: Single Reservation ──────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponseDTO>> getReservationById(@PathVariable Long id) {
        ReservationResponseDTO reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation retrieved successfully", reservation));
    }

    // ─── PUT: Update Reservation Details ───────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponseDTO>> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequestDTO requestDTO) {
        ReservationResponseDTO updated = reservationService.updateReservation(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Reservation updated successfully", updated));
    }

    // ─── PUT: Update Status (Admin: Approve / Reject / Cancel) ───────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ReservationResponseDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReservationStatusUpdateDTO updateDTO) {
        ReservationResponseDTO updated = reservationService.updateReservationStatus(id, updateDTO);
        return ResponseEntity.ok(ApiResponse.success(
                "Reservation status updated to " + updateDTO.getStatus(), updated));
    }

    // ─── DELETE: Admin delete reservation ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation deleted successfully", null));
    }

    // ─── DELETE: User cancels own approved reservation ────────────────────────────
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponseDTO>> cancelReservation(
            @PathVariable Long id,
            @RequestParam String userId) {
        ReservationResponseDTO cancelled = reservationService.cancelReservation(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully", cancelled));
    }

    // ─── GET: Calendar view by date range ────────────────────────────────────────
    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<ReservationResponseDTO>>> getCalendarView(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ReservationResponseDTO> reservations =
                reservationService.getReservationsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Calendar data retrieved", reservations));
    }
}
