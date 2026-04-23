import { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  User,
  Shield,
  Pencil,
  Save,
  X,
  Trash2,
  AlertTriangle,
  Lock,
  Image as ImageIcon,
  UserCog,
  BadgeCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8081';

type UserRole =
  | 'STUDENT'
  | 'ACADEMIC'
  | 'NON_ACADEMIC'
  | 'TECHNICIAN'
  | 'SYSTEM_ADMIN'
  | string;

interface AdminUserData {
  id?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  sliitId: string;
  role: UserRole;
  profileImage?: string;
}

export default function AdminUserAccountPage() {
  const navigate = useNavigate();
  const { logout, updateUser, adminPortalUser, getToken } = useAuth();

  const [user, setUser] = useState<AdminUserData>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    sliitId: '',
    role: 'SYSTEM_ADMIN',
    profileImage: '',
  });

  const [formData, setFormData] = useState<AdminUserData>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    sliitId: '',
    role: 'SYSTEM_ADMIN',
    profileImage: '',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (adminPortalUser) {
      const localMappedUser: AdminUserData = {
        id: String(adminPortalUser.id),
        firstName: adminPortalUser.firstName || '',
        lastName: adminPortalUser.lastName || '',
        fullName:
          adminPortalUser.name ||
          `${adminPortalUser.firstName || ''} ${adminPortalUser.lastName || ''}`.trim(),
        email: adminPortalUser.email || '',
        sliitId: adminPortalUser.sliitId || '',
        role: adminPortalUser.role || 'SYSTEM_ADMIN',
        profileImage: adminPortalUser.profileImage || '',
      };

      setUser(localMappedUser);
      setFormData(localMappedUser);
    }

    fetchProfile();
  }, [adminPortalUser]);

  const fetchProfile = async () => {
    try {
      const token = getToken('admin');

      if (!token) {
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const mappedUser: AdminUserData = {
        id: String(data.id),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email || '',
        sliitId: data.sliitId || '',
        role: data.role || 'SYSTEM_ADMIN',
        profileImage: data.profileImage || '',
      };

      setUser(mappedUser);
      setFormData(mappedUser);
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
    }
  };

  const roleLabel = useMemo(() => {
    switch ((user.role || '').toUpperCase()) {
      case 'TECHNICIAN':
        return 'Technician';
      case 'SYSTEM_ADMIN':
        return 'System Admin';
      case 'ACADEMIC':
        return 'Academic Staff';
      case 'NON_ACADEMIC':
        return 'Non-Academic Staff';
      case 'STUDENT':
        return 'Student';
      default:
        return user.role;
    }
  }, [user.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
      return updated;
    });
  };

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setIsSaving(true);
      const token = getToken('admin');

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        sliitId: formData.sliitId,
        email: formData.email,
        password: password || '',
        profileImage: formData.profileImage || '',
      };

      const response = await axios.put(`${API_BASE_URL}/api/users/me`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const saved = response.data;
      const updatedUser = {
        id: String(saved.id),
        firstName: saved.firstName,
        lastName: saved.lastName,
        fullName: saved.fullName || `${saved.firstName} ${saved.lastName}`.trim(),
        email: saved.email,
        sliitId: saved.sliitId,
        role: saved.role,
        profileImage: saved.profileImage || '',
      };

      setUser(updatedUser);
      setFormData(updatedUser);
      setPassword('');
      setConfirmPassword('');

      updateUser(
        {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          name: updatedUser.fullName,
          email: updatedUser.email,
          sliitId: updatedUser.sliitId,
          role: updatedUser.role as any,
          profileImage: updatedUser.profileImage || null,
        },
        'admin'
      );

      setIsEditing(false);
      alert('Admin profile updated successfully.');
    } catch (error: any) {
      console.error('Failed to update admin profile:', error);
      alert(error?.response?.data?.message || 'Failed to update admin profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setPassword('');
    setConfirmPassword('');
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const token = getToken('admin');

      await axios.delete(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logout('admin');
      navigate('/admin/login', { replace: true });
    } catch (error: any) {
      console.error('Failed to delete admin account:', error);
      alert(error?.response?.data?.message || 'Failed to delete admin account.');
    } finally {
      setIsDeleting(false);
      setShowDeletePopup(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SYSTEM_ADMIN':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'TECHNICIAN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Admin Settings
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin Account</h1>
            <p className="mt-2 text-slate-600">
              Manage your administrator profile and security information.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-bold text-white shadow-lg">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName || 'Admin'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    {user.firstName?.charAt(0) || 'A'}
                    {user.lastName?.charAt(0) || ''}
                  </>
                )}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {user.fullName || 'Admin User'}
              </h2>
              <p className="mt-1 text-slate-500">{user.email || 'No email available'}</p>

              <span
                className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                <Shield size={16} />
                {roleLabel}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Admin ID
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {user.sliitId || 'Not available'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-emerald-600">
                  <BadgeCheck size={18} />
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Profile Details</h2>
                <p className="mt-1 text-slate-500">
                  Update your admin profile information here.
                </p>
              </div>

              {!isEditing ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Pencil size={18} />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => setShowDeletePopup(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                    Delete Profile
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
                  >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Admin ID</label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="sliitId"
                    value={formData.sliitId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Profile Picture Path</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="profileImage"
                    value={formData.profileImage || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="/images/admin.jpg or https://..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Leave blank to keep current password"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Repeat new password"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Current Role</label>
                <input
                  type="text"
                  value={roleLabel}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Admin Profile</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mb-6 text-slate-700">
              Are you sure you want to delete this admin account? After deletion, you will be logged out.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                disabled={isDeleting}
                className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-70"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}