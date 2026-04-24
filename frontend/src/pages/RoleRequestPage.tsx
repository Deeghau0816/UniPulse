import { useEffect, useMemo, useState } from 'react';
import { Shield, Send, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomBar from '../components/BottomBar';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8081';

type RoleValue =
  | 'STUDENT'
  | 'ACADEMIC'
  | 'NON_ACADEMIC'
  | 'TECHNICIAN'
  | 'SYSTEM_ADMIN';

interface RoleRequestItem {
  id: number;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string | null;
  userDeleted?: boolean;
}

export default function RoleRequestPage() {
  const { userPortalUser, getToken } = useAuth();

  const [requestedRole, setRequestedRole] = useState<RoleValue | ''>('');
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState<RoleRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  const currentRole = (userPortalUser?.role || '').toUpperCase() as RoleValue;

  const availableRoleOptions = useMemo(() => {
    const allRoles: { value: RoleValue; label: string }[] = [
      { value: 'STUDENT', label: 'Student' },
      { value: 'ACADEMIC', label: 'Academic Staff' },
      { value: 'NON_ACADEMIC', label: 'Non-Academic Staff' },
      { value: 'TECHNICIAN', label: 'Technician' },
      { value: 'SYSTEM_ADMIN', label: 'System Admin' },
    ];

    return allRoles.filter((role) => role.value !== currentRole);
  }, [currentRole]);

  useEffect(() => {
    if (!requestedRole && availableRoleOptions.length > 0) {
      setRequestedRole(availableRoleOptions[0].value);
    }
  }, [availableRoleOptions, requestedRole]);

  useEffect(() => {
    fetchMyRequests();
  }, [userPortalUser?.id]);

  const fetchMyRequests = async () => {
    if (!userPortalUser?.id) return;

    const token = getToken('user');
    if (!token) return;

    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/users/${userPortalUser.id}/role-requests`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : [];

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch role requests');
      }

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userPortalUser?.id) {
      alert('User not found. Please login again.');
      return;
    }

    const token = getToken('user');
    if (!token) {
      alert('Session expired. Please login again.');
      return;
    }

    if (!requestedRole) {
      alert('Please select a role.');
      return;
    }

    if (requestedRole === currentRole) {
      alert('You already have this role.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/users/${userPortalUser.id}/role-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestedRole,
            reason,
          }),
        }
      );

      const raw = await response.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw };
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to submit role request.');
      }

      alert('Role request submitted successfully.');
      setReason('');
      await fetchMyRequests();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : 'Failed to submit role request.';
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-10 mt-16 mb-20 sm:mb-0">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Role Requests</h1>
            </div>
            <p className="text-slate-600">
              Request a change to your current role.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">New Request</h2>

              <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current Role</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {getRoleLabel(currentRole)}
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Requested Role
                  </label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as RoleValue)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                    required
                  >
                    {availableRoleOptions.length === 0 ? (
                      <option value="">No other roles available</option>
                    ) : (
                      availableRoleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for Request
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 resize-none"
                    placeholder="Explain why you need this role change..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || availableRoleOptions.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Request History</h2>

              {historyLoading ? (
                <div className="py-10 text-center text-slate-500">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
                  No role requests found.
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {getRoleLabel(item.currentRole)} → {getRoleLabel(item.requestedRole)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  );
}