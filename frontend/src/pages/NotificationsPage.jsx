import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([
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

  const filteredNotifications = useMemo(() => {
    if (filter === 'ALL') return notifications;
    if (filter === 'UNREAD') return notifications.filter((item) => !item.isRead);
    return notifications.filter((item) => item.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true }))
    );
  };

  const getNotificationClass = (type) => {
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

  const getNotificationLabel = (type) => {
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

  const formatDate = (dateString) => {
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
        }

        .notifications-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e1b4b 100%);
          position: relative;
          overflow-x: hidden;
          color: white;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.75;
        }

        .orb-1 {
          width: 460px;
          height: 460px;
          background: rgba(59, 130, 246, 0.22);
          top: -140px;
          left: -120px;
        }

        .orb-2 {
          width: 420px;
          height: 420px;
          background: rgba(139, 92, 246, 0.22);
          bottom: -140px;
          right: -100px;
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
          background: linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(219, 234, 254, 0.78);
          max-width: 760px;
        }

        .unread-chip {
          padding: 12px 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
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
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          color: rgba(219, 234, 254, 0.84);
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #ffffff;
          border-color: transparent;
        }

        .mark-all-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.10);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mark-all-btn:hover {
          background: rgba(255,255,255,0.16);
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 22px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          border-color: rgba(96,165,250,0.35);
        }

        .notification-card.unread {
          border-color: rgba(96,165,250,0.45);
          box-shadow: 0 0 0 1px rgba(96,165,250,0.12);
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
        }

        .notif-status {
          background: rgba(59,130,246,0.18);
          color: #93c5fd;
          border-color: rgba(147,197,253,0.35);
        }

        .notif-comment {
          background: rgba(251,191,36,0.16);
          color: #fde68a;
          border-color: rgba(253,230,138,0.35);
        }

        .notif-assign {
          background: rgba(34,197,94,0.16);
          color: #86efac;
          border-color: rgba(134,239,172,0.35);
        }

        .notif-default {
          background: rgba(148,163,184,0.16);
          color: #cbd5e1;
          border-color: rgba(203,213,225,0.28);
        }

        .unread-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #60a5fa;
        }

        .notification-title {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .notification-message {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(219, 234, 254, 0.84);
          margin-bottom: 12px;
        }

        .notification-meta {
          font-size: 13px;
          color: rgba(191, 219, 254, 0.66);
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
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #ffffff;
        }

        .view-btn:hover {
          transform: translateY(-1px);
        }

        .read-btn {
          background: rgba(255,255,255,0.10);
          color: #ffffff;
        }

        .read-btn:hover {
          background: rgba(255,255,255,0.16);
        }

        .empty-state {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 24px;
          padding: 40px 24px;
          text-align: center;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .empty-text {
          font-size: 14px;
          color: rgba(219, 234, 254, 0.76);
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

          .toolbar,
          .notification-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      <div className="notifications-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">
                View ticket-related alerts including status updates, technician assignments, and new comments on your incident tickets.
              </p>
            </div>

            <div className="unread-chip">
              Unread: {unreadCount}
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="content-container">
            <div className="toolbar">

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
  <button className="filter-btn" onClick={() => navigate('/dashboard/my-tickets')}>
    My Tickets
  </button>
  <button className="filter-btn" onClick={() => navigate('/dashboard/tickets/new')}>
    Create Ticket
  </button>
  <button className="filter-btn" onClick={() => navigate('/dashboard/technician')}>
    Technician Dashboard
  </button>
</div>

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