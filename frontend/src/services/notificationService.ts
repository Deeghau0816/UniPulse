export type NotificationType =
  | 'ACCOUNT_ACTIVITY'
  | 'ROLE_REQUEST'
  | 'ROLE_REQUEST_RESULT'
  | 'STATUS_CHANGE'
  | 'NEW_COMMENT'
  | 'ASSIGNMENT';
export type FilterType = 'ALL' | 'UNREAD' | NotificationType;

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedTicketId: string | null;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  private readonly apiBaseUrl = 'http://localhost:8081/api';

  async getAllNotifications(userId: number, token?: string): Promise<NotificationItem[]> {
    return this.fetchNotifications(`/notifications/user/${userId}`, token);
  }

  async getUnreadNotifications(userId: number, token?: string): Promise<NotificationItem[]> {
    return this.fetchNotifications(`/notifications/user/${userId}/unread`, token);
  }

  async markAsRead(id: number, token?: string): Promise<void> {
    await this.fetchJson(`/notifications/${id}/read`, { method: 'PUT' }, token);
  }

  async markAllAsRead(userId: number, token?: string): Promise<void> {
    await this.fetchJson(`/notifications/user/${userId}/read-all`, { method: 'PUT' }, token);
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
      case 'ACCOUNT_ACTIVITY':
        return 'Account Activity';
      case 'ROLE_REQUEST':
        return 'Role Request';
      case 'ROLE_REQUEST_RESULT':
        return 'Role Request Result';
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

  private async fetchNotifications(endpoint: string, token?: string): Promise<NotificationItem[]> {
    const data = await this.fetchJson<any>(endpoint, { method: 'GET' }, token);
    const notifications = Array.isArray(data) ? data : data?.data || [];

    return notifications.map((notification: any) => this.mapNotification(notification));
  }

  private async fetchJson<T>(
    endpoint: string,
    options: RequestInit,
    token?: string
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  private mapNotification(notification: any): NotificationItem {
    return {
      id: Number(notification.id),
      type: this.getNotificationType(notification.title, notification.message),
      title: notification.title,
      message: notification.message,
      relatedTicketId: this.extractTicketId(notification.title, notification.message),
      isRead: Boolean(notification.isRead),
      createdAt: notification.createdAt,
    };
  }

  private getNotificationType(title: string, message: string): NotificationType {
    const text = `${title} ${message}`.toLowerCase();

    if (text.includes('approved by admin') || text.includes('rejected by admin')) {
      return 'ROLE_REQUEST_RESULT';
    }

    if (
      text.includes('role request') ||
      text.includes('role change request') ||
      text.includes('requested a role change')
    ) {
      return 'ROLE_REQUEST';
    }

    if (
      text.includes('logged in') ||
      text.includes('registered') ||
      text.includes('account created') ||
      text.includes('admin account created') ||
      text.includes('device (')
    ) {
      return 'ACCOUNT_ACTIVITY';
    }

    if (text.includes('comment')) {
      return 'NEW_COMMENT';
    }

    if (text.includes('assigned') || text.includes('assignment')) {
      return 'ASSIGNMENT';
    }

    if (text.includes('status') || text.includes('resolution')) {
      return 'STATUS_CHANGE';
    }

    if (text.includes('role request approved') || text.includes('role request rejected')) {
      return 'ROLE_REQUEST_RESULT';
    }

    if (text.includes('role')) {
      return 'ROLE_REQUEST';
    }

    return 'ACCOUNT_ACTIVITY';
  }

  private extractTicketId(title: string, message: string): string | null {
    const ticketMatch = title.match(/#(\w+)/) || message.match(/#(\w+)/);
    return ticketMatch ? ticketMatch[1] : null;
  }
}

export const notificationService = new NotificationService();
