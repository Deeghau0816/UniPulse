import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

<<<<<<< HEAD
// Pages - Tickets
=======
import HomePage from './pages/HomePage';
>>>>>>> d2149b7 (backend and frontend changes)
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MyTicketsPage from './pages/MyTicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import TechnicianTicketDetailsPage from './pages/TechnicianTicketDetailsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminTicketDetailsPage from './pages/AdminTicketDetailsPage';
<<<<<<< HEAD
=======
import NotificationsPage from './pages/NotificationsPage';
import RoleRequestPage from './pages/RoleRequestPage';
import AdminRoleRequestsPage from './pages/AdminRoleRequestsPage';
>>>>>>> d2149b7 (backend and frontend changes)
import FacilitiesCataloguePage from './pages/FacilitiesCataloguePage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import AddResourcePage from './pages/AddResourcePage';
import CustomerFacilitiesPage from './pages/CustomerFacilitiesPage';
import CustomerResourceDetailsPage from './pages/CustomerResourceDetailsPage';
import UserPanel from './pages/reservation/UserPanel';
import AdminPanel from './pages/reservation/ReservationAdminPanel';
<<<<<<< HEAD
=======
import CompleteProfilePage from './pages/CompleteProfilePage';
import UserAccountPage from './pages/UserAccountPage';

interface OAuthJwtPayload {
  profileCompleted?: boolean;
  sliitId?: string;
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

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    localStorage.removeItem('user');
    localStorage.setItem('token', token);

    const payload = decodeJwtPayload(token);

    if (!payload?.profileCompleted || !payload?.sliitId) {
      navigate('/complete-profile', { replace: true });
      return;
    }

    navigate('/', { replace: true });
  }, [navigate, searchParams]);

  return <div>Logging in...</div>;
}
>>>>>>> d2149b7 (backend and frontend changes)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/oauth2/success" element={<OAuthSuccessHandler />} />

<<<<<<< HEAD
=======
          {/* Admin entry */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Account */}
          <Route
            path="/account"
            element={
              <ProtectedRoute requiredRoles={['USER', 'TECHNICIAN', 'ADMIN']}>
                <UserAccountPage />
              </ProtectedRoute>
            }
          />

>>>>>>> d2149b7 (backend and frontend changes)
          {/* User routes */}
          <Route
            path="/dashboard/my-tickets"
            element={
              <ProtectedRoute requiredRole="USER">
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tickets/new"
            element={
              <ProtectedRoute requiredRole="USER">
                <CreateTicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tickets/:ticketId"
            element={
              <ProtectedRoute requiredRole="USER">
                <TicketDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/role-request"
            element={
              <ProtectedRoute requiredRole="USER">
                <RoleRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Technician routes */}
          <Route
            path="/dashboard/technician/tickets"
            element={
              <ProtectedRoute requiredRole="TECHNICIAN">
                <TechnicianDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/technician/tickets/:ticketId"
            element={
              <ProtectedRoute requiredRole="TECHNICIAN">
                <TechnicianTicketDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/dashboard/admin/tickets"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/tickets/:ticketId"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminTicketDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/role-requests"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminRoleRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/resources"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <FacilitiesCataloguePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/resources/new"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AddResourcePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/resources/:resourceId"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ResourceDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

<<<<<<< HEAD
          {/* Admin-only facilities management routes */}
          <Route
            path="/dashboard/resources"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <FacilitiesCataloguePage />
=======
          {/* Shared user/admin routes */}
          <Route
            path="/customer/resources"
            element={
              <ProtectedRoute requiredRoles={['USER', 'ADMIN']}>
                <CustomerFacilitiesPage />
>>>>>>> d2149b7 (backend and frontend changes)
              </ProtectedRoute>
            }
          />
          <Route
<<<<<<< HEAD
            path="/dashboard/resources/new"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AddResourcePage />
=======
            path="/customer/resources/:resourceId"
            element={
              <ProtectedRoute requiredRoles={['USER', 'ADMIN']}>
                <CustomerResourceDetailsPage />
>>>>>>> d2149b7 (backend and frontend changes)
              </ProtectedRoute>
            }
          />
          <Route
<<<<<<< HEAD
            path="/dashboard/resources/:resourceId"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ResourceDetailsPage />
=======
            path="/reservations/user"
            element={
              <ProtectedRoute requiredRoles={['USER', 'ADMIN']}>
                <UserPanel />
>>>>>>> d2149b7 (backend and frontend changes)
              </ProtectedRoute>
            }
          />

<<<<<<< HEAD
          {/* Customer-facing facilities routes */}
          <Route path="/customer/resources" element={<CustomerFacilitiesPage />} />
          <Route path="/customer/resources/:resourceId" element={<CustomerResourceDetailsPage />} />

          {/* Reservation Module Routes */}
          <Route path="/reservations/user" element={<UserPanel />} />
          <Route path="/reservations/admin" element={<AdminPanel />} />

          {/* Shared routes - multiple roles */}
=======
          {/* Notifications */}
>>>>>>> d2149b7 (backend and frontend changes)
          <Route
            path="/dashboard/notifications"
            element={
              <ProtectedRoute requiredRoles={['USER', 'TECHNICIAN', 'ADMIN']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
<<<<<<< HEAD
          <Route path="*" element={<UnauthorizedPage />} />
=======
          <Route path="*" element={<Navigate to="/" replace />} />
>>>>>>> d2149b7 (backend and frontend changes)
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;