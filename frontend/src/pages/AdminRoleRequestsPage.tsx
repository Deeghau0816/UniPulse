import { useState } from 'react';
import Navbar from '../components/Navbar';
import BottomBar from '../components/BottomBar';
import { Shield, Check, X, Search, Filter, ShieldCheck, Clock } from 'lucide-react';

type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface AdminRoleRequest {
  id: string;
  userName: string;
  userEmail: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: RoleRequestStatus;
  date: string;
}

export default function AdminRoleRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | RoleRequestStatus>('PENDING');

  // Mock data
  const [requests, setRequests] = useState<AdminRoleRequest[]>([
    {
      id: 'REQ-101',
      userName: 'John Doe',
      userEmail: 'john.doe@university.edu',
      currentRole: 'STUDENT',
      requestedRole: 'TECHNICIAN',
      reason: 'Joined the campus IT support team for the current semester.',
      status: 'PENDING',
      date: '2023-11-05',
    },
    {
      id: 'REQ-102',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@university.edu',
      currentRole: 'FACULTY',
      requestedRole: 'ADMIN',
      reason: 'Requires admin rights to configure new department resources.',
      status: 'PENDING',
      date: '2023-11-06',
    },
    {
      id: 'REQ-103',
      userName: 'Alice Johnson',
      userEmail: 'alice.j@university.edu',
      currentRole: 'STUDENT',
      requestedRole: 'FACULTY',
      reason: 'I am a TA and need faculty access for grading.',
      status: 'REJECTED',
      date: '2023-11-01',
    },
    {
      id: 'REQ-104',
      userName: 'Bob Wilson',
      userEmail: 'bob.w@university.edu',
      currentRole: 'TECHNICIAN',
      requestedRole: 'ADMIN',
      reason: 'Promoted to lead technician, need system configuration access.',
      status: 'APPROVED',
      date: '2023-10-28',
    }
  ]);

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'APPROVED' } : req
    ));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'REJECTED' } : req
    ));
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 mb-20 sm:mb-0">
        
        {/* Header */}
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
          
          {/* Toolbar */}
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

          {/* Table Container for horizontal scrolling on mobile */}
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
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No requests found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{req.userName}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{req.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{req.currentRole}</span>
                          <span className="text-slate-400">→</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{req.requestedRole}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="truncate max-w-xs text-slate-600" title={req.reason}>
                          {req.reason}
                        </p>
                        <div className="text-xs text-slate-400 mt-1">{req.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
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
