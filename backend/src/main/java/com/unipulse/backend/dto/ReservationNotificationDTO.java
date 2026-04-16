package com.unipulse.backend.dto;

import com.unipulse.backend.model.ReservationNotification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationNotificationDTO {
    private Long id;
    private String userId;
    private String message;
    private String notificationType;
    private Long reservationId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static ReservationNotificationDTO fromEntity(ReservationNotification n) {
        return ReservationNotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .message(n.getMessage())
                .notificationType(n.getNotificationType())
                .reservationId(n.getReservationId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
