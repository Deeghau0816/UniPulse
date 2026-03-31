import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TechnicianDashboardPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [tab, setTab] = useState('assigned');

  const tickets = [
    {
      id: 'TKT-001',
      category: 'Electrical',
      location: 'Lab Building - Room 203',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Nimal Perera',
      description: 'Power outage in computer lab affecting multiple workstations.',
      createdAt: '2026-03-30T10:30:00Z',
    },
    {
      id: 'TKT-002',
      category: 'IT Support',
      location: 'Library - Digital Section',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: 'Nimal Perera',
      description: 'Student terminals are unable to connect to the campus network.',
      createdAt: '2026-03-30T09:15:00Z',
    },
    {
      id: 'TKT-003',
      category: 'Mechanical',
      location: 'Student Center - Main Hall',
      priority: 'LOW',
      status: 'RESOLVED',
      assignedTo: 'Nimal Perera',
      description: 'Air conditioning unit is making noise and cooling poorly.',
      createdAt: '2026-03-29T14:20:00Z',
    },
    {
      id: 'TKT-004',
      category: 'Lab Equipment',
      location: 'Physics Lab 02',
      priority: 'CRITICAL',
      status: 'OPEN',
      assignedTo: 'Nimal Perera',
      description: 'Oscilloscope and measuring equipment failing during practical.',
      createdAt: '2026-03-30T08:45:00Z',
    },
    {
      id: 'TKT-005',
      category: 'Electrical',
      location: 'Lecture Hall A',
      priority: 'MEDIUM',
      status: 'CLOSED',
      assignedTo: 'Nimal Perera',
      description: 'Faulty ceiling lights near the podium area were reported and repaired.',
      createdAt: '2026-03-29T11:30:00Z',
    },
  ];

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    if (tab === 'assigned') {
      filtered = filtered.filter((ticket) => ticket.assignedTo === 'Nimal Perera');
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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
  };

  const getStatusClass = (status) => {
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

  const getPriorityClass = (priority) => {
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

  const formatDate = (dateString) => {
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
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .technician-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e1b4b 100%);
          position: relative;
          overflow-x: hidden;
          color: white;
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
          background: linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(219, 234, 254, 0.78);
          max-width: 760px;
        }

        .summary-chip {
          padding: 12px 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
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
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          color: rgba(219, 234, 254, 0.85);
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #ffffff;
          border-color: transparent;
        }

        .filter-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 14px;
        }

        .input,
        .select {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: #fff;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
        }

        .select option {
          color: #111827;
        }

        .clear-btn {
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          color: #fff;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .results-text {
          font-size: 14px;
          color: rgba(219, 234, 254, 0.72);
          margin-bottom: 18px;
        }

        .ticket-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .ticket-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 22px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .ticket-card:hover {
          transform: translateY(-3px);
          border-color: rgba(96,165,250,0.42);
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
          font-size: 14px;
          color: rgba(219, 234, 254, 0.74);
        }

        .badge-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-end;
        }

        .badge {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .status-open { background: rgba(59,130,246,0.18); color: #93c5fd; border-color: rgba(147,197,253,0.35); }
        .status-progress { background: rgba(251,191,36,0.16); color: #fde68a; border-color: rgba(253,230,138,0.35); }
        .status-resolved { background: rgba(34,197,94,0.16); color: #86efac; border-color: rgba(134,239,172,0.35); }
        .status-closed { background: rgba(148,163,184,0.16); color: #cbd5e1; border-color: rgba(203,213,225,0.28); }
        .status-rejected { background: rgba(239,68,68,0.16); color: #fca5a5; border-color: rgba(252,165,165,0.35); }

        .priority-low { background: rgba(16,185,129,0.14); color: #6ee7b7; border-color: rgba(110,231,183,0.35); }
        .priority-medium { background: rgba(59,130,246,0.14); color: #93c5fd; border-color: rgba(147,197,253,0.35); }
        .priority-high { background: rgba(249,115,22,0.15); color: #fdba74; border-color: rgba(253,186,116,0.35); }
        .priority-critical { background: rgba(239,68,68,0.16); color: #fca5a5; border-color: rgba(252,165,165,0.35); }

        .ticket-description {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(219, 234, 254, 0.84);
          margin-bottom: 16px;
        }

        .ticket-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .meta-box {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 14px;
        }

        .meta-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(191, 219, 254, 0.68);
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .meta-value {
          font-size: 13px;
          color: #ffffff;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .ticket-date {
          font-size: 13px;
          color: rgba(191, 219, 254, 0.68);
        }

        .details-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.10);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .empty-state {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 24px;
          padding: 40px 24px;
          text-align: center;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .empty-text {
          font-size: 14px;
          color: rgba(219, 234, 254, 0.76);
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

          .ticket-top,
          .ticket-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="technician-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Technician Dashboard</h1>
              <p className="page-subtitle">
                View assigned incident tickets, check priorities, monitor progress, and open ticket details for updates.
              </p>
            </div>

            <div className="summary-chip">
              Assigned Technician: Nimal Perera
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
  <button className="tab-btn" onClick={() => navigate('/dashboard/my-tickets')}>
    My Tickets
  </button>
  <button className="tab-btn" onClick={() => navigate('/dashboard/notifications')}>
    Notifications
  </button>
  <button className="tab-btn" onClick={() => navigate('/dashboard/admin/tickets')}>
    Admin View
  </button>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  onChange={(e) => setPriorityFilter(e.target.value)}
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
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
                      <button
                        className="details-btn"
                        onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}
                      >
                        Open Ticket
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

export default TechnicianDashboardPage;