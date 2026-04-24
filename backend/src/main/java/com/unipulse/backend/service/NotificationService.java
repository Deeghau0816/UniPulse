package com.unipulse.backend.service;

import com.unipulse.backend.dto.NotificationRequest;
import com.unipulse.backend.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse createNotification(NotificationRequest request);
    List<NotificationResponse> getNotificationsByUser(Long userId, String currentUserEmail);
    List<NotificationResponse> getUnreadNotificationsByUser(Long userId, String currentUserEmail);
    NotificationResponse markAsRead(Long notificationId, String currentUserEmail);
    void markAllAsRead(Long userId, String currentUserEmail);
}