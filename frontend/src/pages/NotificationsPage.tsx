import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, type NotificationItem, type NotificationType, type FilterType } from '../services/notificationService';
import { Bell, CheckCircle, Clock, Search, MessageSquare, AlertCircle, FileText, Check } from 'lucide-react';
import UnifiedNavbar from '../components/UnifiedNavbar';
import BottomBar from '../components/BottomBar';

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Get current user ID - hardcoded for testing
  const getCurrentUserId = (): number => {
    return 1; // Use hardcoded user ID for testing
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const notificationData = await notificationService.getAllNotifications(userId);
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

  const markAsRead = async (id: number): Promise<void> => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const userId = getCurrentUserId();
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'STATUS_CHANGE': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'NEW_COMMENT': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'ASSIGNMENT': return <FileText className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNotificationLabel = (type: NotificationType): string => {
    switch (type) {
      case 'STATUS_CHANGE': return 'Status Update';
      case 'NEW_COMMENT': return 'New Comment';
      case 'ASSIGNMENT': return 'Assignment';
      default: return 'Notification';
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UnifiedNavbar portal="user" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 mb-20 sm:mb-0">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-8 h-8 text-blue-600" />
              Notifications
            </h1>
            <p className="text-slate-500 mt-1">
              Stay updated on your tickets, assignments, and comments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {unreadCount} Unread
            </span>
            <button
              onClick={markAllAsRead}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-2 mb-6 flex flex-wrap gap-2 shadow-sm">
          {(['ALL', 'UNREAD', 'STATUS_CHANGE', 'NEW_COMMENT', 'ASSIGNMENT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'ALL' ? 'All Notifications' :
               f === 'UNREAD' ? 'Unread' :
               f === 'STATUS_CHANGE' ? 'Status Updates' :
               f === 'NEW_COMMENT' ? 'Comments' : 'Assignments'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">You're all caught up!</h3>
              <p className="text-slate-500">No notifications found for the selected filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 transition-colors hover:bg-slate-50 flex gap-4 ${
                    !item.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'STATUS_CHANGE' ? 'bg-amber-100' :
                      item.type === 'NEW_COMMENT' ? 'bg-blue-100' :
                      item.type === 'ASSIGNMENT' ? 'bg-purple-100' : 'bg-slate-100'
                    }`}>
                      {getNotificationIcon(item.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h4 className={`text-base font-semibold truncate ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${!item.isRead ? 'text-slate-700' : 'text-slate-600'}`}>
                      {item.message}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                        {getNotificationLabel(item.type)}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Ticket: #{item.relatedTicketId}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                    {!item.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mb-1"></div>
                    )}
                    <button
                      onClick={() => navigate(`/dashboard/tickets/${item.relatedTicketId}`)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View Ticket
                    </button>
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomBar />
    </div>
  );
};

export default NotificationsPage;