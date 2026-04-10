import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';



import LoginPage from './pages/LoginPage';

import MyTicketsPage from './pages/MyTicketsPage';

import CreateTicketPage from './pages/CreateTicketPage';

import TicketDetailsPage from './pages/TicketDetailsPage';

import TechnicianDashboardPage from './pages/TechnicianDashboardPage';

import NotificationsPage from './pages/NotificationsPage';

import AdminTicketsPage from './pages/AdminTicketsPage';



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

      </Routes>

    </BrowserRouter>

  );

}



export default App;

