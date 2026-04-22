import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'USER' | 'TECHNICIAN' | 'ADMIN';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string | null;
  sliitId?: string | null;
  provider?: string;
  profileCompleted?: boolean;
}

interface RawUser {
  id: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string;
  profileImage?: string | null;
  sliitId?: string | null;
  provider?: string;
  profileCompleted?: boolean;
}

interface JwtPayload {
  sub?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  given_name?: string;
  family_name?: string;
  username?: string;
  email?: string;
  picture?: string;
  profileImage?: string;
  role?: string;
  roles?: string[];
  authorities?: string[];
  userId?: string | number;
  sliitId?: string;
  provider?: string;
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: RawUser, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_STORAGE_KEY = 'token';
const LEGACY_TOKEN_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'user';

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '='
    );

    return JSON.parse(atob(paddedPayload)) as JwtPayload;
  } catch (error) {
    console.error('Error decoding JWT payload:', error);
    return null;
  }
};

const normalizeRole = (rawRole?: string): UserRole => {
  if (!rawRole) return 'USER';

  if (rawRole === 'ADMIN') return 'ADMIN';
  if (rawRole === 'TECHNICIAN') return 'TECHNICIAN';

  if (rawRole === 'USER' || rawRole === 'STUDENT' || rawRole === 'LECTURER') {
    return 'USER';
  }

  return 'USER';
};

const normalizeUser = (rawUser: RawUser): User => {
  const firstName = rawUser.firstName;
  const lastName = rawUser.lastName;
  const fullName =
    rawUser.name ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    rawUser.email ||
    'User';

  return {
    id: String(rawUser.id),
    firstName,
    lastName,
    name: fullName,
    email: rawUser.email,
    role: normalizeRole(rawUser.role),
    profileImage: rawUser.profileImage ?? null,
    sliitId: rawUser.sliitId ?? null,
    provider: rawUser.provider,
    profileCompleted: rawUser.profileCompleted ?? true,
  };
};

const buildUserFromPayload = (payload: JwtPayload): User => {
  const email = payload.email ?? payload.sub ?? '';
  const firstName = payload.firstName ?? payload.given_name ?? undefined;
  const lastName = payload.lastName ?? payload.family_name ?? undefined;
  const fullName =
    payload.name ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    payload.username ||
    email ||
    'OAuth User';

  const id = payload.userId != null ? String(payload.userId) : email || 'oauth-user';
  const profileImage = payload.profileImage ?? payload.picture ?? null;

  return {
    id,
    firstName,
    lastName,
    name: fullName,
    email,
    role: normalizeRole(payload.role ?? payload.roles?.[0] ?? payload.authorities?.[0]),
    profileImage,
    sliitId: payload.sliitId ?? null,
    provider: payload.provider,
    profileCompleted: payload.profileCompleted ?? true,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem(TOKEN_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);

    if (storedToken) {
      const payload = decodeJwtPayload(storedToken);

      if (payload) {
        const userFromToken = buildUserFromPayload(payload);
        setUser(userFromToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userFromToken));
        setLoading(false);
        return;
      }

      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    }

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    setLoading(false);
  }, []);

  const login = (userData: RawUser, token?: string) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem('selectedTechnician');
  };

  const isAuthenticated = !!user;

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
