import { useState } from 'react';
import Navbar from '../components/Navbar';
import BottomBar from '../components/BottomBar';
import { UserPlus, Clock, CheckCircle, XCircle, ChevronDown, Send } from 'lucide-react';

type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface RoleRequest {
  id: string;
  requestedRole: string;
  reason: string;
  status: RoleRequestStatus;
  date: string;
}

const roleLabelMap: Record<string, string> = {
  USER: 'Student',
  STUDENT: 'Student',
  FACULTY: 'Lecturer',
  LECTURER: 'Lecturer',
  TECHNICIAN: 'Technician',
  ADMIN: 'Admin',
};

export default function RoleRequestPage() {
  const [role, setRole] = useState('LECTURER');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const [requests, setRequests] = useState<RoleRequest[]>([
    {
      id: 'REQ-001',
      requestedRole: 'TECHNICIAN',
      reason: 'I joined the IT Support team this semester.',
      status: 'APPROVED',
      date: '2026-04-12',
    },
    {
      id: 'REQ-002',
      requestedRole: 'ADMIN',
      reason: 'Need admin access for system configuration duties.',
      status: 'REJECTED',
      date: '2026-04-15',
    },
    {
      id: 'REQ-003',
      requestedRole: 'LECTURER',
      reason: 'I was recently appointed as a lecturer.',
      status: 'PENDING',
      date: '2026-04-18',
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);

    try {
      // TODO: Replace with real backend API call
      // Example:
      // await axios.post('http://localhost:8081/api/role-requests', {
      //   requestedRole: role,
      //   reason,
      // });

      const newReq: RoleRequest = {
        id: `REQ-00${requests.length + 1}`,
        requestedRole: role,
        reason,
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
      };

      setRequests([newReq, ...requests]);
      setReason('');
      alert('Role change request submitted. Admin will review it.');
    } catch (error) {
      console.error('Failed to submit role request:', error);
      alert('Failed to submit role request.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RoleRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="mx-auto mt-16 mb-20 flex-1 w-full max-w-5xl px-4 py-8 sm:mb-0 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <UserPlus className="h-8 w-8 text-blue-600" />
            Role Requests
          </h1>
          <p className="mt-1 text-slate-500">
            Request a change to your current role.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                New Request
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Requested Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-slate-900 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none sm:text-sm"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="LECTURER">Lecturer</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Reason for Request
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Briefly explain why you need this role..."
                    className="block w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none sm:text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !reason.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">Request History</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No role requests found.
                  </div>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="p-6 transition-colors hover:bg-slate-50">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900">
                              {roleLabelMap[req.requestedRole] || req.requestedRole}
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                              ID: {req.id}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{req.reason}</p>
                          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            Submitted on {req.date}
                          </div>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(req.status)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  );
}