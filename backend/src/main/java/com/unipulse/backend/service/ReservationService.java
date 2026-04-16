package com.unipulse.backend.service;

import com.unipulse.backend.dto.*;
import com.unipulse.backend.model.Reservation;

import java.time.LocalDate;
import java.util.List;

public interface ReservationService {

    // ─── User Operations ─────────────────────────────────────────────────────────
    ReservationResponseDTO createReservation(ReservationRequestDTO requestDTO);

    List<ReservationResponseDTO> getReservationsByUser(String userId);

    ReservationSummaryDTO getReservationSummaryByUser(String userId);

    ReservationResponseDTO cancelReservation(Long reservationId, String userId);

    ReservationResponseDTO updateReservation(Long reservationId, ReservationRequestDTO requestDTO);

    // ─── Admin Operations ─────────────────────────────────────────────────────────
    List<ReservationResponseDTO> getAllReservations();

    List<ReservationResponseDTO> getReservationsWithFilters(
            Reservation.ReservationStatus status,
            com.unipulse.backend.model.ReservationResource.ResourceType resourceType,
            LocalDate date
    );

    ReservationResponseDTO updateReservationStatus(Long reservationId, ReservationStatusUpdateDTO updateDTO);

    void deleteReservation(Long reservationId);

    List<ReservationResponseDTO> getReservationsByDateRange(LocalDate startDate, LocalDate endDate);

    // ─── Shared ───────────────────────────────────────────────────────────────────
    ReservationResponseDTO getReservationById(Long reservationId);
}
