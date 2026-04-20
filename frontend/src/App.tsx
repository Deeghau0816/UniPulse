import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { type UserRole } from './contexts/AuthContext';

import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MyTicketsPage from './pages/MyTicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import TechnicianTicketDetailsPage from './pages/TechnicianTicketDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminTicketDetailsPage from './pages/AdminTicketDetailsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* User routes - USER role only */}
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

          {/* Technician routes - TECHNICIAN role only */}
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

          {/* Admin routes - ADMIN role only */}
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

          {/* Shared routes - multiple roles */}
          <Route
            path="/dashboard/notifications"
            element={
              <ProtectedRoute requiredRoles={['USER', 'TECHNICIAN', 'ADMIN']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route for unauthorized access */}
          <Route path="*" element={<UnauthorizedPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>);
}
import FacilitiesCataloguePage from './pages/FacilitiesCataloguePage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import AddResourcePage from './pages/AddResourcePage';
import CustomerFacilitiesPage from './pages/CustomerFacilitiesPage';
import CustomerResourceDetailsPage from './pages/CustomerResourceDetailsPage';
import UserPanel from './pages/reservation/UserPanel';
import AdminPanel from './pages/reservation/ReservationAdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard/my-tickets" element={<MyTicketsPage />} />
        <Route path="/dashboard/tickets/new" element={<CreateTicketPage />} />
        <Route path="/dashboard/tickets/:ticketId" element={<TicketDetailsPage />} />

        <Route
          path="/dashboard/technician/tickets"
          element={<TechnicianDashboardPage />}
        />

        <Route path="/dashboard/notifications" element={<NotificationsPage />} />
        <Route path="/dashboard/admin/tickets" element={<AdminTicketsPage />} />

        {/* Admin-only facilities management routes */}
        <Route path="/dashboard/resources" element={<FacilitiesCataloguePage />} />
        <Route path="/dashboard/resources/new" element={<AddResourcePage />} />
        <Route path="/dashboard/resources/:resourceId" element={<ResourceDetailsPage />} />

        {/* Customer-facing facilities routes */}
        <Route path="/customer/resources" element={<CustomerFacilitiesPage />} />
        <Route path="/customer/resources/:resourceId" element={<CustomerResourceDetailsPage />} />

         {/* Reservation Module Routes */}
        <Route path="/reservations/user"   element={<UserPanel />} />
        <Route path="/reservations/admin"  element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

