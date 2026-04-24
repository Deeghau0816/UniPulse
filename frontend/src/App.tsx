import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { AuthProvider, useAuth, type PortalSide } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import AdminDashboard from './pages/AdminDashboard';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MyTicketsPage from './pages/MyTicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import TechnicianTicketDetailsPage from './pages/TechnicianTicketDetailsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminTicketDetailsPage from './pages/AdminTicketDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import RoleRequestPage from './pages/RoleRequestPage';
import AdminRoleRequestsPage from './pages/AdminRoleRequestsPage';
import FacilitiesCataloguePage from './pages/FacilitiesCataloguePage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import AddResourcePage from './pages/AddResourcePage';
import CustomerFacilitiesPage from './pages/CustomerFacilitiesPage';
import CustomerResourceDetailsPage from './pages/CustomerResourceDetailsPage';
import UserPanel from './pages/reservation/UserPanel';
import AdminPanel from './pages/reservation/ReservationAdminPanel';
import CompleteProfilePage from './pages/CompleteProfilePage';
import UserAccountPage from './pages/UserAccountPage';
import AdminUserAccountPage from './pages/AdminUserAccountPage';
import AdminUsersPage from './pages/AdminUsersPage';

interface OAuthJwtPayload {
  profileCompleted?: boolean;
  sliitId?: string;
  userId?: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  sub?: string;
  role?: string;
  profileImage?: string;
  provider?: string;
}

function decodeJwtPayload(token: string): OAuthJwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '='
    );

    return JSON.parse(atob(paddedPayload)) as OAuthJwtPayload;
  } catch (error) {
    console.error('Failed to decode OAuth token payload:', error);
    return null;
  }
}

function OAuthSuccessHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect') || '/';

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const payload = decodeJwtPayload(token);
    const portal: PortalSide = redirect.startsWith('/admin') ? 'admin' : 'user';

    if (!payload) {
      navigate(portal === 'admin' ? '/admin/login' : '/login', { replace: true });
      return;
    }

    login(
      {
        id: payload.userId ?? payload.email ?? payload.sub ?? 'oauth-user',
        firstName: payload.firstName,
        lastName: payload.lastName,
        name: payload.name,
        email: payload.email ?? payload.sub ?? '',
        role: payload.role,
        profileImage: payload.profileImage ?? null,
        sliitId: payload.sliitId ?? null,
        provider: payload.provider,
        profileCompleted: payload.profileCompleted ?? true,
      },
      token,
      portal
    );

    if (redirect && redirect !== '/') {
      navigate(redirect, { replace: true });
      return;
    }

    if (portal === 'user' && (!payload.profileCompleted || !payload.sliitId)) {
      navigate('/complete-profile?after=home', { replace: true });
      return;
    }

    navigate(redirect, { replace: true });
  }, [login, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/oauth2/success" element={<OAuthSuccessHandler />} />

      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegistrationPage />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/account"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AdminUserAccountPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={[
              'STUDENT',
              'ACADEMIC',
              'NON_ACADEMIC',
              'TECHNICIAN',
              'SYSTEM_ADMIN',
            ]}
          >
            <UserAccountPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/role-request"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={['STUDENT', 'ACADEMIC', 'NON_ACADEMIC', 'TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <RoleRequestPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin/role-requests"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AdminRoleRequestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/notifications"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={[
              'STUDENT',
              'ACADEMIC',
              'NON_ACADEMIC',
              'TECHNICIAN',
              'SYSTEM_ADMIN',
            ]}
          >
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/my-tickets"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={['STUDENT', 'ACADEMIC', 'NON_ACADEMIC']}
          >
            <MyTicketsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/tickets/new"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={['STUDENT', 'ACADEMIC', 'NON_ACADEMIC']}
          >
            <CreateTicketPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/tickets/:ticketId"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={['STUDENT', 'ACADEMIC', 'NON_ACADEMIC']}
          >
            <TicketDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/technician/tickets"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRole="TECHNICIAN"
          >
            <TechnicianDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/technician/tickets/:ticketId"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRole="TECHNICIAN"
          >
            <TechnicianTicketDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin/tickets"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AdminTicketsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin/tickets/:ticketId"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AdminTicketDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/resources"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <FacilitiesCataloguePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/resources/new"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AddResourcePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/resources/:resourceId"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <ResourceDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/resources"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={['STUDENT', 'ACADEMIC', 'NON_ACADEMIC', 'SYSTEM_ADMIN']}
          >
            <CustomerFacilitiesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/resources/:resourceId"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={['STUDENT', 'ACADEMIC', 'NON_ACADEMIC', 'SYSTEM_ADMIN']}
          >
            <CustomerResourceDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations/user"
        element={
          <ProtectedRoute
            portal="user"
            requiredRoles={['STUDENT', 'ACADEMIC', 'NON_ACADEMIC', 'SYSTEM_ADMIN']}
          >
            <UserPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations/admin"
        element={
          <ProtectedRoute
            portal="admin"
            fallbackPath="/admin/login"
            requiredRoles={['TECHNICIAN', 'SYSTEM_ADMIN']}
          >
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;