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
  private readonly API_BASE_URL = 'http://localhost:8083/api';

  async getAllNotifications(userId: number): Promise<NotificationItem[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns array directly, not wrapped in data object
      const notifications = Array.isArray(data) ? data : data.data || [];
      
      // Transform backend notification format to frontend format
      return notifications.map((notif: any) => ({
        id: notif.id,
        type: this.getNotificationTypeFromTitle(notif.title),
        title: notif.title,
        message: notif.message,
        relatedTicketId: this.extractTicketId(notif.title, notif.message),
        isRead: notif.isRead,
        createdAt: notif.createdAt
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadNotifications(userId: number): Promise<NotificationItem[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/user/${userId}/unread`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns array directly, not wrapped in data object
      const notifications = Array.isArray(data) ? data : data.data || [];
      
      // Transform backend notification format to frontend format
      return notifications.map((notif: any) => ({
        id: notif.id,
        type: this.getNotificationTypeFromTitle(notif.title),
        title: notif.title,
        message: notif.message,
        relatedTicketId: this.extractTicketId(notif.title, notif.message),
        isRead: notif.isRead,
        createdAt: notif.createdAt
      }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  async markAsRead(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/user/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
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

  private getNotificationTypeFromTitle(title: string): NotificationType {
    if (title.includes('Status') || title.includes('status')) {
      return 'STATUS_CHANGE';
    } else if (title.includes('Comment') || title.includes('comment')) {
      return 'NEW_COMMENT';
    } else if (title.includes('Assigned') || title.includes('Assignment')) {
      return 'ASSIGNMENT';
    }
    return 'STATUS_CHANGE'; // Default type
  }

  private extractTicketId(title: string, message: string): string {
    // Extract ticket ID from title or message using regex
    const ticketMatch = title.match(/#(\w+)/) || message.match(/#(\w+)/);
    return ticketMatch ? ticketMatch[1] : 'UNKNOWN';
  }
}

export const notificationService = new NotificationService();
