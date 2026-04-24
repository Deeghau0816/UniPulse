import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Ticket,
  Home,
  BarChart3,
  ChevronRight,
  Plus,
  Clock,
  Shield,
  UserPlus,
  User,
  LogOut,
} from 'lucide-react';
import axios from 'axios';
import { resourceService } from '../services/resourceService';
import { reservationService } from '../services/reservationService';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../contexts/AuthContext';
import uniPulseLogo from '../assets/home/uniPulseLogo.png';

const API_BASE_URL = 'http://localhost:8081';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminPortalUser, getToken, updateUser, logout } = useAuth();

  const [freshAdminUser, setFreshAdminUser] = useState(adminPortalUser);

  const adminUser = freshAdminUser || adminPortalUser;

  const [stats, setStats] = useState({
    totalResources: 0,
    totalBookings: 0,
    totalTickets: 0,
    pendingRequests: 0,
    totalRoleRequests: 0,
    pendingRoleRequests: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const normalizeProfileImage = (image?: string | null, provider?: string) => {
    const value = image?.trim() || '';

    if (!value) return '';

    const isUploadedImage = value.startsWith('data:image/');

    if ((provider || '').toUpperCase() === 'GOOGLE' && !isUploadedImage) {
      return '';
    }

    return value;
  };

  const fetchFreshAdminForNavbar = async () => {
    try {
      const token = getToken('admin');

      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data?.data || response.data;

      const updatedAdmin = {
        id: String(data.id),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        name:
          data.fullName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email || '',
        sliitId: data.sliitId || '',
        role: data.role || 'SYSTEM_ADMIN',
        profileImage: normalizeProfileImage(data.profileImage, data.provider),
        provider: data.provider,
        profileCompleted: data.profileCompleted ?? true,
      };

      setFreshAdminUser(updatedAdmin as any);
      updateUser(updatedAdmin as any, 'admin');
    } catch (error) {
      console.error('Failed to fetch fresh admin profile:', error);
    }
  };

  useEffect(() => {
    setFreshAdminUser(adminPortalUser);

    if (adminPortalUser?.id) {
      void fetchFreshAdminForNavbar();
    }
  }, [adminPortalUser?.id]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = getToken('admin');

        const [resources, reservations, tickets, roleRequestsResponse] =
          await Promise.all([
            resourceService.getAllResources().catch(() => []),
            reservationService.getAll().catch(() => []),
            ticketService.getAllTickets().catch(() => []),
            axios
              .get(`${API_BASE_URL}/api/users/admin/role-requests`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .then((res) => res.data)
              .catch(() => []),
          ]);

        const roleRequests = Array.isArray(roleRequestsResponse)
          ? roleRequestsResponse
          : [];

        const pendingBookings = reservations.filter(
          (r: any) => r.status === 'PENDING'
        ).length;

        const pendingTickets = tickets.filter(
          (t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
        ).length;

        const pendingRoleRequests = roleRequests.filter(
          (req: any) => req.status === 'PENDING'
        ).length;

        setStats({
          totalResources: resources.length,
          totalBookings: reservations.length,
          totalTickets: tickets.length,
          pendingRequests: pendingBookings + pendingTickets + pendingRoleRequests,
          totalRoleRequests: roleRequests.length,
          pendingRoleRequests,
        });

        const activities: any[] = [];

        reservations.slice(0, 3).forEach((r: any) => {
          activities.push({
            type: 'booking',
            message: `New booking request for ${
              r.resourceName || 'a resource'
            } by ${r.userName || r.userId}`,
            time: formatTimeAgo(r.createdAt),
            sortDate: r.createdAt ? new Date(r.createdAt).getTime() : 0,
            icon: Calendar,
            color: 'bg-blue-100 text-blue-600',
          });
        });

        tickets.slice(0, 3).forEach((t: any) => {
          activities.push({
            type: 'ticket',
            message: `Ticket #${t.ticketCode || t.id} ${
              t.status === 'ASSIGNED'
                ? 'assigned to ' + (t.assignedTechnician || 'technician')
                : 'created'
            }`,
            time: formatTimeAgo(t.createdAt),
            sortDate: t.createdAt ? new Date(t.createdAt).getTime() : 0,
            icon: Ticket,
            color: 'bg-orange-100 text-orange-600',
          });
        });

        roleRequests.slice(0, 3).forEach((req: any) => {
          activities.push({
            type: 'role',
            message: `${
              req.fullName || req.userName || 'User'
            } requested role change to ${req.requestedRole || 'a new role'}`,
            time: formatTimeAgo(req.createdAt),
            sortDate: req.createdAt ? new Date(req.createdAt).getTime() : 0,
            icon: Shield,
            color: 'bg-purple-100 text-purple-600',
          });
        });

        resources.slice(0, 2).forEach((r: any) => {
          activities.push({
            type: 'resource',
            message: `Resource "${r.name}" is ${r.status || 'available'}`,
            time: formatTimeAgo(r.createdAt),
            sortDate: r.createdAt ? new Date(r.createdAt).getTime() : 0,
            icon: Building2,
            color: 'bg-emerald-100 text-emerald-600',
          });
        });

        activities.sort((a, b) => b.sortDate - a.sortDate);
        setRecentActivity(activities.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getToken]);

  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleAdminLogout = () => {
    logout('admin');
    navigate('/admin/login', { replace: true });
  };

  const adminSections = [
    {
      id: 'facilities',
      title: 'Facilities Management',
      description: 'Manage campus resources, lecture halls, labs, and equipment',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      stats: { label: 'Resources', value: stats.totalResources },
      action: () => navigate('/dashboard/resources'),
      actionLabel: 'Manage Resources',
    },
    {
      id: 'bookings',
      title: 'Booking Management',
      description: 'View and manage all reservation requests and approvals',
      icon: Calendar,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      stats: { label: 'Bookings', value: stats.totalBookings },
      action: () => navigate('/reservations/admin'),
      actionLabel: 'View Bookings',
    },
    {
      id: 'tickets',
      title: 'Ticket Management',
      description: 'Handle support tickets, assign technicians, and track issues',
      icon: Ticket,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      stats: { label: 'Tickets', value: stats.totalTickets },
      action: () => navigate('/dashboard/admin/tickets'),
      actionLabel: 'Manage Tickets',
    },
    {
      id: 'roles',
      title: 'Role Management',
      description: 'Review role change requests and approve or reject user role updates',
      icon: Shield,
      color: 'from-purple-500 to-fuchsia-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      stats: { label: 'Requests', value: stats.totalRoleRequests },
      action: () => navigate('/dashboard/admin/role-requests'),
      actionLabel: 'Open Role Management',
    },
  ];

  const quickActions = [
    {
      label: 'Add New Resource',
      icon: Plus,
      action: () => navigate('/dashboard/resources/new'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      action: () => navigate('/dashboard/resources'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      label: 'Pending Requests',
      icon: Clock,
      action: () => navigate('/dashboard/admin/role-requests'),
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      label: 'Add Admin',
      icon: UserPlus,
      action: () => navigate('/admin/register'),
      color: 'bg-rose-500 hover:bg-rose-600',
    },
  ];

  const adminDisplayName =
    adminUser?.firstName || adminUser?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-blue-500/20">
                <img
                  src={uniPulseLogo}
                  alt="UniPulse Logo"
                  className="h-7 w-7 object-contain"
                />
              </div>

              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent">
                Admin Dashboard
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 sm:flex"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </button>

              <button
                onClick={() => navigate('/admin/account')}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                  {adminUser?.profileImage ? (
                    <img
                      src={adminUser.profileImage}
                      alt={adminDisplayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-slate-500" />
                  )}
                </div>

                <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700">
                  {adminDisplayName}
                </span>
              </button>

              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <Home className="h-4 w-4" />
              <span>/</span>
              <span className="font-medium text-slate-900">Admin Dashboard</span>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Welcome, {adminDisplayName}
            </h1>

            <p className="text-lg text-slate-600">
              Manage your campus facilities, bookings, support tickets, and role
              requests from one place.
            </p>
          </div>

          {loading ? (
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="mb-2 h-8 rounded bg-slate-100" />
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                    Active
                  </span>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {stats.totalResources}
                </div>
                <div className="text-sm text-slate-600">Total Resources</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Calendar className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                    Bookings
                  </span>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {stats.totalBookings}
                </div>
                <div className="text-sm text-slate-600">Total Bookings</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <Ticket className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                    Tickets
                  </span>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {stats.totalTickets}
                </div>
                <div className="text-sm text-slate-600">Total Tickets</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600">
                    Needs Attention
                  </span>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {stats.pendingRequests}
                </div>
                <div className="text-sm text-slate-600">Pending Requests</div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="flex flex-wrap gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl`}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Management Sections
            </h2>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {adminSections.map((section) => {
                const Icon = section.icon;

                return (
                  <div
                    key={section.id}
                    className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10 ${section.borderColor}`}
                    onClick={section.action}
                  >
                    <div
                      className={`relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br ${section.color}`}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-white" />
                        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-white" />
                      </div>

                      <Icon className="relative z-10 h-16 w-16 text-white" />
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                        {section.title}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                        {section.description}
                      </p>

                      <div
                        className={`mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${section.bgColor}`}
                      >
                        <span className="text-2xl font-bold text-slate-900">
                          {section.stats.value}
                        </span>
                        <span className="text-sm text-slate-600">
                          {section.stats.label}
                        </span>
                      </div>

                      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 group-hover:bg-blue-600">
                        {section.actionLabel}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Recent Activity
            </h2>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center gap-4 rounded-xl p-3"
                    >
                      <div className="h-10 w-10 rounded-lg bg-slate-100" />
                      <div className="flex-1">
                        <div className="mb-2 h-4 w-3/4 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const ActivityIcon = activity.icon;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${activity.color}`}
                        >
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activity.time}
                          </p>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;