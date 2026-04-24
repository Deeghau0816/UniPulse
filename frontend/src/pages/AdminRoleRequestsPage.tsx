import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Shield, Check, X, Search, Filter, Clock, Home, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface AdminRoleRequest {
  id: number;
  userName?: string;
  userEmail?: string;
  requesterName?: string;
  requesterEmail?: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: RoleRequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
  userDeleted?: boolean;
}

const API_BASE_URL = 'http://localhost:8081';

const roleLabel = (role: string) => {
  switch ((role || '').toUpperCase()) {
    case 'STUDENT':
      return 'Student';
    case 'ACADEMIC':
      return 'Academic Staff';
    case 'NON_ACADEMIC':
      return 'Non-Academic Staff';
    case 'TECHNICIAN':
      return 'Technician';
    case 'SYSTEM_ADMIN':
      return 'System Admin';
    default:
      return role;
  }
};

export default function AdminRoleRequestsPage() {
  const navigate = useNavigate();
  const { adminPortalUser, getToken, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | RoleRequestStatus>('ALL');
  const [requests, setRequests] = useState<AdminRoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const adminDisplayName =
    adminPortalUser?.firstName || adminPortalUser?.name?.split(' ')[0] || 'Admin';

  useEffect(() => {
    if (adminPortalUser?.id) {
      fetchRequests();
    }
  }, [adminPortalUser?.id]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const token = getToken('admin');
      if (!token) {
        setRequests([]);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/users/admin/role-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch admin role requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoadingId(id);
      const token = getToken('admin');

      await axios.put(
        `${API_BASE_URL}/api/users/admin/role-requests/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: 'APPROVED',
                reviewedAt: new Date().toISOString(),
              }
            : req
        )
      );
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to approve request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setActionLoadingId(id);
      const token = getToken('admin');

      await axios.put(
        `${API_BASE_URL}/api/users/admin/role-requests/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: 'REJECTED',
                reviewedAt: new Date().toISOString(),
              }
            : req
        )
      );
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const name = req.requesterName || req.userName || '';
      const email = req.requesterEmail || req.userEmail || '';

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, filterStatus]);

  const pendingCount = requests.filter((req) => req.status === 'PENDING').length;

  const getStatusBadge = (status: RoleRequestStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <X className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Role Management</h1>
                <p className="text-xs text-slate-500">Admin Control Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
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

              <button
                onClick={() => {
                  logout('admin');
                  navigate('/admin/login', { replace: true });
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Logout
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
              <span className="text-slate-900 font-medium">Role Management</span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
            </div>

            <p className="text-slate-600">
              Review and manage role elevation requests from users.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <Clock className="h-4 w-4" />
              {pendingCount} Pending Requests
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-slate-800 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                    <Filter className="h-5 w-5 text-slate-500" />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'ALL' | RoleRequestStatus)}
                    className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-3">User Details</div>
              <div className="col-span-3">Role Transition</div>
              <div className="col-span-3">Reason</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                No requests found matching the current filters.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const requesterName = req.requesterName || req.userName || 'Unknown User';
                  const requesterEmail = req.requesterEmail || req.userEmail || 'No email';
                  const isDeletedUser = req.userDeleted === true;
                  const isActionLoading = actionLoadingId === req.id;

                  return (
                    <div key={req.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start">
                        <div className="md:col-span-3">
                          <p className="font-semibold text-slate-900">{requesterName}</p>
                          <p className="text-sm text-slate-500">{requesterEmail}</p>
                          <p className="mt-2 text-xs text-slate-400">ID: {req.id}</p>
                          {isDeletedUser && (
                            <p className="mt-2 text-xs font-semibold text-red-600">
                              User account deleted
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-3">
                          <p className="text-sm font-medium text-slate-700">
                            {roleLabel(req.currentRole)} → {roleLabel(req.requestedRole)}
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            Submitted on {new Date(req.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <p className="text-sm text-slate-600 break-words">
                            {req.reason || 'No reason provided.'}
                          </p>
                        </div>

                        <div className="md:col-span-1">
                          {getStatusBadge(req.status)}
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                            {req.status === 'PENDING' && !isDeletedUser ? (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  disabled={isActionLoading}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  <Check className="h-4 w-4" />
                                  {isActionLoading ? 'Processing...' : 'Approve'}
                                </button>

                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={isActionLoading}
                                  className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                                >
                                  <X className="h-4 w-4" />
                                  {isActionLoading ? 'Processing...' : 'Reject'}
                                </button>
                              </>
                            ) : isDeletedUser ? (
                              <span className="text-sm font-semibold text-red-600">
                                Request locked
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-slate-400">
                                Reviewed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}