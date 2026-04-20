package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.NotificationRequest;
import com.unipulse.backend.dto.NotificationResponse;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.User;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.AuthProvider;
import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseGet(() -> createDefaultUser(request.getUserId()));

        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setRead(false);
        notification.setUser(user);

        Notification saved = notificationRepository.save(notification);

        return mapToResponse(saved);
    }

    private User createDefaultUser(Long userId) {
        // Check if user already exists first
        return userRepository.findById(userId).orElseGet(() -> {
            User user = new User();
            user.setFullName("Current User");
            user.setEmail("user" + userId + "@example.com");
            user.setPassword("default");
            user.setRole(Role.STUDENT);
            user.setProvider(AuthProvider.LOCAL);
            
            User savedUser = userRepository.save(user);
            return savedUser;
        });
    }

    @Override
    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);

        return mapToResponse(updated);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}