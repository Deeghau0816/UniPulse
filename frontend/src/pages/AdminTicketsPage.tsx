import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService, type TicketStatus, type TicketPriority, type TicketCategory } from '../services/ticketService';
import { analyticsService, type AnalyticsData } from '../services/analyticsService';
import { userService, type User } from '../services/userService';
import KPICard from '../components/KPICard';
import TicketCategoryChart from '../components/TicketCategoryChart';
import UnifiedNavbar from '../components/UnifiedNavbar';

type TechnicianFilter = 'ALL' | 'UNASSIGNED' | string;

type AdminTicket = {
  id: string;
  ticketCode: string;
  category: TicketCategory;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedTo: string;
  description: string;
  createdAt: string;
};

const AdminTicketsPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TicketPriority>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TicketCategory>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<TechnicianFilter>('ALL');

  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'overall' | 'today' | 'week' | 'month' | 'year'>('overall');

  // Technicians state
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [techniciansLoading, setTechniciansLoading] = useState<boolean>(true);

  const technicianOptions: string[] = technicians.map(t => t.name || `${t.firstName} ${t.lastName}`);

  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Analytics fetching
  const fetchAnalytics = async (period: typeof selectedPeriod) => {
    try {
      setAnalyticsLoading(true);
      let data: AnalyticsData;
      
      switch (period) {
        case 'today':
          data = await analyticsService.getTodayAnalytics();
          break;
        case 'week':
          data = await analyticsService.getWeekAnalytics();
          break;
        case 'month':
          data = await analyticsService.getMonthAnalytics();
          break;
        case 'year':
          data = await analyticsService.getYearAnalytics();
          break;
        default:
          data = await analyticsService.getOverallAnalytics();
          break;
      }
      
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setTechniciansLoading(true);
        console.log('Fetching technicians...');
        const techUsers = await userService.getTechnicians();
        console.log('Setting technicians state:', techUsers);
        setTechnicians(techUsers);
      } catch (error) {
        console.error('Failed to fetch technicians:', error);
      } finally {
        setTechniciansLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const ticketResponses = await ticketService.getAllTickets();
        
        const adminTickets: AdminTicket[] = ticketResponses.map(response => ({
          id: response.id.toString(),
          ticketCode: response.ticketCode,
          category: response.category,
          location: response.location,
          priority: response.priority,
          status: response.status,
          createdBy: response.createdBy,
          assignedTo: response.assignedTechnician || '',
          description: response.description,
          createdAt: response.createdAt,
        }));
        
        setTickets(adminTickets);
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

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    if (technicianFilter !== 'ALL') {
      if (technicianFilter === 'UNASSIGNED') {
        filtered = filtered.filter((ticket) => !ticket.assignedTo);
      } else {
        filtered = filtered.filter((ticket) => ticket.assignedTo === technicianFilter);
      }
    }

    return filtered;
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter, technicianFilter]);

  const clearFilters = (): void => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setTechnicianFilter('ALL');
  };

  const handleAssignTechnician = async (ticketId: string, technicianName: string): Promise<void> => {
    try {
      const techEntry = technicians.find(t => (t.name || `${t.firstName} ${t.lastName}`) === technicianName);
      const technicianType = techEntry?.role === 'TECHNICIAN' ? 'IT_SUPPORT' : undefined;
      await ticketService.assignTechnician(ticketId, technicianName, technicianType);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, assignedTo: technicianName }
            : ticket
        )
      );
      setAssignSuccess(ticketId);
      setTimeout(() => setAssignSuccess(null), 2500);
    } catch (error) {
      console.error('Failed to assign technician:', error);
    }
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

        .admin-page {
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

        .admin-page::before {
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
          max-width: 1400px;
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
          color: #111186;
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
        }

        .quick-btn {
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          font-size: 14px;

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
          z-index: 2;
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
          max-width: 1400px;
          margin: 0 auto;
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
          color: #1e3a8a;
          margin-bottom: 6px;
        }

        .content-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .filter-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #1e3a8a;
          border-radius: 22px;
          padding: 22px;
          margin-bottom: 22px;
          box-shadow: 0 10px 24px rgba(30, 58, 138, 0.05);
        }

        .filter-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
          gap: 14px;
        }

        .input,
        .select,
        .assign-select {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
        }

        .input::placeholder {
          color: #71717a;
        }

        .input:focus,
        .select:focus,
        .assign-select:focus {
          border-color: #1e3a8a;
          box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.12);
        }

        .clear-btn {
          border: 1px solid #1e3a8a;
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
          color: #111111;
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
  padding: 6px 16px;
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
          line-height: 1.5;
        }

        .assign-row {
          margin-bottom: 16px;
        }

        .assign-label {
          font-size: 12px;
          font-weight: 700;
          color: #71717a;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #1e3a8a;
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

        .kpi-section {
          padding: 0 24px 24px;
        }

        .analytics-section {
          padding: 0 24px 16px;
        }

        .kpi-grid {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: stretch;
        }

        .kpi-grid .kpi-card {
          flex: 1;
          min-width: 0;
        }

        .kpi-loading-grid {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: stretch;
        }

        .kpi-loading-grid .kpi-card {
          flex: 1;
          min-width: 0;
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

        @media (max-width: 1280px) {
          .page-header,
          .content-section {
            padding-left: 40px;
            padding-right: 40px;
          }

          .filter-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }

        @media (max-width: 1080px) {
          .ticket-grid {
            grid-template-columns: 1fr;
          }

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

      <div className="admin-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Admin Ticket Management</h1>
              <p className="page-subtitle">
                Review all incident tickets, monitor progress, assign technicians, and track key performance metrics.
              </p>
              <br></br>
            </div>

            <div className="header-right">
              <div className="period-selector">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
                  className="period-select"
                >
                  <option value="overall">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last 365 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Cards Section */}
          <div className="kpi-section">
            {analyticsLoading ? (
              <div className="kpi-loading-grid">
                <KPICard title="Total Open" value="..." loading={true} />
                <KPICard title="In Progress" value="..." loading={true} />
                <KPICard title="Resolved" value="..." loading={true} />
                <KPICard title="Overdue" value="..." loading={true} />
                <KPICard title="Avg Resolution Time" value="..." loading={true} />
              </div>
            ) : analytics ? (
              <div className="kpi-grid">
                <KPICard
                  title="Total Open"
                  value={analytics.totalOpenTickets}
                  icon="📋"
                  color="primary"
                  subtitle="Active tickets"
                />
                <KPICard
                  title="In Progress"
                  value={analytics.totalInProgressTickets}
                  icon="⚡"
                  color="warning"
                  subtitle="Being worked on"
                />
                <KPICard
                  title="Resolved"
                  value={analytics.totalResolvedTickets}
                  icon="✅"
                  color="success"
                  subtitle="Successfully completed"
                />
                <KPICard
                  title="Overdue"
                  value={analytics.totalOverdueTickets}
                  icon="⚠️"
                  color="danger"
                  subtitle="Past due date"
                />
                <KPICard
                  title="Avg Resolution Time"
                  value={analyticsService.formatResolutionTime(analytics.averageResolutionTime)}
                  icon="⏱️"
                  color="info"
                  subtitle="Time to complete"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Ticket Categories Chart Section */}
        <div className="analytics-section">
          <TicketCategoryChart />
        </div>

        <div className="content-section">
          <div className="content-container">
            <div className="filter-card">
              <div className="filter-grid">
                <input
                  className="input"
                  type="text"
                  placeholder="Search by ticket ID, category, creator, location..."
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

                <select
                  className="select"
                  value={technicianFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setTechnicianFilter(e.target.value)
                  }
                >
                  <option value="ALL">All Technicians</option>
                  <option value="UNASSIGNED">Unassigned</option>
                  {technicianOptions.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>

                <button className="clear-btn" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#52525b', fontSize: '15px' }}>
                Loading tickets...
              </div>
            )}
            {error && (
              <div style={{ textAlign: 'center', padding: '16px', color: '#dc2626', fontSize: '14px',
                background: '#fef2f2', borderRadius: '14px', border: '1px solid #fca5a5', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            <div className="results-text">
              Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No Tickets Found</div>
                <div className="empty-text">
                  Try changing your filters or search terms to view available incident tickets.
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
                        <div className="meta-label">Created By</div>
                        <div className="meta-value">{ticket.createdBy}</div>
                      </div>
                      <div className="meta-box">
                        <div className="meta-label">Created At</div>
                        <div className="meta-value">{formatDate(ticket.createdAt)}</div>
                      </div>
                    </div>

                    <div className="assign-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div className="assign-label">Assign Technician</div>
                        {assignSuccess === ticket.id && (
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700,
                            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '999px',
                            padding: '4px 10px' }}>✓ Assigned!</span>
                        )}
                      </div>
                      <select
                        className="assign-select"
                        value={ticket.assignedTo}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleAssignTechnician(ticket.id, e.target.value)
                        }
                      >
                        <option value="">— Unassigned —</option>
                        {technicians.length === 0 ? (
                          <option disabled>No technicians available</option>
                        ) : (
                          technicians.map((tech) => (
                            <option key={tech.id} value={tech.name || `${tech.firstName} ${tech.lastName}`}>
                              {tech.name || `${tech.firstName} ${tech.lastName}`}
                            </option>
                          ))
                        )}
                      </select>
                      {technicians.length === 0 && !techniciansLoading && (
                        <div style={{ fontSize: '12px', color: '#ea580c', marginTop: '4px' }}>
                          No technicians found. Please ensure users with TECHNICIAN role exist in the system.
                        </div>
                      )}
                    </div>

                    <div className="ticket-footer">
                      <div className="ticket-date">
                        {ticket.assignedTo
                          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ {ticket.assignedTo}</span>
                          : <span style={{ color: '#ea580c' }}>⚠ Unassigned</span>}
                      </div>

                      <button
                        className="details-btn"
                        onClick={() => navigate(`/dashboard/admin/tickets/${ticket.id}`)}
                      >
                        View Details
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

export default AdminTicketsPage;