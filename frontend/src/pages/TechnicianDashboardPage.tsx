import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService, type TicketStatus, type TicketPriority, type TicketCategory } from '../services/ticketService';
import UnifiedNavbar from '../components/UnifiedNavbar';
import { useAuth } from '../contexts/AuthContext';

type DashboardTab = 'assigned' | 'open' | 'in_progress' | 'resolved';

type TechnicianTicket = {
  id: string;
  ticketCode: string;
  category: TicketCategory;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  description: string;
  createdAt: string;
};

const TechnicianDashboardPage = () => {
  const navigate = useNavigate();
  const { adminPortalUser } = useAuth();

  const currentTechnician = adminPortalUser?.name || 'Technician';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TicketPriority>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TicketCategory>('ALL');
  const [tab, setTab] = useState<DashboardTab>('assigned');

  const [tickets, setTickets] = useState<TechnicianTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus);
      
      // Update local state to reflect the change
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: newStatus }
            : ticket
        )
      );
      
      alert('Ticket status updated successfully!');
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      alert('Failed to update ticket status. Please try again.');
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const ticketResponses = await ticketService.getAllTickets();
        
        const technicianTickets: TechnicianTicket[] = ticketResponses.map(response => ({
          id: response.id.toString(),
          ticketCode: response.ticketCode,
          category: response.category,
          location: response.location,
          priority: response.priority,
          status: response.status,
          assignedTo: response.assignedTechnician || '',
          description: response.description,
          createdAt: response.createdAt,
        }));
        
        setTickets(technicianTickets);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
        setError('Failed to load tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    if (tab === 'assigned') {
      filtered = filtered.filter((ticket) => ticket.assignedTo === currentTechnician);
    } else if (tab === 'open') {
      filtered = filtered.filter((ticket) => ticket.status === 'OPEN');
    } else if (tab === 'in_progress') {
      filtered = filtered.filter((ticket) => ticket.status === 'IN_PROGRESS');
    } else if (tab === 'resolved') {
      filtered = filtered.filter((ticket) => ticket.status === 'RESOLVED');
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter);
    }

    return filtered;
  }, [tickets, tab, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const clearFilters = (): void => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
  };

  const getStatusClass = (status: TicketStatus): string => {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'RESOLVED':
        return 'status-resolved';
      case 'CLOSED':
        return 'status-closed';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority: TicketPriority): string => {
    switch (priority) {
      case 'LOW':
        return 'priority-low';
      case 'MEDIUM':
        return 'priority-medium';
      case 'HIGH':
        return 'priority-high';
      case 'CRITICAL':
        return 'priority-critical';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <UnifiedNavbar portal="admin" />
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .technician-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.12), transparent 22%),
            radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 20%),
            radial-gradient(circle at 82% 82%, rgba(24, 24, 27, 0.08), transparent 24%),
            linear-gradient(135deg, #ffffff 0%, #fafafa 48%, #fff7ed 100%);
          color: #111111;
        }

        .technician-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(17, 17, 17, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17, 17, 17, 0.03) 1px, transparent 1px);
          background-size: 38px 38px;
          animation: gridFloat 18s ease-in-out infinite;
          pointer-events: none;
          opacity: 0.55;
        }

        @keyframes gridFloat {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(8px, 8px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .accent-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.42;
        }

        .blob-1 {
          width: 340px;
          height: 340px;
          background: rgba(249, 115, 22, 0.18);
          top: -110px;
          left: -90px;
        }

        .blob-2 {
          width: 320px;
          height: 320px;
          background: rgba(251, 146, 60, 0.16);
          bottom: -100px;
          right: -70px;
        }

        .page-header {
          padding: 72px 72px 28px;
          position: relative;
          z-index: 2;
        }

        .header-content {
          max-width: 1360px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .page-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #111111;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 20px;
          line-height: 1.7;
          color: #080883;
          max-width: 760px;
          font-weight: 400;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
        }

        .summary-chip {
          padding: 12px 16px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e4e4e7;
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 6px 16px rgba(0,0,0,0.04);
        }

        .quick-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .quick-btn {
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #a4b5e3;
          background: #ffffff;
          color: #1e3a8a;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-btn:hover {
          background: #f0f9ff;
        }

        .content-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .content-container {
          max-width: 1360px;
          margin: 0 auto;
        }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .tab-btn {
          border: 1px solid #bccaf0;
          background: #ffffff;
          color: #1e3a8a;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .filter-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #9db2ec;
          border-radius: 22px;
          padding: 22px;
          margin-bottom: 22px;
          box-shadow: 0 10px 24px rgba(30, 58, 138, 0.05);
        }

        .filter-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 14px;
        }

        .input,
        .select {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #a8bcf3;
          background: #ffffff;
          color: #1e3a8a;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
        }

        .input::placeholder {
          color: #71717a;
        }

        .input:focus,
        .select:focus {
          border-color: #a3b7ef;
          box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.12);
        }

        .clear-btn {
          border: 1px solid #a3b6ec;
          background: #ffffff;
          color: #1e3a8a;
          padding: 14px 18px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .results-text {
          font-size: 14px;
          color: #1e3a8a;
          margin-bottom: 18px;
        }

        .ticket-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .ticket-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #ea580c;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ticket-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.07);
        }

        .ticket-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }

        .ticket-id {
          font-size: 13px;
          font-weight: 700;
          color: #ea580c;
          margin-bottom: 8px;
        }

        .ticket-category {
          font-size: 22px;
          font-weight: 800;
          color: black;
          margin-bottom: 6px;
        }

        .ticket-location {
          font-size: 14px;
          color: #52525b;
        }

        .badge-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-end;
        }

        .badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 3px 10px;
  border-radius: 16px;        /* rounded rectangle */
  border: 1px solid;
  font-size: 13px;
  font-weight: 500;
  min-width: 130px;
  justify-content: center;
}

        .status-open      { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
        .status-progress  { background: #fefce8; color: #a16207; border-color: #fde047; }
        .status-resolved  { background: #f0fdf4; color: #166534; border-color: #86efac; }
        .status-closed    { background: #eff6ff; color: #1d4ed8; border-color: #93c5fd; }
        .status-rejected  { background: #fdf2f8; color: #9d174d; border-color: #f9a8d4; }

        .priority-low      { background: #f8fafc; color: #475569; border-color: #cbd5e1; }
        .priority-medium   { background: #fefce8; color: #a16207; border-color: #fde047; }
        .priority-high     { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
        .priority-critical { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }

        .ticket-description {
          font-size: 14px;
          line-height: 1.7;
          color: #1e3a8a;
          margin-bottom: 16px;
        }

        .ticket-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .meta-box {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          padding: 14px;
        }

        .meta-label {
          font-size: 11px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .meta-value {
          font-size: 13px;
          color: #1e3a8a;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #1e3a8a;
        }

        .ticket-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .status-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-btn {
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .status-btn:hover {
          transform: translateY(-1px);
        }

        .status-btn.status-progress {
  background: linear-gradient(135deg, #93c5fd, #bfdbfe);
  color: #1e40af;
  box-shadow: 0 4px 12px rgba(147, 197, 253, 0.4);
}

.status-btn.status-resolved {
  background: linear-gradient(135deg, #6ee7b7, #a7f3d0);
  color: #065f46;
  box-shadow: 0 4px 12px rgba(110, 231, 183, 0.4);
}

.status-btn.status-closed {
  background: linear-gradient(135deg, #d1d5db, #e5e7eb);
  color: #374151;
  box-shadow: 0 4px 12px rgba(209, 213, 219, 0.4);
}

.status-btn.status-open {
  background: linear-gradient(135deg, #fcd34d, #fde68a);
  color: #92400e;
  box-shadow: 0 4px 12px rgba(252, 211, 77, 0.4);
}

.message-btn {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: linear-gradient(135deg, #6ee7b7, #a7f3d0);
  color: #065f46;
  box-shadow: 0 4px 12px rgba(110, 231, 183, 0.4);
}

.message-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(110, 231, 183, 0.5);
}
        .ticket-date {
          font-size: 13px;
          color: #1e3a8a;
        }

        .details-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .empty-state {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 40px 24px;
          text-align: center;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }

        .empty-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #111111;
        }

        .empty-text {
          font-size: 14px;
          color: #52525b;
          line-height: 1.7;
        }

        @media (max-width: 1180px) {
          .page-header,
          .content-section {
            padding-left: 40px;
            padding-right: 40px;
          }

          .ticket-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 980px) {
          .filter-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 52px 24px 20px;
          }

          .content-section {
            padding: 0 24px 48px;
          }

          .page-title {
            font-size: 34px;
          }

          .filter-grid,
          .ticket-meta {
            grid-template-columns: 1fr;
          }

          .header-content,
          .header-right,
          .quick-links,
          .ticket-top,
          .ticket-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="technician-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Technician Dashboard</h1>
              <p className="page-subtitle">
                View assigned incident tickets, check priorities, monitor progress, and open ticket details for updates.
              </p>
            </div>

            <div className="header-right">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px',
                  background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
                  padding: '10px 16px', boxShadow: '0 6px 16px rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#52525b' }}>Viewing as:</span>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#ea580c' }}>
                    {currentTechnician}
                  </span>
                </div>

                <div className="quick-links">
                  
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="content-container">
            <div className="tabs">
              <button
                className={`tab-btn ${tab === 'assigned' ? 'active' : ''}`}
                onClick={() => setTab('assigned')}
              >
                Assigned to Me
              </button>
              <button
                className={`tab-btn ${tab === 'open' ? 'active' : ''}`}
                onClick={() => setTab('open')}
              >
                Open
              </button>
              <button
                className={`tab-btn ${tab === 'in_progress' ? 'active' : ''}`}
                onClick={() => setTab('in_progress')}
              >
                In Progress
              </button>
              <button
                className={`tab-btn ${tab === 'resolved' ? 'active' : ''}`}
                onClick={() => setTab('resolved')}
              >
                Resolved
              </button>
            </div>

            <div className="filter-card">
              <div className="filter-grid">
                <input
                  className="input"
                  type="text"
                  placeholder="Search by ticket ID, category, location, or description"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />

                <select
                  className="select"
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setStatusFilter(e.target.value as 'ALL' | TicketStatus)
                  }
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                <select
                  className="select"
                  value={priorityFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setPriorityFilter(e.target.value as 'ALL' | TicketPriority)
                  }
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>

                <select
                  className="select"
                  value={categoryFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCategoryFilter(e.target.value as 'ALL' | TicketCategory)
                  }
                >
                  <option value="ALL">All Categories</option>
                  <option value="Electrical">Electrical</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                </select>

                <button className="clear-btn" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            </div>

            <div className="results-text">
              Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No Tickets Found</div>
                <div className="empty-text">
                  Try changing your filters or search terms to find assigned technician tickets.
                </div>
              </div>
            ) : (
              <div className="ticket-grid">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-top">
                      <div>
                        <div className="ticket-id">{ticket.id}</div>
                        <div className="ticket-category">{ticket.category}</div>
                        <div className="ticket-location">{ticket.location}</div>
                      </div>

                      <div className="badge-wrap">
                        <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`badge ${getStatusClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-description">{ticket.description}</div>

                    <div className="ticket-meta">
                      <div className="meta-box">
                        <div className="meta-label">Assigned To</div>
                        <div className="meta-value">{ticket.assignedTo}</div>
                      </div>
                      <div className="meta-box">
                        <div className="meta-label">Created At</div>
                        <div className="meta-value">{formatDate(ticket.createdAt)}</div>
                      </div>
                    </div>

                    <div className="ticket-footer">
                      <div className="ticket-date">Ready for technician update</div>
                      <div className="ticket-actions">
                        {/* Show status update buttons only for assigned tickets */}
                        {ticket.assignedTo === currentTechnician && (
                          <div className="status-buttons">
                            {ticket.status === 'OPEN' && (
                              <button
                                className="status-btn status-progress"
                                onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                              >
                                Accept & Start Work
                              </button>
                            )}
                            {ticket.status === 'IN_PROGRESS' && (
                              <>
                                <button
                                  className="status-btn status-resolved"
                                  onClick={() => handleStatusUpdate(ticket.id, 'RESOLVED')}
                                >
                                  Mark as Resolved
                                </button>
                                <button
                                  className="status-btn status-open"
                                  onClick={() => handleStatusUpdate(ticket.id, 'OPEN')}
                                >
                                  Reopen Ticket
                                </button>
                              </>
                            )}
                            {ticket.status === 'RESOLVED' && (
                              <>
                                <button
                                  className="status-btn status-closed"
                                  onClick={() => handleStatusUpdate(ticket.id, 'CLOSED')}
                                >
                                  Close Ticket
                                </button>
                                <button
                                  className="status-btn status-progress"
                                  onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                                >
                                  Reopen for More Work
                                </button>
                              </>
                            )}
                            {ticket.status === 'CLOSED' && (
                              <button
                                className="status-btn status-progress"
                                onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                              >
                                Reopen Ticket
                              </button>
                            )}
                          </div>
                        )}
                        {/* Quick message button for assigned tickets */}
                        {ticket.assignedTo === currentTechnician && (
                          <button
                            className="message-btn"
                            onClick={() => navigate(`/dashboard/technician/tickets/${ticket.id}`)}
                          >
                            Send Message
                          </button>
                        )}
                        <button
                          className="details-btn"
                          onClick={() => navigate(`/dashboard/technician/tickets/${ticket.id}`)}
                        >
                          Open Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnicianDashboardPage;