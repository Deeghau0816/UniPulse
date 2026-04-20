package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.*;
import com.unipulse.backend.exception.ReservationConflictException;
import com.unipulse.backend.exception.ResourceNotFoundException;
import com.unipulse.backend.model.Reservation;
import com.unipulse.backend.model.Reservation.ReservationStatus;
import com.unipulse.backend.model.Resource;
import com.unipulse.backend.model.ReservationNotification;
import com.unipulse.backend.Repository.ReservationNotificationRepository;
import com.unipulse.backend.Repository.ReservationRepository;
import com.unipulse.backend.Repository.ResourceRepository;
import com.unipulse.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ResourceRepository resourceRepository;
    private final ReservationNotificationRepository notificationRepository;

    // ─── User Operations ─────────────────────────────────────────────────────────

    @Override
    public ReservationResponseDTO createReservation(ReservationRequestDTO dto) {
        log.info("Creating reservation for user: {} on resource: {}", dto.getUserId(), dto.getResourceId());

        // 1. Validate time range
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // 2. Fetch resource
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + dto.getResourceId()));

        if (resource.getStatus() != com.unipulse.backend.enums.ResourceStatus.ACTIVE) {
            throw new IllegalStateException("Resource '" + resource.getName() + "' is currently out of service");
        }

        // 3. Conflict detection ─ CRITICAL BUSINESS RULE
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                dto.getResourceId(),
                dto.getReservationDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                null
        );

        if (!conflicts.isEmpty()) {
            Reservation conflict = conflicts.get(0);
            throw new ReservationConflictException(
                    String.format("Scheduling conflict detected! Resource '%s' is already reserved from %s to %s on %s.",
                            resource.getName(),
                            conflict.getStartTime(),
                            conflict.getEndTime(),
                            conflict.getReservationDate())
            );
        }

        // 4. Build and save
        Reservation reservation = Reservation.builder()
                .userId(dto.getUserId())
                .userName(dto.getUserName())
                .resource(resource)
                .reservationDate(dto.getReservationDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .expectedAttendees(dto.getExpectedAttendees())
                .purpose(dto.getPurpose())
                .specialNotes(dto.getSpecialNotes())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created with id: {}", saved.getId());

        return toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByUser(String userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationSummaryDTO getReservationSummaryByUser(String userId) {
        long total = reservationRepository.countByUserId(userId);
        long pending = reservationRepository.countByUserIdAndStatus(userId, ReservationStatus.PENDING);
        long approved = reservationRepository.countByUserIdAndStatus(userId, ReservationStatus.APPROVED);
        long rejected = reservationRepository.countByUserIdAndStatus(userId, ReservationStatus.REJECTED);
        long cancelled = reservationRepository.countByUserIdAndStatus(userId, ReservationStatus.CANCELLED);

        return ReservationSummaryDTO.builder()
                .totalRequests(total)
                .pendingCount(pending)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .cancelledCount(cancelled)
                .build();
    }

    @Override
    public ReservationResponseDTO cancelReservation(Long reservationId, String userId) {
        Reservation reservation = findReservationById(reservationId);

        if (!reservation.getUserId().equals(userId)) {
            throw new IllegalStateException("You can only cancel your own reservations");
        }
        if (reservation.getStatus() != ReservationStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED reservations can be cancelled by the user");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setAdminReason("Cancelled by user");
        return toResponseDTO(reservationRepository.save(reservation));
    }

    @Override
    public void deleteReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found with id: " + reservationId));

        reservationRepository.delete(reservation);
    }

    @Override
    public ReservationResponseDTO updateReservation(Long reservationId, ReservationRequestDTO dto) {
        log.info("Updating reservation: {} for user: {}", reservationId, dto.getUserId());

        Reservation reservation = findReservationById(reservationId);

        // Check if reservation can be updated
        if (!reservation.getUserId().equals(dto.getUserId())) {
            throw new IllegalStateException("You can only update your own reservations");
        }
        if (reservation.getStatus() == ReservationStatus.APPROVED) {
            throw new IllegalStateException("Approved reservations cannot be updated");
        }
        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.REJECTED) {
            throw new IllegalStateException("Cancelled or rejected reservations cannot be updated");
        }

        // Check if within 2 hours of submission
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursAgo = now.minusHours(2);
        if (reservation.getCreatedAt().isBefore(twoHoursAgo)) {
            throw new IllegalStateException("Reservations can only be updated within 2 hours of submission");
        }

        // Validate time range
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Fetch and validate resource
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + dto.getResourceId()));

        if (resource.getStatus() != com.unipulse.backend.enums.ResourceStatus.ACTIVE) {
            throw new IllegalStateException("Resource is not available for booking");
        }

        // Check for conflicts (exclude current reservation from conflict check)
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                dto.getResourceId(),
                dto.getReservationDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                reservationId
        );

        conflicts = conflicts.stream()
                .filter(r -> !r.getId().equals(reservationId))
                .collect(Collectors.toList());

        if (!conflicts.isEmpty()) {
            throw new ReservationConflictException(
                    "The selected resource is already booked for the requested time slot");
        }

        // Update reservation details
        reservation.setResource(resource);
        reservation.setReservationDate(dto.getReservationDate());
        reservation.setStartTime(dto.getStartTime());
        reservation.setEndTime(dto.getEndTime());
        reservation.setPurpose(dto.getPurpose());
        reservation.setSpecialNotes(dto.getSpecialNotes());
        reservation.setExpectedAttendees(dto.getExpectedAttendees());
        reservation.setUpdatedAt(LocalDateTime.now());

        return toResponseDTO(reservationRepository.save(reservation));
    }

    // ─── Admin Operations ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsWithFilters(
            ReservationStatus status,
            com.unipulse.backend.enums.ResourceType resourceType,
            LocalDate date) {
        return reservationRepository.findWithFilters(status, resourceType, date)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReservationResponseDTO updateReservationStatus(Long reservationId, ReservationStatusUpdateDTO updateDTO) {
        log.info("Admin updating reservation {} to status {}", reservationId, updateDTO.getStatus());

        Reservation reservation = findReservationById(reservationId);

        // Validate workflow transitions
        validateStatusTransition(reservation.getStatus(), updateDTO.getStatus());

        // Require reason for REJECTED or CANCELLED
        if ((updateDTO.getStatus() == ReservationStatus.REJECTED ||
             updateDTO.getStatus() == ReservationStatus.CANCELLED) &&
            (updateDTO.getReason() == null || updateDTO.getReason().isBlank())) {
            throw new IllegalArgumentException("A reason is required when rejecting or cancelling a reservation");
        }

        reservation.setStatus(updateDTO.getStatus());
        reservation.setAdminReason(updateDTO.getReason());
        reservation.setReviewedBy(updateDTO.getReviewedBy());
        reservation.setReviewedAt(LocalDateTime.now());

        Reservation updated = reservationRepository.save(reservation);

        // Send notification to the user
        sendStatusNotification(updated);

        return toResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByDateRange(LocalDate startDate, LocalDate endDate) {
        return reservationRepository
                .findByReservationDateBetweenOrderByReservationDateAscStartTimeAsc(startDate, endDate)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponseDTO getReservationById(Long reservationId) {
        return toResponseDTO(findReservationById(reservationId));
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────────

    private Reservation findReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
    }

    private void validateStatusTransition(ReservationStatus current, ReservationStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == ReservationStatus.APPROVED || next == ReservationStatus.REJECTED;
            case APPROVED -> next == ReservationStatus.CANCELLED;
            default -> false;
        };
        if (!valid) {
            throw new IllegalStateException(
                    String.format("Cannot transition reservation from %s to %s", current, next));
        }
    }

    private void sendStatusNotification(Reservation reservation) {
        String message = switch (reservation.getStatus()) {
            case APPROVED -> String.format(
                    "✅ Your reservation #%d for '%s' on %s has been APPROVED.",
                    reservation.getId(), reservation.getResource().getName(), reservation.getReservationDate());
            case REJECTED -> String.format(
                    "❌ Your reservation #%d for '%s' was REJECTED. Reason: %s",
                    reservation.getId(), reservation.getResource().getName(), reservation.getAdminReason());
            case CANCELLED -> String.format(
                    "🚫 Your reservation #%d for '%s' has been CANCELLED. Reason: %s",
                    reservation.getId(), reservation.getResource().getName(), reservation.getAdminReason());
            default -> null;
        };

        if (message != null) {
            ReservationNotification notification = ReservationNotification.builder()
                    .userId(reservation.getUserId())
                    .message(message)
                    .notificationType(reservation.getStatus().name())
                    .reservationId(reservation.getId())
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
            log.info("Notification sent to user: {}", reservation.getUserId());
        }
    }

    private ReservationResponseDTO toResponseDTO(Reservation r) {
        return ReservationResponseDTO.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .userName(r.getUserName())
                .resourceId(r.getResource().getId())
                .resourceName(r.getResource().getName())
                .resourceType(r.getResource().getType().name())
                .resourceLocation(r.getResource().getLocation())
                .resourceCapacity(r.getResource().getCapacity())
                .reservationDate(r.getReservationDate())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .expectedAttendees(r.getExpectedAttendees())
                .purpose(r.getPurpose())
                .specialNotes(r.getSpecialNotes())
                .status(r.getStatus())
                .adminReason(r.getAdminReason())
                .reviewedBy(r.getReviewedBy())
                .reviewedAt(r.getReviewedAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}