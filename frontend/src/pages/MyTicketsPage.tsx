import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type TicketCategory = 'Electrical' | 'IT Support' | 'Mechanical' | 'Lab Equipment';

type Ticket = {
  id: string;
import { ticketService, type TicketStatus, type TicketPriority, type TicketCategory } from '../services/ticketService';

type Ticket = {
  id: string;
  ticketCode: string;
  category: TicketCategory;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
};

const MyTicketsPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TicketPriority>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TicketCategory>('ALL');

  const dummyTickets: Ticket[] = [
    {
      id: 'TKT-001',
      category: 'Electrical',
      location: 'Lab Building - Room 203',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      description:
        'Power outage in computer lab affecting multiple workstations and projector access.',
      createdAt: '2026-03-30T10:30:00Z',
    },
    {
      id: 'TKT-002',
      category: 'IT Support',
      location: 'Library - Digital Section',
      priority: 'MEDIUM',
      status: 'OPEN',
      description:
        'Student access terminals are unable to connect to the campus network.',
      createdAt: '2026-03-30T09:15:00Z',
    },
    {
      id: 'TKT-003',
      category: 'Mechanical',
      location: 'Student Center - Main Hall',
      priority: 'LOW',
      status: 'RESOLVED',
      description:
        'Air conditioning unit is making noise and cooling efficiency is reduced.',
      createdAt: '2026-03-29T14:20:00Z',
    },
    {
      id: 'TKT-004',
      category: 'Lab Equipment',
      location: 'Physics Lab 02',
      priority: 'CRITICAL',
      status: 'OPEN',
      description:
        'Oscilloscope and measuring equipment are failing during practical sessions.',
      createdAt: '2026-03-30T08:45:00Z',
    },
    {
      id: 'TKT-005',
      category: 'Electrical',
      location: 'Lecture Hall A',
      priority: 'MEDIUM',
      status: 'CLOSED',
      description:
        'Faulty ceiling lights near the front podium area were reported and repaired.',
      createdAt: '2026-03-29T11:30:00Z',
    },
    {
      id: 'TKT-006',
      category: 'IT Support',
      location: 'Computer Lab B',
      priority: 'HIGH',
      status: 'REJECTED',
      description:
        'Projector display issue was reported, but the submitted details were incomplete.',
      createdAt: '2026-03-28T13:20:00Z',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setTickets(dummyTickets);
        setLoading(false);
      } catch {
        setError('Failed to load tickets.');
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const ticketResponses = await ticketService.getAllTickets();
        
        const tickets: Ticket[] = ticketResponses.map(response => ({
          id: response.id.toString(),
          ticketCode: response.ticketCode,
          category: response.category,
          location: response.location,
          priority: response.priority,
          status: response.status,
          description: response.description,
          createdAt: response.createdAt,
        }));
        
        setTickets(tickets);
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
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

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

  if (loading) {
    return (
      <div className="loading-page">
        <style>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.12), transparent 22%),
              radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 20%),
              linear-gradient(135deg, #ffffff 0%, #fafafa 48%, #fff7ed 100%);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          }

          .loading-box {
            text-align: center;
            color: #111111;
          }

          .spinner {
            width: 46px;
            height: 46px;
            border: 3px solid #fed7aa;
            border-top-color: #f97316;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-box">
          <div className="spinner" />
          <p>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page">
        <style>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.12), transparent 22%),
              radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 20%),
              linear-gradient(135deg, #ffffff 0%, #fafafa 48%, #fff7ed 100%);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          }

          .error-box {
            text-align: center;
            color: #111111;
          }

          .retry-btn {
            margin-top: 16px;
            padding: 12px 18px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, #ea580c, #fb923c);
            color: #ffffff;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
        <div className="error-box">
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .tickets-page {
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

        .tickets-page::before {
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
          font-size: 15px;
          line-height: 1.7;
          color: #52525b;
          max-width: 760px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .primary-btn,
        .secondary-btn {
          padding: 14px 18px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .primary-btn {
          border: none;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .primary-btn:hover {
          transform: translateY(-1px);
        }

        .secondary-btn {
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
        }

        .secondary-btn:hover {
          background: #fafafa;
        }

        .filters-section {
          padding: 0 72px 28px;
          position: relative;
          z-index: 2;
        }

        .filters-container {
          max-width: 1360px;
          margin: 0 auto;
          background: rgba(255,255,255,0.90);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 14px;
          align-items: end;
        }

        .search-box,
        .select-box {
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          outline: none;
          width: 100%;
        }

        .search-box::placeholder {
          color: #71717a;
        }

        .search-box:focus,
        .select-box:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }

        .clear-btn {
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .tickets-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .tickets-container {
          max-width: 1360px;
          margin: 0 auto;
        }

        .results-text {
          margin-bottom: 18px;
          font-size: 14px;
          color: #52525b;
        }

        .tickets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 22px;
        }

        .ticket-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ticket-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.07);
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
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
          color: #111111;
          margin-bottom: 6px;
        }

        .ticket-location {
          color: #52525b;
          font-size: 14px;
        }

        .ticket-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badge {
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid transparent;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .status-open { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
        .status-progress { background: #fff7ed; color: #ea580c; border-color: #fb923c; }
        .status-resolved { background: #f4f4f5; color: #18181b; border-color: #d4d4d8; }
        .status-closed { background: #fafafa; color: #3f3f46; border-color: #d4d4d8; }
        .status-rejected { background: #111111; color: #ffffff; border-color: #111111; }

        .priority-low { background: #fafafa; color: #52525b; border-color: #d4d4d8; }
        .priority-medium { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
        .priority-high { background: #ffedd5; color: #c2410c; border-color: #fb923c; }
        .priority-critical { background: #111111; color: #ffffff; border-color: #111111; }

        .ticket-description {
          color: #3f3f46;
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #e4e4e7;
        }

        .ticket-date {
          font-size: 12px;
          color: #71717a;
        }

        .details-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .empty-state {
          text-align: center;
          padding: 70px 30px;
          background: rgba(255,255,255,0.90);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }

        .empty-icon {
          width: 76px;
          height: 76px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: #fff7ed;
          color: #ea580c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 800;
          color: #111111;
          margin-bottom: 8px;
        }

        .empty-description {
          color: #52525b;
          font-size: 15px;
          line-height: 1.7;
        }

        @media (max-width: 1280px) {
          .page-header,
          .filters-section,
          .tickets-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 1040px) {
          .filters-grid {
            grid-template-columns: 1fr 1fr;
          }

          .tickets-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 52px 24px 20px;
          }

          .filters-section,
          .tickets-section {
            padding-left: 24px;
            padding-right: 24px;
          }

          .page-title {
            font-size: 34px;
          }

          .header-content,
          .ticket-header,
          .ticket-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="tickets-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">My Incident Tickets</h1>
              <p className="page-subtitle">
                View and manage all your submitted incident tickets and track their current progress.
              </p>
            </div>

            <div className="header-actions">
              <button className="primary-btn" onClick={() => navigate('/dashboard/tickets/new')}>
                + Create New Ticket
              </button>
              <button className="secondary-btn" onClick={() => navigate('/dashboard/notifications')}>
                Notifications
              </button>
              <button
                className="secondary-btn"
                onClick={() => navigate('/dashboard/technician/tickets')}
              >
                Technician View
              </button>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="filters-container">
            <div className="filters-grid">
              <input
                type="text"
                className="search-box"
                placeholder="Search by ticket ID, category, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="select-box"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TicketStatus)}
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                className="select-box"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as 'ALL' | TicketPriority)}
              >
                <option value="ALL">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>

              <select
                className="select-box"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | TicketCategory)}
              >
                <option value="ALL">All Categories</option>
                <option value="Electrical">Electrical</option>
                <option value="IT Support">IT Support</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Lab Equipment">Lab Equipment</option>
              </select>

              <button className="clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="tickets-section">
          <div className="tickets-container">
            <div className="results-text">
              Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">No tickets found</h3>
                <p className="empty-description">
                  {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'
                    ? "Try adjusting your filters or search terms to find what you're looking for."
                    : 'You have not created any incident tickets yet. Click "Create New Ticket" to get started.'}
                </p>
              </div>
            ) : (
              <div className="tickets-grid">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-header">
                      <div>
                        <div className="ticket-id">{ticket.id}</div>
                        <div className="ticket-category">{ticket.category}</div>
                        <div className="ticket-location">📍 {ticket.location}</div>
                      </div>

                      <div className="ticket-badges">
                        <span className={`badge ${getStatusClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-description">{ticket.description}</div>

                    <div className="ticket-footer">
                      <div className="ticket-date">📅 {formatDate(ticket.createdAt)}</div>
                      <button
                        className="details-btn"
                        onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
                      >
                        View Details →
                      </button>
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

export default MyTicketsPage;