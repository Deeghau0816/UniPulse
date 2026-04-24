import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Search,
  Trash2,
  Users,
  Mail,
  Shield,
  UserCog,
  GraduationCap,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8083';

interface UserItem {
  id: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  role: string;
  sliitId?: string;
  profileImage?: string;
}

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

const roleIcon = (role: string) => {
  switch ((role || '').toUpperCase()) {
    case 'SYSTEM_ADMIN':
      return <Shield className="h-4 w-4" />;
    case 'TECHNICIAN':
      return <Wrench className="h-4 w-4" />;
    case 'ACADEMIC':
      return <GraduationCap className="h-4 w-4" />;
    default:
      return <UserCog className="h-4 w-4" />;
  }
};

const roleBadgeStyle = (role: string) => {
  switch ((role || '').toUpperCase()) {
    case 'SYSTEM_ADMIN':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'TECHNICIAN':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'ACADEMIC':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'NON_ACADEMIC':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'STUDENT':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name =
        user.fullName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim();

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.sliitId || '').toLowerCase().includes(search.toLowerCase()) ||
        roleLabel(user.role).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [users, search]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedUser(null);
      await fetchUsers();
      alert('User deleted successfully.');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Admin Management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">All Users</h1>
            <p className="mt-2 text-slate-600">
              View and manage all registered users in the system.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, role, or SLIIT ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Registered Users ({filteredUsers.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No users found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const displayName =
                  user.fullName ||
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                  'Unnamed User';

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-bold text-white">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <>
                            {displayName.charAt(0)}
                          </>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{displayName}</h3>
                        <div className="mt-1 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                          {user.sliitId && <span>{user.sliitId}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${roleBadgeStyle(
                          user.role
                        )}`}
                      >
                        {roleIcon(user.role)}
                        {roleLabel(user.role)}
                      </span>

                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete User</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mb-6 text-slate-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {selectedUser.fullName ||
                  `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() ||
                  selectedUser.email}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                disabled={deleting}
                className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}