package com.unipulse.backend.Controller;

import com.unipulse.backend.dto.ApiResponse;
import com.unipulse.backend.dto.ReservationNotificationDTO;
import com.unipulse.backend.Repository.ReservationNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservation-notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:8081"})
public class ReservationNotificationController {

    private final ReservationNotificationRepository notificationRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReservationNotificationDTO>>> getUserNotifications(
            @PathVariable String userId) {
        List<ReservationNotificationDTO> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ReservationNotificationDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count", count));
    }

    @PutMapping("/user/{userId}/mark-all-read")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> markAllRead(@PathVariable String userId) {
        notificationRepository.markAllReadForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<ApiResponse<ReservationNotificationDTO>> markOneRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(n -> {
            n.setRead(true);
            notificationRepository.save(n);
            return ResponseEntity.ok(ApiResponse.success("Marked as read", ReservationNotificationDTO.fromEntity(n)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
