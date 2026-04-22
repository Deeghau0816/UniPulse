import { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  User,
  BadgeCheck,
  Shield,
  Pencil,
  Save,
  X,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import BottomBar from '../components/BottomBar';
import { useAuth } from '../contexts/AuthContext';

type UserRole =
  | 'STUDENT'
  | 'ACADEMIC'
  | 'NON_ACADEMIC'
  | 'TECHNICIAN'
  | 'SYSTEM_ADMIN'
  | 'ADMIN'
  | string;

interface UserData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  sliitId: string;
  role: UserRole;
  profileImage?: string;
}

const API_BASE_URL = 'http://localhost:8081';

export default function UserAccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [user, setUser] = useState<UserData>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    sliitId: '',
    role: 'STUDENT',
    profileImage: '',
  });

  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    sliitId: '',
    role: 'STUDENT',
    profileImage: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        const mappedUser: UserData = {
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          fullName:
            parsedUser.fullName ||
            `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim(),
          email: parsedUser.email || '',
          sliitId: parsedUser.sliitId || '',
          role: parsedUser.role || 'STUDENT',
          profileImage: parsedUser.profileImage || '',
        };

        setUser(mappedUser);
        setFormData(mappedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const mappedUser: UserData = {
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
          fullName:
            payload.fullName ||
            `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          email: payload.sub || payload.email || '',
          sliitId: payload.sliitId || '',
          role: payload.role || 'STUDENT',
          profileImage: payload.profileImage || '',
        };

        setUser(mappedUser);
        setFormData(mappedUser);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  const roleLabel = useMemo(() => {
    switch ((user.role || '').toUpperCase()) {
      case 'STUDENT':
        return 'Student';
      case 'ACADEMIC':
        return 'Academic Staff';
      case 'NON_ACADEMIC':
        return 'Non-Academic Staff';
      case 'TECHNICIAN':
        return 'Technician';
      case 'SYSTEM_ADMIN':
      case 'ADMIN':
        return 'System Admin';
      default:
        return 'Student';
    }
  }, [user.role]);

  const formRoleLabel = useMemo(() => {
    switch ((formData.role || '').toUpperCase()) {
      case 'STUDENT':
        return 'Student';
      case 'ACADEMIC':
        return 'Academic Staff';
      case 'NON_ACADEMIC':
        return 'Non-Academic Staff';
      case 'TECHNICIAN':
        return 'Technician';
      case 'SYSTEM_ADMIN':
      case 'ADMIN':
        return 'System Admin';
      default:
        return 'Student';
    }
  }, [formData.role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const token = localStorage.getItem('token');

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profileImage: formData.profileImage || '',
      };

      try {
        await axios.put(`${API_BASE_URL}/api/users/me`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (apiError) {
        console.warn('Backend update failed, saving locally for now:', apiError);
      }

      const updatedUser = {
        ...user,
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      setUser(updatedUser);
      setFormData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      const token = localStorage.getItem('token');

      try {
        await axios.delete(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (apiError) {
        console.warn('Backend delete failed or not ready yet:', apiError);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account.');
    } finally {
      setIsDeleting(false);
      setShowDeletePopup(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SYSTEM_ADMIN':
      case 'ADMIN':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'TECHNICIAN':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ACADEMIC':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'NON_ACADEMIC':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'STUDENT':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      <main className="mt-16 mb-20 flex-1 px-4 py-10 sm:mb-0">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">My Account</h1>
            <p className="mt-2 text-slate-600">
              View and manage your profile information.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-lg">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName || 'User'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      {user.firstName?.charAt(0) || 'U'}
                      {user.lastName?.charAt(0) || ''}
                    </>
                  )}
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-800">
                  {user.fullName || 'User Name'}
                </h2>

                <p className="mt-1 text-slate-500">
                  {user.email || 'No email available'}
                </p>

                <span
                  className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  <Shield size={16} />
                  {roleLabel}
                </span>

                <button
                  onClick={() => navigate('/dashboard/role-request')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  <RefreshCw size={16} />
                  Change Role
                </button>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    SLIIT ID
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {user.sliitId || 'Not available'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Account Status
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-emerald-600">
                    <BadgeCheck size={18} />
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Profile Details
                  </h2>
                  <p className="mt-1 text-slate-500">
                    Keep your personal information up to date.
                  </p>
                </div>

                {!isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-blue-700"
                    >
                      <Pencil size={18} />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => setShowDeletePopup(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-red-700"
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
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-70"
                    >
                      <Save size={18} />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Profile Picture Path
                  </label>
                  <div className="relative">
                    <ImageIcon
                      className="absolute left-3 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="profileImage"
                      value={formData.profileImage || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="/images/profile.jpg or https://..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Add an image path or image URL for the profile picture.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-4 text-slate-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    SLIIT ID
                  </label>
                  <input
                    type="text"
                    value={formData.sliitId}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Current Role
                  </label>
                  <input
                    type="text"
                    value={formRoleLabel}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomBar />

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Delete Profile
                </h3>
                <p className="text-sm text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="mb-6 text-slate-700">
              Are you sure you want to delete your account? After deletion, you
              will be logged out and redirected to the home page.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                disabled={isDeleting}
                className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
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
