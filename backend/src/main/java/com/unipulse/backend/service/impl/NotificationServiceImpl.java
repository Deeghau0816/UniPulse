package com.unipulse.backend.service.impl;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.dto.NotificationRequest;
import com.unipulse.backend.dto.NotificationResponse;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.NotificationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        User currentUser = getCurrentUser();

        if (!isAdmin(currentUser) && !currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("You can only view your own notifications");
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getUnreadNotificationsByUser(Long userId) {
        User currentUser = getCurrentUser();

        if (!isAdmin(currentUser) && !currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("You can only view your own unread notifications");
        }

        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {
        User currentUser = getCurrentUser();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!isAdmin(currentUser) && !notification.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only update your own notifications");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);

        return mapToResponse(updated);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
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