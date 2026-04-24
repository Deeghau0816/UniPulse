package com.unipulse.backend.service.impl;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.dto.NotificationRequest;
import com.unipulse.backend.dto.NotificationResponse;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setRead(false);
        notification.setUser(user);

        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Override
    public List<NotificationResponse> getNotificationsByUser(Long userId, String currentUserEmail) {
        User currentUser = getValidatedUser(userId, currentUserEmail);

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getUnreadNotificationsByUser(Long userId, String currentUserEmail) {
        User currentUser = getValidatedUser(userId, currentUserEmail);

        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String currentUserEmail) {
        Notification notification = getValidatedNotification(notificationId, currentUserEmail);
        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId, String currentUserEmail) {
        User currentUser = getValidatedUser(userId, currentUserEmail);

        List<Notification> unreadNotifications =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(currentUser.getId());

        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    private User getValidatedUser(Long userId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        if (!currentUser.getId().equals(userId)) {
            throw new RuntimeException("You cannot access another user's notifications");
        }

        return currentUser;
    }

    private Notification getValidatedNotification(Long notificationId, String currentUserEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (notification.getUser() == null || notification.getUser().getEmail() == null) {
            throw new RuntimeException("Notification owner not found");
        }

        if (!notification.getUser().getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new RuntimeException("You cannot update another user's notification");
        }

        return notification;
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