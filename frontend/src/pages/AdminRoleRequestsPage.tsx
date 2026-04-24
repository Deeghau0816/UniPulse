import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import UnifiedNavbar from '../components/UnifiedNavbar';
import BottomBar from '../components/BottomBar';
import { Shield, Check, X, Search, Filter, ShieldCheck, Clock } from 'lucide-react';

type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface AdminRoleRequest {
  id: number;
  userId: number | null;
  fullName: string;
  email: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: RoleRequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
  userDeleted: boolean;
}

const API_BASE_URL = 'http://localhost:8083';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | RoleRequestStatus>('PENDING');
  const [requests, setRequests] = useState<AdminRoleRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/users/admin/role-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch admin role requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AdminRoleRequest) => {
    if (request.userDeleted) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/users/admin/role-requests/${request.id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchRequests();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (request: AdminRoleRequest) => {
    if (request.userDeleted) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/users/admin/role-requests/${request.id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchRequests();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to reject request');
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterStatus === 'ALL' || req.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [requests, searchQuery, filterStatus]);

  const getStatusBadge = (status: RoleRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800"><ShieldCheck className="w-3 h-3" /> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800"><X className="w-3 h-3" /> Rejected</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UnifiedNavbar portal="admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 mb-20 sm:mb-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-700" />
            Role Management
          </h1>
          <p className="text-slate-500 mt-1">
            Review and manage role elevation requests from users.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="block w-full sm:w-40 py-2 pl-3 pr-8 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">User Details</th>
                  <th className="px-6 py-4 font-semibold">Role Transition</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Loading requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No requests found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{req.fullName}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{req.email}</div>
                        {req.userDeleted && (
                          <div className="mt-2 text-xs font-semibold text-red-600">
                            User account deleted
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                            {roleLabel(req.currentRole)}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                            {roleLabel(req.requestedRole)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="truncate max-w-xs text-slate-600" title={req.reason}>
                          {req.reason}
                        </p>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'PENDING' ? (
                          req.userDeleted ? (
                            <span className="text-red-600 text-xs font-semibold">
                              Action disabled
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(req)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(req)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                title="Reject"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  );
}