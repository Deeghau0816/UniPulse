// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type UserRole =
  | 'STUDENT'
  | 'ACADEMIC'
  | 'NON_ACADEMIC'
  | 'TECHNICIAN'
  | 'SYSTEM_ADMIN';

export type PortalSide = 'user' | 'admin';

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
  fullName?: string;
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
  id?: string | number;
  sliitId?: string;
  provider?: string;
  profileCompleted?: boolean;
  exp?: number;
}

interface SessionState {
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  user: User | null;
  userPortalUser: User | null;
  adminPortalUser: User | null;
  loading: boolean;
  currentPortal: PortalSide;
  login: (user: RawUser, token?: string, portal?: PortalSide) => void;
  logout: (portal?: PortalSide) => void;
  updateUser: (userData: Partial<User>, portal?: PortalSide) => void;
  isAuthenticated: boolean;
  isUserAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  hasRole: (role: UserRole, portal?: PortalSide) => boolean;
  hasAnyRole: (roles: UserRole[], portal?: PortalSide) => boolean;
  getToken: (portal?: PortalSide) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_TOKEN_STORAGE_KEY = 'user_token';
const USER_DATA_STORAGE_KEY = 'user_data';
const ADMIN_TOKEN_STORAGE_KEY = 'admin_token';
const ADMIN_DATA_STORAGE_KEY = 'admin_data';
const LEGACY_TOKEN_STORAGE_KEY = 'token';
const LEGACY_TOKEN_STORAGE_KEY_ALT = 'authToken';
const LEGACY_USER_STORAGE_KEY = 'user';

const isAdminPortalPath = (pathname: string): boolean => {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard/admin') ||
    pathname.startsWith('/dashboard/resources') ||
    pathname.startsWith('/dashboard/technician') ||
    pathname.startsWith('/reservations/admin')
  );
};

const getPortalFromPath = (pathname: string): PortalSide =>
  isAdminPortalPath(pathname) ? 'admin' : 'user';

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

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
};

const normalizeRole = (rawRole?: string): UserRole => {
  const value = (rawRole || '').toUpperCase();

  switch (value) {
    case 'STUDENT':
      return 'STUDENT';
    case 'ACADEMIC':
    case 'LECTURER':
      return 'ACADEMIC';
    case 'NON_ACADEMIC':
      return 'NON_ACADEMIC';
    case 'TECHNICIAN':
      return 'TECHNICIAN';
    case 'SYSTEM_ADMIN':
    case 'ADMIN':
      return 'SYSTEM_ADMIN';
    default:
      return 'STUDENT';
  }
};

const normalizeProfileImage = (
  rawProfileImage?: string | null,
  provider?: string
): string | null => {
  if (!rawProfileImage) return null;

  const trimmed = rawProfileImage.trim();
  if (!trimmed) return null;

  const isUploadedImage = trimmed.startsWith('data:image/');

  if ((provider || '').toUpperCase() === 'GOOGLE' && !isUploadedImage) {
    return null;
  }

  return trimmed;
};

const normalizeUser = (rawUser: RawUser): User => {
  const firstName = rawUser.firstName;
  const lastName = rawUser.lastName;

  const fullName =
    rawUser.name ||
    rawUser.fullName ||
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
    profileImage: normalizeProfileImage(rawUser.profileImage, rawUser.provider),
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

  const id =
    payload.userId != null
      ? String(payload.userId)
      : payload.id != null
        ? String(payload.id)
        : email || 'oauth-user';

  const rawProfileImage = payload.profileImage ?? payload.picture ?? null;

  return {
    id,
    firstName,
    lastName,
    name: fullName,
    email,
    role: normalizeRole(payload.role ?? payload.roles?.[0] ?? payload.authorities?.[0]),
    profileImage: normalizeProfileImage(rawProfileImage, payload.provider),
    sliitId: payload.sliitId ?? null,
    provider: payload.provider,
    profileCompleted: payload.profileCompleted ?? true,
  };
};

const loadSessionFromStorage = (
  tokenKey: string,
  userKey: string
): SessionState => {
  const storedToken = localStorage.getItem(tokenKey);
  const storedUser = localStorage.getItem(userKey);

  let parsedStoredUser: User | null = null;

  if (storedUser) {
    try {
      parsedStoredUser = JSON.parse(storedUser) as User;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem(userKey);
    }
  }

  if (storedToken) {
    if (!isTokenExpired(storedToken)) {
      const payload = decodeJwtPayload(storedToken);

      if (payload) {
        const userFromToken = buildUserFromPayload(payload);

        const mergedUser: User = {
          ...userFromToken,
          ...parsedStoredUser,
          id: parsedStoredUser?.id || userFromToken.id,
          email: parsedStoredUser?.email || userFromToken.email,
          role: parsedStoredUser?.role || userFromToken.role,
          profileImage:
            parsedStoredUser?.profileImage ??
            userFromToken.profileImage ??
            null,
        };

        localStorage.setItem(userKey, JSON.stringify(mergedUser));
        return { user: mergedUser, token: storedToken };
      }

      if (parsedStoredUser) {
        return { user: parsedStoredUser, token: storedToken };
      }
    }

    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    return { user: null, token: null };
  }

  if (parsedStoredUser) {
    return { user: parsedStoredUser, token: null };
  }

  return { user: null, token: null };
};

const clearSessionStorage = (portal: PortalSide) => {
  if (portal === 'admin') {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_DATA_STORAGE_KEY);
  } else {
    localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_DATA_STORAGE_KEY);
  }
};

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const location = useLocation();

  const currentPortal = useMemo<PortalSide>(
    () => getPortalFromPath(location.pathname),
    [location.pathname]
  );

  const [userSession, setUserSession] = useState<SessionState>({
    user: null,
    token: null,
  });

  const [adminSession, setAdminSession] = useState<SessionState>({
    user: null,
    token: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userToken =
      localStorage.getItem(USER_TOKEN_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY_ALT);

    const userData =
      localStorage.getItem(USER_DATA_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_USER_STORAGE_KEY);

    if (!localStorage.getItem(USER_TOKEN_STORAGE_KEY) && userToken) {
      localStorage.setItem(USER_TOKEN_STORAGE_KEY, userToken);
    }

    if (!localStorage.getItem(USER_DATA_STORAGE_KEY) && userData) {
      localStorage.setItem(USER_DATA_STORAGE_KEY, userData);
    }

    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY_ALT);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);

    setUserSession(loadSessionFromStorage(USER_TOKEN_STORAGE_KEY, USER_DATA_STORAGE_KEY));
    setAdminSession(loadSessionFromStorage(ADMIN_TOKEN_STORAGE_KEY, ADMIN_DATA_STORAGE_KEY));
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setUserSession((prev) => {
        if (prev.token && isTokenExpired(prev.token)) {
          clearSessionStorage('user');
          return { user: null, token: null };
        }

        return prev;
      });

      setAdminSession((prev) => {
        if (prev.token && isTokenExpired(prev.token)) {
          clearSessionStorage('admin');
          return { user: null, token: null };
        }

        return prev;
      });
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const login = (
    userData: RawUser,
    token?: string,
    portal: PortalSide = currentPortal
  ) => {
    const normalizedUser = normalizeUser(userData);

    const session: SessionState = {
      user: normalizedUser,
      token: token ?? null,
    };

    if (portal === 'admin') {
      setAdminSession(session);
      localStorage.setItem(ADMIN_DATA_STORAGE_KEY, JSON.stringify(normalizedUser));

      if (token) {
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
      }

      return;
    }

    setUserSession(session);
    localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(normalizedUser));

    if (token) {
      localStorage.setItem(USER_TOKEN_STORAGE_KEY, token);
    }
  };

  const updateUser = (
    userData: Partial<User>,
    portal: PortalSide = currentPortal
  ) => {
    const normalizedUserData: Partial<User> = {
      ...userData,
      profileImage:
        userData.profileImage === undefined
          ? undefined
          : normalizeProfileImage(userData.profileImage, userData.provider),
    };

    if (portal === 'admin') {
      setAdminSession((prev) => {
        if (!prev.user) return prev;

        const updatedUser = {
          ...prev.user,
          ...normalizedUserData,
        };

        localStorage.setItem(ADMIN_DATA_STORAGE_KEY, JSON.stringify(updatedUser));

        return {
          ...prev,
          user: updatedUser,
        };
      });

      return;
    }

    setUserSession((prev) => {
      if (!prev.user) return prev;

      const updatedUser = {
        ...prev.user,
        ...normalizedUserData,
      };

      localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(updatedUser));

      return {
        ...prev,
        user: updatedUser,
      };
    });
  };

  const logout = (portal: PortalSide = currentPortal) => {
    if (portal === 'admin') {
      setAdminSession({
        user: null,
        token: null,
      });

      clearSessionStorage('admin');
      return;
    }

    setUserSession({
      user: null,
      token: null,
    });

    clearSessionStorage('user');
    localStorage.removeItem('selectedTechnician');
  };

  const getPortalUser = (portal: PortalSide) =>
    portal === 'admin' ? adminSession.user : userSession.user;

  const getToken = (portal: PortalSide = currentPortal) =>
    portal === 'admin' ? adminSession.token : userSession.token;

  const isAuthenticated = !!getPortalUser(currentPortal);
  const isUserAuthenticated = !!userSession.user;
  const isAdminAuthenticated = !!adminSession.user;

  const hasRole = (
    role: UserRole,
    portal: PortalSide = currentPortal
  ): boolean => {
    return getPortalUser(portal)?.role === role;
  };

  const hasAnyRole = (
    roles: UserRole[],
    portal: PortalSide = currentPortal
  ): boolean => {
    const portalUser = getPortalUser(portal);
    return portalUser ? roles.includes(portalUser.role) : false;
  };

  const value: AuthContextType = {
    user: getPortalUser(currentPortal),
    userPortalUser: userSession.user,
    adminPortalUser: adminSession.user,
    loading,
    currentPortal,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isUserAuthenticated,
    isAdminAuthenticated,
    hasRole,
    hasAnyRole,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};