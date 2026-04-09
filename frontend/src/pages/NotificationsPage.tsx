import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'STATUS_CHANGE' | 'NEW_COMMENT' | 'ASSIGNMENT';
type FilterType = 'ALL' | 'UNREAD' | NotificationType;

type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedTicketId: string;
  isRead: boolean;
  createdAt: string;
};
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, type NotificationItem, type NotificationType, type FilterType } from '../services/notificationService';

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      type: 'STATUS_CHANGE',
      title: 'Ticket status updated',
      message: 'Your ticket TKT-001 has been moved to IN_PROGRESS.',
      relatedTicketId: 'TKT-001',
      isRead: false,
      createdAt: '2026-03-31T09:10:00Z',
    },
    {
      id: 2,
      type: 'NEW_COMMENT',
      title: 'New technician comment',
      message: 'A technician added a new comment to ticket TKT-002.',
      relatedTicketId: 'TKT-002',
      isRead: false,
      createdAt: '2026-03-31T08:20:00Z',
    },
    {
      id: 3,
      type: 'STATUS_CHANGE',
      title: 'Ticket resolved',
      message: 'Your ticket TKT-003 has been marked as RESOLVED.',
      relatedTicketId: 'TKT-003',
      isRead: true,
      createdAt: '2026-03-30T17:45:00Z',
    },
    {
      id: 4,
      type: 'ASSIGNMENT',
      title: 'Technician assigned',
      message: 'Technician Nimal Perera has been assigned to ticket TKT-004.',
      relatedTicketId: 'TKT-004',
      isRead: true,
      createdAt: '2026-03-30T15:30:00Z',
    },
    {
      id: 5,
      type: 'STATUS_CHANGE',
      title: 'Ticket closed',
      message: 'Your ticket TKT-005 has been closed successfully.',
      relatedTicketId: 'TKT-005',
      isRead: false,
      createdAt: '2026-03-29T11:40:00Z',
    },
  ]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notificationData = await notificationService.getAllNotifications();
        setNotifications(notificationData);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === 'ALL') return notifications;
    if (filter === 'UNREAD') return notifications.filter((item) => !item.isRead);
    return notifications.filter((item) => item.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = (id: number): void => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const markAllAsRead = (): void => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true }))
    );
  };

  const getNotificationClass = (type: NotificationType): string => {
    switch (type) {
      case 'STATUS_CHANGE':
        return 'notif-status';
      case 'NEW_COMMENT':
        return 'notif-comment';
      case 'ASSIGNMENT':
        return 'notif-assign';
      default:
        return 'notif-default';
    }
  };

  const getNotificationLabel = (type: NotificationType): string => {
    switch (type) {
      case 'STATUS_CHANGE':
        return 'Status Update';
      case 'NEW_COMMENT':
        return 'New Comment';
      case 'ASSIGNMENT':
        return 'Assignment';
      default:
        return 'Notification';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .notifications-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.12), transparent 22%),
            radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 20%),
            radial-gradient(circle at 82% 82%, rgba(24, 24, 27, 0.08), transparent 24%),
            linear-gradient(135deg, #ffffff 0%, #fafafa 48%, #fff7ed 100%);
          color: #111111;
        }

        .notifications-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(17, 17, 17, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17, 17, 17, 0.03) 1px, transparent 1px);
          background-size: 38px 38px;
          animation: gridFloat 18s ease-in-out infinite;
          pointer-events: none;
          opacity: 0.55;
        }

        @keyframes gridFloat {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(8px, 8px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .accent-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.42;
        }

        .blob-1 {
          width: 340px;
          height: 340px;
          background: rgba(249, 115, 22, 0.18);
          top: -110px;
          left: -90px;
        }

        .blob-2 {
          width: 320px;
          height: 320px;
          background: rgba(251, 146, 60, 0.16);
          bottom: -100px;
          right: -70px;
        }

        .page-header {
          padding: 72px 72px 28px;
          position: relative;
          z-index: 2;
        }

        .header-content {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .page-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #111111;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 15px;
          line-height: 1.7;
          color: #52525b;
          max-width: 760px;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
        }

        .unread-chip {
          padding: 12px 16px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e4e4e7;
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 6px 16px rgba(0,0,0,0.04);
        }

        .quick-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .quick-btn {
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-btn:hover {
          background: #fafafa;
        }

        .content-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .content-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .filter-group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .filter-btn {
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .mark-all-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }

        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.07);
        }

        .notification-card.unread {
          border-color: #fb923c;
          box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.10), 0 10px 24px rgba(0,0,0,0.05);
        }

        .notification-left {
          flex: 1;
        }

        .notification-top {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .notif-badge {
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid transparent;
          text-transform: uppercase;
        }

        .notif-status {
          background: #fff7ed;
          color: #c2410c;
          border-color: #fdba74;
        }

        .notif-comment {
          background: #ffedd5;
          color: #c2410c;
          border-color: #fb923c;
        }

        .notif-assign {
          background: #f4f4f5;
          color: #18181b;
          border-color: #d4d4d8;
        }

        .notif-default {
          background: #fafafa;
          color: #3f3f46;
          border-color: #d4d4d8;
        }

        .unread-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f97316;
        }

        .notification-title {
          font-size: 18px;
          font-weight: 800;
          color: #111111;
          margin-bottom: 8px;
        }

        .notification-message {
          font-size: 14px;
          line-height: 1.7;
          color: #3f3f46;
          margin-bottom: 12px;
        }

        .notification-meta {
          font-size: 13px;
          color: #71717a;
        }

        .notification-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 170px;
        }

        .action-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn {
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .view-btn:hover {
          transform: translateY(-1px);
        }

        .read-btn {
          background: #111111;
          color: #ffffff;
        }

        .read-btn:hover {
          background: #27272a;
        }

        .empty-state {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 40px 24px;
          text-align: center;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }

        .empty-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #111111;
        }

        .empty-text {
          font-size: 14px;
          color: #52525b;
          line-height: 1.7;
        }

        @media (max-width: 1024px) {
          .page-header,
          .content-section {
            padding-left: 40px;
            padding-right: 40px;
          }

          .notification-card {
            flex-direction: column;
          }

          .notification-actions {
            min-width: 100%;
            flex-direction: row;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 52px 24px 20px;
          }

          .content-section {
            padding: 0 24px 48px;
          }

          .page-title {
            font-size: 34px;
          }

          .header-content,
          .header-right,
          .quick-links,
          .toolbar,
          .notification-actions {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="notifications-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">
                View ticket-related alerts including status updates, technician assignments, and new comments on your incident tickets.
              </p>
            </div>

            <div className="header-right">
              <div className="unread-chip">Unread: {unreadCount}</div>

              <div className="quick-links">
                <button className="quick-btn" onClick={() => navigate('/dashboard/my-tickets')}>
                  My Tickets
                </button>
                <button className="quick-btn" onClick={() => navigate('/dashboard/tickets/new')}>
                  Create Ticket
                </button>
                <button
                  className="quick-btn"
                  onClick={() => navigate('/dashboard/technician/tickets')}
                >
                  Technician Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="content-container">
            <div className="toolbar">
              <div className="filter-group">
                <button
                  className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilter('ALL')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filter === 'UNREAD' ? 'active' : ''}`}
                  onClick={() => setFilter('UNREAD')}
                >
                  Unread
                </button>
                <button
                  className={`filter-btn ${filter === 'STATUS_CHANGE' ? 'active' : ''}`}
                  onClick={() => setFilter('STATUS_CHANGE')}
                >
                  Status Updates
                </button>
                <button
                  className={`filter-btn ${filter === 'NEW_COMMENT' ? 'active' : ''}`}
                  onClick={() => setFilter('NEW_COMMENT')}
                >
                  Comments
                </button>
                <button
                  className={`filter-btn ${filter === 'ASSIGNMENT' ? 'active' : ''}`}
                  onClick={() => setFilter('ASSIGNMENT')}
                >
                  Assignments
                </button>
              </div>

              <button className="mark-all-btn" onClick={markAllAsRead}>
                Mark All as Read
              </button>
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No Notifications Found</div>
                <div className="empty-text">
                  There are no notifications matching the selected filter right now.
                </div>
              </div>
            ) : (
              <div className="notification-list">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notification-card ${!item.isRead ? 'unread' : ''}`}
                  >
                    <div className="notification-left">
                      <div className="notification-top">
                        <span className={`notif-badge ${getNotificationClass(item.type)}`}>
                          {getNotificationLabel(item.type)}
                        </span>
                        {!item.isRead && <span className="unread-dot" />}
                      </div>

                      <div className="notification-title">{item.title}</div>
                      <div className="notification-message">{item.message}</div>
                      <div className="notification-meta">
                        Related Ticket: {item.relatedTicketId} · {formatDate(item.createdAt)}
                      </div>
                    </div>

                    <div className="notification-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => navigate(`/dashboard/tickets/${item.relatedTicketId}`)}
                      >
                        View Ticket
                      </button>

                      {!item.isRead && (
                        <button
                          className="action-btn read-btn"
                          onClick={() => markAsRead(item.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;