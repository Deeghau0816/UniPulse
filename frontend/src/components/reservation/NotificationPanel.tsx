import React, { useEffect, useState, useCallback } from 'react';
import { notificationService } from '../../services/reservationService';
import type { UserNotification } from '../../types/reservation';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface NotificationPanelProps {
  userId: string;
}

const typeIcon: Record<string, string> = {
  APPROVED:  '',
  REJECTED:  '',
  CANCELLED: '',
  DEFAULT:   '',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await notificationService.getByUser(userId);
      setNotifications(data);
    } catch {
      // Silently fail - notifications non-critical
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id: number) => {
    await notificationService.markOneRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  
  const handleDeleteNotification = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering mark as read
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this notification?');
    if (!confirmed) {
      return; // User cancelled the deletion
    }
    
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      // Silently fail - delete non-critical
    }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return <LoadingSpinner message="Loading notifications..." size="sm" />;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>Notifications</h3>
          {unread > 0 && (
            <span style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 700,
            }}>
              {unread} new
            </span>
          )}
        </div>
              </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
          <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
        </div>
      )}

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.map(n => {
          const icon = typeIcon[n.notificationType || 'DEFAULT'] ?? typeIcon.DEFAULT;
          return (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                border: `1px solid ${n.isRead ? '#E5E7EB' : '#BFDBFE'}`,
                backgroundColor: n.isRead ? '#FFFFFF' : '#EFF6FF',
                cursor: n.isRead ? 'default' : 'pointer',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                transform: 'translateZ(0)',
                boxShadow: `
                  0 4px 8px rgba(0, 0, 0, 0.06),
                  0 2px 4px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.6),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `,
                transformStyle: 'preserve-3d',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(8px) scale(1.02)';
                e.currentTarget.style.boxShadow = `
                  0 8px 16px rgba(0, 0, 0, 0.12),
                  0 4px 8px rgba(0, 0, 0, 0.08),
                  0 2px 4px rgba(0, 0, 0, 0.06),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0)';
                e.currentTarget.style.boxShadow = `
                  0 4px 8px rgba(0, 0, 0, 0.06),
                  0 2px 4px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.6),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `;
              }}
            >
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: '0 0 4px',
                  fontSize: '16px',
                  fontFamily:'Arial, sans-serif',
                  color: '#111827',
                  fontWeight: n.isRead ? 400 : 500,
                  lineHeight: 1.4,
                }}>
                  {n.message}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#1f2b3e' , fontFamily:'Poppins'}}>
                  {new Date(n.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                {!n.isRead && (
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    flexShrink: 0,
                    marginTop: '4px',
                  }} />
                )}
                <button
                  onClick={(e) => handleDeleteNotification(n.id, e)}
                  style={{
                    padding: '12px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#DC2626',
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#FCA5A5';
                    e.currentTarget.style.borderColor = '#F87171';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                    e.currentTarget.style.borderColor = '#FECACA';
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
