package com.unipulse.backend.Repository;

import com.unipulse.backend.model.Reservation;
import com.unipulse.backend.model.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // ─── User queries ────────────────────────────────────────────────────────────
    List<Reservation> findByUserIdOrderByCreatedAtDesc(String userId);

    // ─── Admin queries ───────────────────────────────────────────────────────────
    List<Reservation> findAllByOrderByCreatedAtDesc();

    List<Reservation> findByStatusOrderByCreatedAtDesc(ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:resourceType IS NULL OR r.resource.type = :resourceType) AND " +
           "(:date IS NULL OR r.reservationDate = :date) " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findWithFilters(
            @Param("status") ReservationStatus status,
            @Param("resourceType") com.unipulse.backend.enums.ResourceType resourceType,
            @Param("date") LocalDate date
    );

    // ─── Calendar queries ────────────────────────────────────────────────────────
    List<Reservation> findByReservationDateBetweenOrderByReservationDateAscStartTimeAsc(
            LocalDate startDate, LocalDate endDate);

    // ─── Conflict Detection ──────────────────────────────────────────────────────
    /**
     * Checks for overlapping reservations on the same resource.
     * Two time slots overlap when: existing.start < new.end AND existing.end > new.start
     */
    @Query("SELECT r FROM Reservation r WHERE " +
           "r.resource.id = :resourceId AND " +
           "r.reservationDate = :date AND " +
           "r.status IN ('PENDING', 'APPROVED') AND " +
           "(:excludeId IS NULL OR r.id <> :excludeId) AND " +
           "r.startTime < :endTime AND " +
           "r.endTime > :startTime")
    List<Reservation> findConflictingReservations(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );

    // ─── Summary queries ─────────────────────────────────────────────────────────
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.userId = :userId AND r.status = :status")
    long countByUserIdAndStatus(@Param("userId") String userId, @Param("status") ReservationStatus status);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.userId = :userId")
    long countByUserId(@Param("userId") String userId);
}
