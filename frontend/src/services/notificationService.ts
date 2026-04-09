const API_BASE_URL = 'http://localhost:8080/api';

export type NotificationType = 'STATUS_CHANGE' | 'NEW_COMMENT' | 'ASSIGNMENT';
export type FilterType = 'ALL' | 'UNREAD' | NotificationType;

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedTicketId: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  // Mock notifications for now - in a real app, this would fetch from backend
  private mockNotifications: NotificationItem[] = [];

  async getAllNotifications(): Promise<NotificationItem[]> {
    // For now, return empty array since backend doesn't have notification endpoints
    // In future, this would be: return fetch(`${API_BASE_URL}/notifications`).then(res => res.json());
    return this.mockNotifications;
  }

  async markAsRead(id: number): Promise<void> {
    // Mock implementation - would call backend API
    this.mockNotifications = this.mockNotifications.map(item =>
      item.id === id ? { ...item, isRead: true } : item
    );
  }

  async markAllAsRead(): Promise<void> {
    // Mock implementation - would call backend API
    this.mockNotifications = this.mockNotifications.map(item => ({ ...item, isRead: true }));
  }

  generateMockNotification(ticketId: string, type: NotificationType, message: string): NotificationItem {
    return {
      id: Date.now(),
      type,
      title: this.getNotificationTitle(type),
      message,
      relatedTicketId: ticketId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  }

  private getNotificationTitle(type: NotificationType): string {
    switch (type) {
      case 'STATUS_CHANGE':
        return 'Status Update';
      case 'NEW_COMMENT':
        return 'New Comment';
      case 'ASSIGNMENT':
        return 'Technician Assignment';
      default:
        return 'Notification';
    }
  }
}

export const notificationService = new NotificationService();
