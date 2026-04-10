import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService, type ResourceResponse, type ResourceType } from '../services/resourceService';

const CustomerFacilitiesPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCapacity, setFilterCapacity] = useState<string>('ALL');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (err) {
      setError('Failed to load resources. Please try again later.');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'ALL' || resource.type === filterType;
      const matchesStatus = filterStatus === 'ALL' || resource.status === filterStatus;

      let matchesCapacity = true;
      if (filterCapacity !== 'ALL' && resource.capacity) {
        if (filterCapacity === 'SMALL') matchesCapacity = resource.capacity <= 30;
        else if (filterCapacity === 'MEDIUM') matchesCapacity = resource.capacity > 30 && resource.capacity <= 100;
        else if (filterCapacity === 'LARGE') matchesCapacity = resource.capacity > 100;
      } else if (filterCapacity !== 'ALL' && !resource.capacity) {
        matchesCapacity = false;
      }

      return matchesSearch && matchesType && matchesStatus && matchesCapacity;
    });
  }, [resources, searchTerm, filterType, filterStatus, filterCapacity]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setFilterStatus('ALL');
    setFilterCapacity('ALL');
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'LECTURE_HALL': return '🏛️';
      case 'LAB': return '🔬';
      case 'MEETING_ROOM': return '🤝';
      case 'EQUIPMENT': return '📦';
      default: return '📍';
    }
  };

  const getTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'LECTURE_HALL': return 'Lecture Hall';
      case 'LAB': return 'Laboratory';
      case 'MEETING_ROOM': return 'Meeting Room';
      case 'EQUIPMENT': return 'Equipment';
      default: return type;
    }
  };

  const handleResourceClick = (resourceId: number) => {
    navigate(`/customer/resources/${resourceId}`);
  };

  const handleQuickBook = (e: React.MouseEvent, resourceId: number) => {
    e.stopPropagation();
    const resource = resources.find(r => r.id === resourceId);
    if (resource?.status !== 'ACTIVE') {
      alert('This resource is currently out of service and cannot be booked.');
      return;
    }
    navigate(`/customer/resources/${resourceId}`);
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .customer-facilities-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 10% 12%, rgba(59, 130, 246, 0.15), transparent 25%),
            radial-gradient(circle at 88% 18%, rgba(99, 102, 241, 0.12), transparent 22%),
            radial-gradient(circle at 82% 82%, rgba(24, 24, 27, 0.06), transparent 28%),
            radial-gradient(circle at 45% 55%, rgba(59, 130, 246, 0.08), transparent 30%),
            linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #eff6ff 100%);
          color: #111111;
        }

        .customer-facilities-page::before {
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
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.15));
          top: -140px;
          left: -120px;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(59, 130, 246, 0.12));
          bottom: -120px;
          right: -100px;
          animation-delay: -4s;
        }

        .blob-3 {
          width: 280px;
          height: 280px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.1));
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
        }

        .page-title {
          font-size: 52px;
          font-weight: 800;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #111111 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
        }

        .page-subtitle {
          font-size: 18px;
          line-height: 1.75;
          color: #52525b;
          max-width: 760px;
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
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 4px rgba(59, 130, 246, 0.15),
            0 4px 12px rgba(59, 130, 246, 0.1);
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
          border-color: #93c5fd;
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
          cursor: pointer;
        }

        .resource-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .resource-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 12px 40px rgba(59, 130, 246, 0.15),
            0 0 0 1px rgba(59, 130, 246, 0.2) inset;
          border-color: rgba(59, 130, 246, 0.3);
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

        .resource-thumbnail {
          width: 80px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .resource-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .resource-thumbnail-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #3b82f6;
        }

        .resource-icon {
          font-size: 40px;
          margin-bottom: 10px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .resource-name {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #111111 0%, #3b82f6 100%);
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
          display: flex;
          align-items: center;
          gap: 6px;
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
          background: rgba(59, 130, 246, 0.03);
          border-radius: 12px;
          border-left: 3px solid #3b82f6;
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

        .view-details-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .view-details-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .view-details-btn:hover::before {
          opacity: 1;
        }

        .view-details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .quick-book-btn {
          padding: 12px 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
          position: relative;
          overflow: hidden;
        }

        .quick-book-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .quick-book-btn:hover::before {
          opacity: 1;
        }

        .quick-book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .quick-book-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
        }

        .footer-buttons {
          display: flex;
          gap: 8px;
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
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
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

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e4e4e7;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1280px) {
          .page-header,
          .filters-section,
          .resources-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }

          .resources-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 36px;
          }
        }
      `}</style>

      <div className="customer-facilities-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />
        <div className="accent-blob blob-3" />

        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Browse Campus Resources</h1>
            <p className="page-subtitle">
              Explore and discover available lecture halls, laboratories, meeting rooms, and equipment across the campus. 
              Find the perfect space or resource for your needs.
            </p>
          </div>
        </div>

        <div className="filters-section">
          <div className="filters-container">
            <div className="filters-grid">
              <input
                type="text"
                className="search-box"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select className="select-box" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="ALL">All Types</option>
                <option value="LECTURE_HALL">Lecture Halls</option>
                <option value="LAB">Laboratories</option>
                <option value="MEETING_ROOM">Meeting Rooms</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>

              <select className="select-box" value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)}>
                <option value="ALL">All Capacities</option>
                <option value="SMALL">Small (&le;30)</option>
                <option value="MEDIUM">Medium (31-100)</option>
                <option value="LARGE">Large (&gt;100)</option>
              </select>

              <select className="select-box" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>

              <button className="clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="resources-section">
          <div className="resources-container">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner" />
              </div>
            ) : error ? (
              <div className="empty-state">
                <div className="empty-icon">⚠️</div>
                <h2 className="empty-title">Error Loading Resources</h2>
                <p className="empty-description">{error}</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h2 className="empty-title">No Resources Found</h2>
                <p className="empty-description">
                  {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL' || filterCapacity !== 'ALL'
                    ? 'Try adjusting your filters or search term to find what you\'re looking for.'
                    : 'There are no resources available at the moment.'}
                </p>
              </div>
            ) : (
              <>
                <div className="results-text">
                  Showing {filteredResources.length} of {resources.length} resources
                </div>
                <div className="resources-grid">
                  {filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="resource-card"
                      onClick={() => handleResourceClick(resource.id)}
                    >
                      <div className="resource-header">
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                          {resource.imageUrl ? (
                            <div className="resource-thumbnail">
                              <img src={resource.imageUrl} alt={resource.name} />
                            </div>
                          ) : (
                            <div className="resource-thumbnail-placeholder">
                              {getResourceIcon(resource.type)}
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <h3 className="resource-name">{resource.name}</h3>
                            <p className="resource-type">{getTypeLabel(resource.type)}</p>
                          </div>
                        </div>
                        <div className="resource-badges">
                          <span className={`badge status-${resource.status.toLowerCase().replace('_', '-')}`}>
                            {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                          </span>
                        </div>
                      </div>

                      <div className="resource-location">📍 {resource.location}</div>

                      {resource.capacity && (
                        <div className="resource-capacity">
                          👥 Capacity: {resource.capacity} people
                        </div>
                      )}

                      <p className="resource-description">{resource.description}</p>

                      <div className="resource-availability">
                        <strong>📅 Availability:</strong> {resource.availabilityWindows}
                      </div>

                      <div className="resource-footer">
                        <span className="resource-date">
                          Updated: {new Date(resource.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="footer-buttons">
                          <button
                            className="quick-book-btn"
                            onClick={(e) => handleQuickBook(e, resource.id)}
                            disabled={resource.status !== 'ACTIVE'}
                          >
                            📅 Book
                          </button>
                          <button className="view-details-btn">View Details →</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerFacilitiesPage;
