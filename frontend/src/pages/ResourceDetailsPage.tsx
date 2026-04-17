import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceService, type ResourceType, type ResourceStatus, type ResourceRequest } from '../services/resourceService';

const ResourceDetailsPage = () => {
  const navigate = useNavigate();
  const { resourceId } = useParams<{ resourceId: string }>();

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<ResourceRequest>({
    name: '',
    type: 'LECTURE_HALL',
    capacity: undefined,
    location: '',
    description: '',
    availabilityWindows: '',
    status: 'ACTIVE',
    imageUrl: '',
  });

  useEffect(() => {
    const fetchResource = async () => {
      if (!resourceId) return;

      try {
        setLoading(true);
        const response = await resourceService.getResourceById(resourceId);
        
        setResource(response);
        setFormData({
          name: response.name,
          type: response.type,
          capacity: response.capacity || undefined,
          location: response.location,
          description: response.description,
          availabilityWindows: response.availabilityWindows,
          status: response.status,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch resource:', err);
        setError('Failed to load resource details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'capacity') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) || undefined : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!resourceId) return;

    try {
      setIsSaving(true);
      await resourceService.updateResource(resourceId, formData);
      
      const updatedResponse = await resourceService.getResourceById(resourceId);
      setResource(updatedResponse);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update resource:', err);
      setError('Failed to update resource. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!resourceId) return;

    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      await resourceService.deleteResource(resourceId);
      navigate('/dashboard/resources');
    } catch (err) {
      console.error('Failed to delete resource:', err);
      setError('Failed to delete resource. Please try again.');
    }
  };

  const handleStatusToggle = async () => {
    if (!resourceId || !resource) return;

    const newStatus: ResourceStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';

    try {
      await resourceService.updateResourceStatus(resourceId, newStatus);
      const updatedResponse = await resourceService.getResourceById(resourceId);
      setResource(updatedResponse);
      setFormData({
        ...formData,
        status: newStatus,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update resource status. Please try again.');
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
          <p>Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (error && !resource) {
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

        .details-page {
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

        .details-page::before {
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
          align-items: center;
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

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .primary-btn,
        .secondary-btn,
        .danger-btn {
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

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
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

        .danger-btn {
          border: 1.5px solid #fecaca;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          color: #991b1b;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.1);
        }

        .danger-btn:hover {
          background: #fee2e2;
          border-color: #f87171;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
        }

        .details-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .details-container {
          max-width: 1360px;
          margin: 0 auto;
        }

        .details-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
          border: 1.5px solid rgba(228, 228, 231, 0.8);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 
            0 4px 20px rgba(0,0,0,0.06),
            0 0 0 1px rgba(255,255,255,0.5) inset;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1.5px solid #e4e4e7;
        }

        .resource-icon {
          font-size: 56px;
          margin-bottom: 14px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .resource-name {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #111111 0%, #52525b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          line-height: 1.2;
        }

        .resource-type {
          color: #71717a;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .status-badge {
          padding: 12px 20px;
          border-radius: 999px;
          font-size: 12px;
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

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 10px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 16px 18px;
          border-radius: 16px;
          border: 1.5px solid #e4e4e7;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #f97316;
          box-shadow: 
            0 0 0 4px rgba(249, 115, 22, 0.15),
            0 4px 12px rgba(249, 115, 22, 0.1);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .form-input:disabled,
        .form-select:disabled,
        .form-textarea:disabled {
          background: #fafafa;
          cursor: not-allowed;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-radius: 14px;
          margin-bottom: 14px;
          border: 1px solid #e4e4e7;
        }

        .info-label {
          font-size: 13px;
          font-weight: 600;
          color: #52525b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 14px;
          color: #111111;
          font-weight: 500;
        }

        .image-preview {
          margin-top: 12px;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid #e4e4e7;
          background: #fafafa;
        }

        .preview-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          display: block;
        }

        .preview-label {
          padding: 10px 14px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          font-size: 12px;
          font-weight: 600;
          color: #52525b;
          text-align: center;
          border-top: 1px solid #e4e4e7;
        }

        .error-message {
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #991b1b;
          margin-bottom: 20px;
        }

        @media (max-width: 1280px) {
          .page-header,
          .details-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 52px 24px 20px;
          }

          .details-section {
            padding-left: 24px;
            padding-right: 24px;
          }

          .page-title {
            font-size: 34px;
          }

          .header-content,
          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="details-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />
        <div className="accent-blob blob-3" />

        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Resource Details</h1>

            <div className="header-actions">
              <button className="secondary-btn" onClick={() => navigate('/dashboard/resources')}>
                ← Back to Catalogue
              </button>
              {!isEditing && (
                <>
                  <button className="primary-btn" onClick={() => setIsEditing(true)}>
                    Edit Resource
                  </button>
                  <button className="danger-btn" onClick={handleStatusToggle}>
                    {resource?.status === 'ACTIVE' ? 'Mark Out of Service' : 'Mark Active'}
                  </button>
                  <button className="danger-btn" onClick={handleDelete}>
                    Delete Resource
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button className="primary-btn" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="secondary-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="details-section">
          <div className="details-container">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="details-card">
              <div className="card-header">
                <div>
                  <div className="resource-icon">{getTypeIcon(resource?.type)}</div>
                  <div className="resource-name">{resource?.name}</div>
                  <div className="resource-type">{getTypeLabel(resource?.type)}</div>
                </div>

                <span className={`status-badge status-${resource?.status?.toLowerCase()}`}>
                  {resource?.status?.replace('_', ' ')}
                </span>
              </div>

              {isEditing ? (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Resource Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resource Type</label>
                    <select
                      name="type"
                      className="form-select"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="LAB">Lab</option>
                      <option value="MEETING_ROOM">Meeting Room</option>
                      <option value="EQUIPMENT">Equipment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capacity (Optional)</label>
                    <input
                      type="number"
                      name="capacity"
                      className="form-input"
                      value={formData.capacity || ''}
                      onChange={handleInputChange}
                      placeholder="Enter capacity"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Availability Windows</label>
                    <input
                      type="text"
                      name="availabilityWindows"
                      className="form-input"
                      value={formData.availabilityWindows}
                      onChange={handleInputChange}
                      placeholder="e.g., Mon-Fri 8AM-10PM, Sat 9AM-5PM"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Image URL (Optional)</label>
                    <input
                      type="url"
                      name="imageUrl"
                      className="form-input"
                      value={formData.imageUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/resource-image.jpg"
                    />
                    {formData.imageUrl && (
                      <div className="image-preview">
                        <img src={formData.imageUrl} alt="Preview" className="preview-image" />
                        <div className="preview-label">Image Preview</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <div className="info-row">
                      <span className="info-label">Resource Name</span>
                      <span className="info-value">{resource?.name}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="info-row">
                      <span className="info-label">Type</span>
                      <span className="info-value">{getTypeLabel(resource?.type)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="info-row">
                      <span className="info-label">Capacity</span>
                      <span className="info-value">{resource?.capacity || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <div className="info-row">
                      <span className="info-label">Location</span>
                      <span className="info-value">{resource?.location}</span>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <span className="info-label">Description</span>
                      <span className="info-value">{resource?.description}</span>
                    </div>
                  </div>

                  {resource?.imageUrl && (
                    <div className="form-group full-width">
                      <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px', padding: '0' }}>
                        <span className="info-label">Resource Image</span>
                        <div className="image-preview">
                          <img src={resource.imageUrl} alt={resource.name} className="preview-image" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group full-width">
                    <div className="info-row">
                      <span className="info-label">Availability</span>
                      <span className="info-value">{resource?.availabilityWindows}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="info-row">
                      <span className="info-label">Created At</span>
                      <span className="info-value">{formatDate(resource?.createdAt)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="info-row">
                      <span className="info-label">Last Updated</span>
                      <span className="info-value">{formatDate(resource?.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResourceDetailsPage;
