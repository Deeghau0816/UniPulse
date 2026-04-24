// frontend/src/components/Navbar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Check, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import uniPulseLogo from '../assets/home/uniPulseLogo.png';
import { useAuth } from '../contexts/AuthContext';
import { notificationService, type NotificationItem } from '../services/notificationService';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { userPortalUser, logout, getToken, updateUser } = useAuth();

  const [freshUser, setFreshUser] = useState(userPortalUser);
  const user = freshUser || userPortalUser;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const linkClass = (path: string) =>
    `text-sm font-semibold transition ${
      location.pathname === path
        ? 'text-blue-600'
        : 'text-slate-700 hover:text-blue-600'
    }`;

  const displayName = user?.firstName || user?.name?.split(' ')[0] || 'User';
  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const normalizeProfileImage = (image?: string | null, provider?: string) => {
    const value = image?.trim() || '';
    if (!value) return '';

    const isUploadedImage = value.startsWith('data:image/');

    if ((provider || '').toUpperCase() === 'GOOGLE' && !isUploadedImage) {
      return '';
    }

    return value;
  };

  const fetchFreshUserForNavbar = async () => {
    try {
      const token = getToken('user');

      if (!token) return;

      const response = await fetch('http://localhost:8081/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const raw = await response.json();
      const data = raw?.data || raw;

      const updatedUser = {
        id: String(data.id),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        name:
          data.fullName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email || '',
        sliitId: data.sliitId || '',
        role: data.role || 'STUDENT',
        profileImage: normalizeProfileImage(data.profileImage, data.provider),
        provider: data.provider,
        profileCompleted: data.profileCompleted ?? true,
      };

      setFreshUser(updatedUser as any);
      updateUser(updatedUser as any, 'user');
    } catch (error) {
      console.error('Failed to fetch navbar user:', error);
    }
  };

  useEffect(() => {
    setFreshUser(userPortalUser);

    if (userPortalUser?.id) {
      void fetchFreshUserForNavbar();
    }
  }, [userPortalUser?.id]);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    void fetchNotificationData();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const fetchNotificationData = async () => {
    if (!user?.id) return;

    const token = getToken('user');
    if (!token) return;

    try {
      setLoadingNotifications(true);

      const [allNotifications, unreadNotifications] = await Promise.all([
        notificationService.getAllNotifications(Number(user.id), token),
        notificationService.getUnreadNotifications(Number(user.id), token),
      ]);

      setNotifications(allNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Failed to fetch navbar notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleBellClick = async () => {
    const nextOpen = !dropdownOpen;
    setDropdownOpen(nextOpen);

    if (nextOpen) {
      await fetchNotificationData();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    const token = getToken('user');
    if (!token) return;

    try {
      setMarkingAllRead(true);
      await notificationService.markAllAsRead(Number(user.id), token);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleOpenNotificationsPage = () => {
    setDropdownOpen(false);
    navigate('/dashboard/notifications');
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    const token = getToken('user');

    try {
      if (token && !item.isRead) {
        await notificationService.markAsRead(item.id, token);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === item.id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error('Failed to mark notification as read from dropdown:', error);
    } finally {
      setDropdownOpen(false);
      navigate('/dashboard/notifications');
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day ago`;
  };

  return (
    <header className="relative z-[100] w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="relative flex w-full items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl">
            <img
              src={uniPulseLogo}
              alt="UniPulse Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-lg font-extrabold text-slate-900">UniPulse</h1>
            <p className="text-[11px] text-slate-500">Smart Campus Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/tickets" className={linkClass('/tickets')}>Tickets</Link>
            <Link to="/bookings" className={linkClass('/bookings')}>Bookings</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleBellClick}
                  className="relative p-2 text-slate-500 transition-colors hover:text-slate-900"
                >
                  <Bell className="h-5 w-5" />

                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 z-[9999] w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                        <p className="text-xs text-slate-500">{unreadCount} unread</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleMarkAllAsRead}
                          disabled={markingAllRead || unreadCount === 0}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 disabled:opacity-50"
                          title="Mark all as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDropdownOpen(false)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                          title="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          Loading notifications...
                        </div>
                      ) : recentNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        recentNotifications.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                              !item.isRead ? 'bg-blue-50/40' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                  {item.message}
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                  {formatRelativeTime(item.createdAt)}
                                </p>
                              </div>

                              {!item.isRead && (
                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                      <button
                        onClick={handleOpenNotificationsPage}
                        className="w-full text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                      >
                        See all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user ? (
              <Link
                to="/login"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/account"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700">
                    {displayName}
                  </span>
                </Link>

                <button
                  onClick={() => logout('user')}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}