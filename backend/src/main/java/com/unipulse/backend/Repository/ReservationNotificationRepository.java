package com.unipulse.backend.Repository;

import com.unipulse.backend.model.ReservationNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationNotificationRepository extends JpaRepository<ReservationNotification, Long> {

    List<ReservationNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<ReservationNotification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    long countByUserIdAndIsReadFalse(String userId);

    @Modifying
    @Query("UPDATE ReservationNotification n SET n.isRead = true WHERE n.userId = :userId")
    void markAllReadForUser(@org.springframework.data.repository.query.Param("userId") String userId);
}
