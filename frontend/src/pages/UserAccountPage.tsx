import { useEffect, useMemo, useRef, useState } from 'react';
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
  IdCard,
  Lock,
  Upload,
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
  | string;

interface UserData {
  id?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  sliitId: string;
  role: UserRole;
  profileImage?: string;
}

const API_BASE_URL = 'http://localhost:8081';
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

export default function UserAccountPage() {
  const navigate = useNavigate();
  const { logout, updateUser, userPortalUser, getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizeProfileImage = (image?: string | null, provider?: string) => {
    const value = image?.trim() || '';
    if (!value) return '';

    const isUploadedImage = value.startsWith('data:image/');
    if ((provider || '').toUpperCase() === 'GOOGLE' && !isUploadedImage) {
      return '';
    }

    return value;
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (userPortalUser) {
        const localMappedUser: UserData = {
          id: String(userPortalUser.id),
          firstName: userPortalUser.firstName || '',
          lastName: userPortalUser.lastName || '',
          fullName:
            userPortalUser.name ||
            `${userPortalUser.firstName || ''} ${userPortalUser.lastName || ''}`.trim(),
          email: userPortalUser.email || '',
          sliitId: userPortalUser.sliitId || '',
          role: userPortalUser.role || 'STUDENT',
          profileImage: normalizeProfileImage(
            userPortalUser.profileImage,
            userPortalUser.provider
          ),
        };

        setUser(localMappedUser);
        setFormData(localMappedUser);
      }

      await fetchProfile();
    };

    loadProfile();
    // IMPORTANT: keep this empty. Do not add userPortalUser here.
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getToken('user');

      if (!token) {
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data?.data || response.data;

      const mappedUser: UserData = {
        id: String(data.id),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName:
          data.fullName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email || '',
        sliitId: data.sliitId || '',
        role: data.role || 'STUDENT',
        profileImage: normalizeProfileImage(data.profileImage, data.provider),
      };

      setUser(mappedUser);
      setFormData(mappedUser);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

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
        return 'System Admin';
      default:
        return 'Student';
    }
  }, [user.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePickImage = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      alert('Please select an image smaller than 2 MB.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';

      setFormData((prev) => ({
        ...prev,
        profileImage: result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (!isEditing) return;

    setFormData((prev) => ({
      ...prev,
      profileImage: '',
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setIsSaving(true);

      const token = getToken('user');

      if (!token) {
        alert('You are not logged in. Please login again.');
        logout('user');
        navigate('/login');
        return;
      }

      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        sliitId: formData.sliitId,
        email: formData.email,
        profileImage: formData.profileImage || null,
      };

      if (password.trim() !== '') {
        payload.password = password;
      }

      const response = await axios.put(`${API_BASE_URL}/api/users/me`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const saved = response.data?.data || response.data;

      const updatedUser: UserData = {
        id: String(saved.id),
        firstName: saved.firstName || '',
        lastName: saved.lastName || '',
        fullName:
          saved.fullName ||
          `${saved.firstName || ''} ${saved.lastName || ''}`.trim(),
        email: saved.email || '',
        sliitId: saved.sliitId || '',
        role: saved.role || user.role,
        profileImage: normalizeProfileImage(saved.profileImage, saved.provider),
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
        'user'
      );

      setIsEditing(false);
      alert('Profile updated successfully.');
    } catch (error: any) {
      console.error('Failed to update profile:', error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data ||
        'Failed to update profile.';

      alert(backendMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setPassword('');
    setConfirmPassword('');
    setIsEditing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      const token = getToken('user');

      if (!token) {
        alert('You are not logged in. Please login again.');
        logout('user');
        navigate('/login');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logout('user');
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert(error?.response?.data?.message || 'Failed to delete account.');
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

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 read-only:bg-slate-50 read-only:text-slate-600';

  const primaryBtn =
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/35 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60';

  const dangerBtn =
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/35 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60';

  const successBtn =
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/35 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60';

  const neutralBtn =
    'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-700 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60';

  const darkBtn =
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-950 px-5 py-2.5 font-bold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-slate-900 hover:to-black hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60';

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
                  className={`mt-4 ${primaryBtn}`}
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

            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm lg:col-span-2">
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
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={primaryBtn}
                    >
                      <Pencil size={18} />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => setShowDeletePopup(true)}
                      className={dangerBtn}
                    >
                      <Trash2 size={18} />
                      Delete Profile
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={successBtn}
                    >
                      <Save size={18} />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>

                    <button onClick={handleCancel} className={neutralBtn}>
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
                    <User
                      className="absolute left-3 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Last Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={inputClass}
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
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    SLIIT ID
                  </label>
                  <div className="relative">
                    <IdCard
                      className="absolute left-3 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="sliitId"
                      value={formData.sliitId}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Profile Picture
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelected}
                    className="hidden"
                  />

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100 shadow-inner">
                        {formData.profileImage ? (
                          <img
                            src={formData.profileImage}
                            alt="Profile Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handlePickImage}
                          disabled={!isEditing}
                          className={darkBtn}
                        >
                          <Upload size={16} />
                          Choose Image
                        </button>

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={!isEditing}
                          className={neutralBtn}
                        >
                          <X size={16} />
                          Remove Image
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Click "Choose Image" to open your PC folders and upload a profile picture.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Leave blank to keep current password"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Repeat new password"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Current Role
                  </label>
                  <input
                    type="text"
                    value={roleLabel}
                    readOnly
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
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
                className={neutralBtn}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={dangerBtn}
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