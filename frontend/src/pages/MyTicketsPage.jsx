import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyTicketsPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const dummyTickets = [
    {
      id: 'TKT-001',
      category: 'Electrical',
      location: 'Lab Building - Room 203',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      description: 'Power outage in computer lab affecting multiple workstations and projector access.',
      createdAt: '2026-03-30T10:30:00Z'
    },
    {
      id: 'TKT-002',
      category: 'IT Support',
      location: 'Library - Digital Section',
      priority: 'MEDIUM',
      status: 'OPEN',
      description: 'Student access terminals are unable to connect to the campus network.',
      createdAt: '2026-03-30T09:15:00Z'
    },
    {
      id: 'TKT-003',
      category: 'Lab Equipment',
      location: 'Physics Lab 02',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      description: 'Oscilloscope and measuring equipment are failing during scheduled practical sessions.',
      createdAt: '2026-03-30T08:45:00Z'
    },
    {
      id: 'TKT-004',
      category: 'Mechanical',
      location: 'Student Center - Main Hall',
      priority: 'LOW',
      status: 'RESOLVED',
      description: 'Air conditioning unit is making loud noise and cooling efficiency is reduced.',
      createdAt: '2026-03-29T14:20:00Z'
    },
    {
      id: 'TKT-005',
      category: 'Electrical',
      location: 'Lecture Hall A',
      priority: 'MEDIUM',
      status: 'CLOSED',
      description: 'Faulty ceiling lights near the front podium area were reported and repaired.',
      createdAt: '2026-03-29T11:30:00Z'
    },
    {
      id: 'TKT-006',
      category: 'IT Support',
      location: 'Computer Lab B',
      priority: 'HIGH',
      status: 'OPEN',
      description: 'Projector display is flickering and HDMI connection drops during lectures.',
      createdAt: '2026-03-30T13:00:00Z'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      try {
        setTickets(dummyTickets);
        setFilteredTickets(dummyTickets);
        setLoading(false);
      } catch (err) {
        setError('Failed to load tickets.');
        setLoading(false);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'RESOLVED': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'CLOSED': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'MEDIUM': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'HIGH': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'CRITICAL': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg">Failed to load tickets. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
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
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .tickets-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e1b4b 100%);
          position: relative;
          overflow-x: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.75;
        }

        .orb-1 {
          width: 460px;
          height: 460px;
          background: rgba(59, 130, 246, 0.22);
          top: -140px;
          left: -120px;
        }

        .orb-2 {
          width: 420px;
          height: 420px;
          background: rgba(139, 92, 246, 0.22);
          bottom: -140px;
          right: -100px;
        }

        .page-header {
          padding: 80px 72px 40px;
          position: relative;
          z-index: 2;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 40px;
        }

        .title-section h1 {
          font-size: 48px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-section p {
          font-size: 16px;
          color: rgba(219, 234, 254, 0.78);
          line-height: 1.6;
        }

        .create-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
        }

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(79, 70, 229, 0.35);
        }

        .filters-section {
          padding: 0 72px 40px;
          position: relative;
          z-index: 2;
        }

        .filters-container {
          max-width: 1400px;
          margin: 0 auto;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 16px;
          align-items: end;
        }

        .search-box {
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          font-size: 15px;
          outline: none;
          backdrop-filter: blur(14px);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-box:focus,
        .select-box:focus {
          border-color: rgba(96, 165, 250, 0.95);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
        }

        .select-box {
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          font-size: 15px;
          outline: none;
          backdrop-filter: blur(14px);
          cursor: pointer;
        }

        .select-box option {
          color: #111827;
        }

        .clear-btn {
          padding: 14px 20px;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #ffffff;
        }

        .results-row {
          max-width: 1400px;
          margin: 0 auto 18px;
          color: rgba(219, 234, 254, 0.72);
          font-size: 14px;
        }

        .tickets-section {
          padding: 0 72px 80px;
          position: relative;
          z-index: 2;
        }

        .tickets-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .tickets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .ticket-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .ticket-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.12);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 12px;
        }

        .ticket-id {
          font-size: 13px;
          font-weight: 700;
          color: #93c5fd;
          margin-bottom: 8px;
        }

        .ticket-category {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .ticket-location {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: rgba(219, 234, 254, 0.7);
          font-size: 14px;
        }

        .ticket-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1px solid;
        }

        .ticket-description {
          color: rgba(219, 234, 254, 0.8);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .ticket-date {
          color: rgba(219, 234, 254, 0.6);
          font-size: 12px;
        }

        .view-details-btn {
          padding: 8px 16px;
          background: rgba(96, 165, 250, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(96, 165, 250, 0.3);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-details-btn:hover {
          background: rgba(96, 165, 250, 0.3);
          color: #93c5fd;
          transform: translateY(-1px);
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 24px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .empty-description {
          color: rgba(219, 234, 254, 0.7);
          font-size: 16px;
          line-height: 1.6;
        }

        @media (max-width: 1280px) {
          .page-header, .filters-section, .tickets-section {
            padding-left: 44px;
            padding-right: 44px;
          }

          .tickets-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .filters-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .clear-btn {
            grid-column: span 2;
          }

          .tickets-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 60px 28px 30px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .title-section h1 {
            font-size: 36px;
          }

          .filters-section, .tickets-section {
            padding-left: 28px;
            padding-right: 28px;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .clear-btn {
            grid-column: span 1;
          }

          .tickets-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .ticket-card {
            padding: 20px;
          }

          .ticket-header,
          .ticket-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="tickets-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="page-header">
          <div className="header-content">
            <div className="title-section">
              <h1>My Incident Tickets</h1>
              <p>View and manage all your submitted incident tickets and track their current progress.</p>
            </div>
            <button className="create-btn" onClick={() => navigate('/dashboard/tickets/new')}>
              + Create New Ticket
            </button>
          </div>
        </div>

        <div className="filters-section">
          <div className="filters-container">
            <div className="filters-grid">
              <input
                type="text"
                className="search-box"
                placeholder="Search tickets by ID, category, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="select-box"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                onChange={(e) => setPriorityFilter(e.target.value)}
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
                onChange={(e) => setCategoryFilter(e.target.value)}
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

        <div className="results-row">
          Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
        </div>

        <div className="tickets-section">
          <div className="tickets-container">
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
                        <span className={`badge ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-description">
                      {ticket.description}
                    </div>

                    <div className="ticket-footer">
                      <div className="ticket-date">
                        📅 {formatDate(ticket.createdAt)}
                      </div>
                      <button
                        className="view-details-btn"
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