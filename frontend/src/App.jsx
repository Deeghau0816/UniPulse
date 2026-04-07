import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MyTicketsPage from './pages/MyTicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminTicketsPage from './pages/AdminTicketsPage';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/my-tickets" element={<MyTicketsPage />} />
          <Route path="/dashboard/tickets/new" element={<CreateTicketPage />} />
          <Route path="/dashboard/tickets/:id" element={<TicketDetailsPage />} />
          <Route path="/dashboard/technician" element={<TechnicianDashboardPage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/admin/tickets" element={<AdminTicketsPage />} />
          {/* Add more routes here as you build them */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
