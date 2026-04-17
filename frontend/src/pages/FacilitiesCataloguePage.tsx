import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService, type ResourceType, type ResourceStatus } from '../services/resourceService';

type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  description: string;
  availabilityWindows: string;
  status: ResourceStatus;
  createdAt: string;
};

const FacilitiesCataloguePage = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ResourceType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ResourceStatus>('ALL');
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE'>('ALL');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const resourceResponses = await resourceService.getAllResources();
        
        const resources: Resource[] = resourceResponses.map(response => ({
          id: response.id.toString(),
          name: response.name,
          type: response.type,
          capacity: response.capacity || undefined,
          location: response.location,
          description: response.description,
          availabilityWindows: response.availabilityWindows,
          status: response.status,
          createdAt: response.createdAt,
        }));
        
        setResources(resources);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || resource.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || resource.status === statusFilter;

      let matchesCapacity = true;
      if (capacityFilter !== 'ALL' && resource.capacity) {
        if (capacityFilter === 'SMALL') matchesCapacity = resource.capacity <= 30;
        else if (capacityFilter === 'MEDIUM') matchesCapacity = resource.capacity > 30 && resource.capacity <= 100;
        else if (capacityFilter === 'LARGE') matchesCapacity = resource.capacity > 100;
      }

      return matchesSearch && matchesType && matchesStatus && matchesCapacity;
    });
  }, [resources, searchTerm, typeFilter, statusFilter, capacityFilter]);

  const clearFilters = (): void => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setCapacityFilter('ALL');
  };

  const getStatusClass = (status: ResourceStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'OUT_OF_SERVICE':
        return 'status-out-of-service';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: ResourceType): string => {
    switch (type) {
      case 'LECTURE_HALL':
        return '🏛️';
      case 'LAB':
        return '🔬';
      case 'MEETING_ROOM':
        return '🤝';
      case 'EQUIPMENT':
        return '📦';
      default:
        return '📍';
    }
  };

  const getTypeLabel = (type: ResourceType): string => {
    switch (type) {
      case 'LECTURE_HALL':
        return 'Lecture Hall';
      case 'LAB':
        return 'Lab';
      case 'MEETING_ROOM':
        return 'Meeting Room';
      case 'EQUIPMENT':
        return 'Equipment';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
          <p>Loading facilities catalogue...</p>
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

        .facilities-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.15), transparent 25%),
            radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 22%),
            radial-gradient(circle at 82% 82%, rgba(24, 24, 27, 0.06), transparent 28%),
            radial-gradient(circle at 45% 55%, rgba(249, 115, 22, 0.08), transparent 30%),
            linear-gradient(135deg, #ffffff 0%, #fafafa 45%, #fff7ed 100%);
          color: #111111;
        }

        .facilities-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(17, 17, 17, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17, 17, 17, 0.025) 1px, transparent 1px);
          background-size: 42px 42px;
          animation: gridFloat 20s ease-in-out infinite;
          pointer-events: none;
          opacity: 0.45;
        }

        @keyframes gridFloat {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(10px, 10px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .accent-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.5;
          animation: blobFloat 12s ease-in-out infinite;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(251, 146, 60, 0.15));
          top: -140px;
          left: -120px;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(249, 115, 22, 0.12));
          bottom: -120px;
          right: -100px;
          animation-delay: -4s;
        }

        .blob-3 {
          width: 280px;
          height: 280px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(251, 146, 60, 0.1));
          top: 50%;
          right: 10%;
          animation-delay: -8s;
        }

        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
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
          font-size: 46px;
          font-weight: 800;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #111111 0%, #52525b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
        }

        .page-subtitle {
          font-size: 16px;
          line-height: 1.75;
          color: #52525b;
          max-width: 760px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .primary-btn,
        .secondary-btn {
          padding: 16px 22px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .primary-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .primary-btn:hover::before {
          opacity: 1;
        }

        .primary-btn {
          border: none;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          color: #ffffff;
          box-shadow: 
            0 4px 14px rgba(249, 115, 22, 0.3),
            0 0 0 1px rgba(249, 115, 22, 0.1) inset;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 24px rgba(249, 115, 22, 0.35),
            0 0 0 1px rgba(249, 115, 22, 0.15) inset;
        }

        .primary-btn:active {
          transform: translateY(0);
        }

        .secondary-btn {
          border: 1.5px solid #e4e4e7;
          background: rgba(255,255,255,0.95);
          color: #111111;
          box-shadow: 0 4px 14px rgba(0,0,0,0.04);
        }

        .secondary-btn:hover {
          background: #ffffff;
          border-color: #fdba74;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.12);
        }

        .filters-section {
          padding: 0 72px 28px;
          position: relative;
          z-index: 2;
        }

        .filters-container {
          max-width: 1360px;
          margin: 0 auto;
          background: rgba(255,255,255,0.95);
          border: 1.5px solid rgba(228, 228, 231, 0.8);
          border-radius: 24px;
          padding: 26px;
          box-shadow: 
            0 4px 20px rgba(0,0,0,0.06),
            0 0 0 1px rgba(255,255,255,0.5) inset;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 16px;
          align-items: end;
        }

        .search-box,
        .select-box {
          padding: 16px 18px;
          border-radius: 16px;
          border: 1.5px solid #e4e4e7;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          outline: none;
          width: 100%;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .search-box::placeholder {
          color: #a1a1aa;
        }

        .search-box:focus,
        .select-box:focus {
          border-color: #f97316;
          box-shadow: 
            0 0 0 4px rgba(249, 115, 22, 0.15),
            0 4px 12px rgba(249, 115, 22, 0.1);
        }

        .clear-btn {
          padding: 16px 20px;
          border-radius: 16px;
          border: 1.5px solid #e4e4e7;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .clear-btn:hover {
          background: #fafafa;
          border-color: #fdba74;
          transform: translateY(-1px);
        }

        .resources-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .resources-container {
          max-width: 1360px;
          margin: 0 auto;
        }

        .results-text {
          margin-bottom: 20px;
          font-size: 14px;
          color: #52525b;
          font-weight: 500;
          padding: 12px 16px;
          background: rgba(255,255,255,0.8);
          border-radius: 12px;
          border: 1px solid rgba(228, 228, 231, 0.6);
          display: inline-block;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 26px;
        }

        .resource-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
          border: 1.5px solid rgba(228, 228, 231, 0.8);
          border-radius: 24px;
          padding: 26px;
          box-shadow: 
            0 4px 20px rgba(0,0,0,0.06),
            0 0 0 1px rgba(255,255,255,0.5) inset;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .resource-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ea580c, #fb923c);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .resource-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 12px 40px rgba(249, 115, 22, 0.15),
            0 0 0 1px rgba(249, 115, 22, 0.2) inset;
          border-color: rgba(249, 115, 22, 0.3);
        }

        .resource-card:hover::before {
          opacity: 1;
        }

        .resource-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 18px;
        }

        .resource-icon {
          font-size: 40px;
          margin-bottom: 10px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .resource-name {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #111111 0%, #52525b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .resource-type {
          color: #71717a;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .resource-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badge {
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          border: 1.5px solid transparent;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .status-active { 
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
          color: #166534; 
          border-color: #86efac; 
        }
        .status-out-of-service { 
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
          color: #991b1b; 
          border-color: #fca5a5; 
        }

        .resource-location {
          color: #52525b;
          font-size: 14px;
          margin-bottom: 14px;
          font-weight: 500;
        }

        .resource-capacity {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          color: #52525b;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 14px;
          border: 1px solid #e4e4e7;
        }

        .resource-description {
          color: #3f3f46;
          font-size: 14px;
          line-height: 1.75;
          margin-bottom: 18px;
          padding: 14px;
          background: rgba(249, 115, 22, 0.03);
          border-radius: 12px;
          border-left: 3px solid #f97316;
        }

        .resource-availability {
          color: #52525b;
          font-size: 13px;
          margin-bottom: 18px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-radius: 14px;
          border: 1px solid #e4e4e7;
        }

        .resource-availability strong {
          color: #111111;
        }

        .resource-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding-top: 18px;
          border-top: 1.5px solid #e4e4e7;
        }

        .resource-date {
          font-size: 12px;
          color: #71717a;
          font-weight: 500;
        }

        .details-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
          position: relative;
          overflow: hidden;
        }

        .details-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .details-btn:hover::before {
          opacity: 1;
        }

        .details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.90) 100%);
          border: 1.5px solid rgba(228, 228, 231, 0.8);
          border-radius: 24px;
          box-shadow: 
            0 4px 20px rgba(0,0,0,0.06),
            0 0 0 1px rgba(255,255,255,0.5) inset;
        }

        .empty-icon {
          width: 90px;
          height: 90px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          color: #ea580c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2);
        }

        .empty-title {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #111111 0%, #52525b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }

        .empty-description {
          color: #52525b;
          font-size: 16px;
          line-height: 1.75;
        }

        @media (max-width: 1280px) {
          .page-header,
          .filters-section,
          .resources-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 1040px) {
          .filters-grid {
            grid-template-columns: 1fr 1fr;
          }

          .resources-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 52px 24px 20px;
          }

          .filters-section,
          .resources-section {
            padding-left: 24px;
            padding-right: 24px;
          }

          .page-title {
            font-size: 34px;
          }

          .header-content,
          .resource-header,
          .resource-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="facilities-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />
        <div className="accent-blob blob-3" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Facilities & Assets Catalogue</h1>
              <p className="page-subtitle">
                Browse and manage all bookable campus resources including lecture halls, labs, meeting rooms, and equipment.
              </p>
            </div>

            <div className="header-actions">
              <button className="primary-btn" onClick={() => navigate('/dashboard/resources/new')}>
                + Add New Resource
              </button>
              <button className="secondary-btn" onClick={() => navigate('/dashboard/my-tickets')}>
                My Tickets
              </button>
              <button className="secondary-btn" onClick={() => navigate('/dashboard/notifications')}>
                Notifications
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
                placeholder="Search by name, location, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="select-box"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'ALL' | ResourceType)}
              >
                <option value="ALL">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>

              <select
                className="select-box"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ResourceStatus)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>

              <select
                className="select-box"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value as 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE')}
              >
                <option value="ALL">All Capacities</option>
                <option value="SMALL">Small (&le;30)</option>
                <option value="MEDIUM">Medium (31-100)</option>
                <option value="LARGE">Large (&gt;100)</option>
              </select>

              <button className="clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="resources-section">
          <div className="resources-container">
            <div className="results-text">
              Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
            </div>

            {filteredResources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3 className="empty-title">No resources found</h3>
                <p className="empty-description">
                  {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' || capacityFilter !== 'ALL'
                    ? "Try adjusting your filters or search terms to find what you're looking for."
                    : 'No resources have been added to the catalogue yet. Click "Add New Resource" to get started.'}
                </p>
              </div>
            ) : (
              <div className="resources-grid">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="resource-card">
                    <div className="resource-header">
                      <div>
                        <div className="resource-icon">{getTypeIcon(resource.type)}</div>
                        <div className="resource-name">{resource.name}</div>
                        <div className="resource-type">{getTypeLabel(resource.type)}</div>
                      </div>

                      <div className="resource-badges">
                        <span className={`badge ${getStatusClass(resource.status)}`}>
                          {resource.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="resource-location">📍 {resource.location}</div>

                    {resource.capacity && (
                      <div className="resource-capacity">
                        <span>👥</span>
                        <span>Capacity: {resource.capacity}</span>
                      </div>
                    )}

                    <div className="resource-description">{resource.description}</div>

                    <div className="resource-availability">
                      <strong>Availability:</strong> {resource.availabilityWindows}
                    </div>

                    <div className="resource-footer">
                      <div className="resource-date">📅 Added {formatDate(resource.createdAt)}</div>
                      <button
                        className="details-btn"
                        onClick={() => navigate(`/dashboard/resources/${resource.id}`)}
                      >
                        View Details {'→'}
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

export default FacilitiesCataloguePage;
