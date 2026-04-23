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
  const { adminPortalUser, getToken } = useAuth();

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = getToken('admin');

        const [resources, reservations, tickets, roleRequestsResponse] = await Promise.all([
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

        const roleRequests = Array.isArray(roleRequestsResponse) ? roleRequestsResponse : [];

        const pendingBookings = reservations.filter((r: any) => r.status === 'PENDING').length;
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
            message: `New booking request for ${r.resourceName || 'a resource'} by ${
              r.userName || r.userId
            }`,
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
            message: `${req.fullName || req.userName || 'User'} requested role change to ${
              req.requestedRole || 'a new role'
            }`,
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
    adminPortalUser?.firstName || adminPortalUser?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20 bg-white border border-slate-200">
                <img
                  src={uniPulseLogo}
                  alt="UniPulse Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>

              <button
                onClick={() => navigate('/admin/account')}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                  {adminPortalUser?.profileImage ? (
                    <img
                      src={adminPortalUser.profileImage}
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
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Home className="w-4 h-4" />
              <span>/</span>
              <span className="text-slate-900 font-medium">Admin Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Welcome, {adminDisplayName}
            </h1>
            <p className="text-lg text-slate-600">
              Manage your campus facilities, bookings, support tickets, and role requests from one place.
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse"
                >
                  <div className="h-12 w-12 bg-slate-100 rounded-xl mb-4" />
                  <div className="h-8 bg-slate-100 rounded mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalResources}</div>
                <div className="text-sm text-slate-600">Total Resources</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Bookings
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalBookings}</div>
                <div className="text-sm text-slate-600">Total Bookings</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    Tickets
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalTickets}</div>
                <div className="text-sm text-slate-600">Total Tickets</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Needs Attention
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stats.pendingRequests}</div>
                <div className="text-sm text-slate-600">Pending Requests</div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Management Sections</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {adminSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className={`bg-white rounded-2xl border ${section.borderColor} overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300 transition-all cursor-pointer group`}
                    onClick={section.action}
                  >
                    <div
                      className={`h-32 bg-gradient-to-br ${section.color} flex items-center justify-center relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                      </div>
                      <Icon className="w-16 h-16 text-white relative z-10" />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {section.description}
                      </p>

                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 ${section.bgColor} rounded-lg mb-4`}
                      >
                        <span className="text-2xl font-bold text-slate-900">{section.stats.value}</span>
                        <span className="text-sm text-slate-600">{section.stats.label}</span>
                      </div>

                      <button className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600">
                        {section.actionLabel}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center`}>
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
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