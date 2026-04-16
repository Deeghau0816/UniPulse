import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceService, type ResourceResponse, type ResourceType } from '../services/resourceService';

const CustomerResourceDetailsPage = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ResourceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingDuration, setBookingDuration] = useState<string>('1');
  const [bookingPurpose, setBookingPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    if (!resourceId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getResourceById(resourceId);
      setResource(data);
    } catch (err) {
      setError('Failed to load resource details. Please try again later.');
      console.error('Error loading resource:', err);
    } finally {
      setLoading(false);
    }
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

  const handleBack = () => {
    navigate('/customer/resources');
  };

  const handleOpenBooking = () => {
    if (resource?.status !== 'ACTIVE') {
      alert('This resource is currently out of service and cannot be booked.');
      return;
    }
    setShowBookingModal(true);
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setBookingDate('');
    setBookingTime('');
    setBookingDuration('1');
    setBookingPurpose('');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !bookingPurpose) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate booking submission
    setTimeout(() => {
      alert(`Booking request submitted successfully!\n\nResource: ${resource?.name}\nDate: ${bookingDate}\nTime: ${bookingTime}\nDuration: ${bookingDuration} hour(s)\nPurpose: ${bookingPurpose}\n\nYou will receive a confirmation email shortly.`);
      setIsSubmitting(false);
      handleCloseBooking();
    }, 1500);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <>
        <style>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #eff6ff 100%);
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
        `}</style>
        <div className="loading-container">
          <div className="spinner" />
        </div>
      </>
    );
  }

  if (error || !resource) {
    return (
      <>
        <style>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #eff6ff 100%);
            padding: 40px;
          }
          .error-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
            border: 1.5px solid rgba(228, 228, 231, 0.8);
            border-radius: 24px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            max-width: 500px;
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 24px;
          }
          .error-title {
            font-size: 28px;
            font-weight: 800;
            color: #111111;
            margin-bottom: 12px;
          }
          .error-message {
            color: #52525b;
            font-size: 16px;
            line-height: 1.75;
            margin-bottom: 24px;
          }
          .back-btn {
            padding: 16px 24px;
            border-radius: 16px;
            border: 1.5px solid #e4e4e7;
            background: #ffffff;
            color: #111111;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .back-btn:hover {
            background: #fafafa;
            border-color: #93c5fd;
            transform: translateY(-2px);
          }
        `}</style>
        <div className="error-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Error</h2>
            <p className="error-message">{error || 'Resource not found'}</p>
            <button className="back-btn" onClick={handleBack}>
              ← Back to Resources
            </button>
          </div>
        </div>
      </>
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
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .details-page {
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
          background: linear-gradient(135deg, #111111 0%, #3b82f6 100%);
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

        .back-btn {
          padding: 16px 22px;
          border-radius: 16px;
          border: 1.5px solid #e4e4e7;
          background: rgba(255,255,255,0.95);
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.04);
        }

        .back-btn:hover {
          background: #ffffff;
          border-color: #93c5fd;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.12);
        }

        .details-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .details-container {
          max-width: 900px;
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

        .image-gallery {
          width: 100%;
          height: 400px;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .resource-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .image-gallery:hover .resource-image {
          transform: scale(1.05);
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: #3b82f6;
        }

        .booking-section {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1.5px solid #e4e4e7;
        }

        .booking-btn {
          width: 100%;
          padding: 18px 24px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .booking-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .booking-btn:hover::before {
          opacity: 1;
        }

        .booking-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .booking-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
          border: 1.5px solid rgba(228, 228, 231, 0.8);
          border-radius: 24px;
          padding: 36px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1.5px solid #e4e4e7;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #111111 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #71717a;
          transition: color 0.2s ease;
          padding: 4px;
        }

        .close-btn:hover {
          color: #111111;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #52525b;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid #e4e4e7;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .submit-btn {
          flex: 1;
          padding: 16px 24px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .cancel-btn {
          padding: 16px 24px;
          border: 1.5px solid #e4e4e7;
          border-radius: 14px;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #fafafa;
          border-color: #93c5fd;
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
          background: linear-gradient(135deg, #111111 0%, #3b82f6 100%);
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

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .info-card {
          padding: 20px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-radius: 16px;
          border: 1px solid #e4e4e7;
        }

        .info-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 8px;
        }

        .info-value {
          font-size: 16px;
          color: #111111;
          font-weight: 500;
        }

        .description-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 12px;
        }

        .description-text {
          color: #3f3f46;
          font-size: 15px;
          line-height: 1.8;
          padding: 20px;
          background: rgba(59, 130, 246, 0.03);
          border-radius: 16px;
          border-left: 4px solid #3b82f6;
        }

        .availability-section {
          margin-bottom: 24px;
        }

        .availability-card {
          padding: 20px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 16px;
          border: 1px solid #bfdbfe;
        }

        .availability-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .availability-text {
          color: #1e3a8a;
          font-size: 15px;
          line-height: 1.6;
        }

        .meta-section {
          padding-top: 24px;
          border-top: 1.5px solid #e4e4e7;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-radius: 14px;
          border: 1px solid #e4e4e7;
        }

        .meta-label {
          font-size: 13px;
          font-weight: 600;
          color: #52525b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .meta-value {
          font-size: 14px;
          color: #111111;
          font-weight: 500;
        }

        @media (max-width: 1280px) {
          .page-header,
          .details-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 768px) {
          .info-grid,
          .meta-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
          }

          .page-title {
            font-size: 32px;
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
              <button className="back-btn" onClick={handleBack}>
                ← Back to Browse
              </button>
            </div>
          </div>
        </div>

        <div className="details-section">
          <div className="details-container">
            <div className="details-card">
              <div className="card-header">
                <div>
                  <div className="resource-icon">{getResourceIcon(resource.type)}</div>
                  <h2 className="resource-name">{resource.name}</h2>
                  <p className="resource-type">{getTypeLabel(resource.type)}</p>
                </div>
                <div className="resource-badges">
                  <span className={`status-badge status-${resource.status.toLowerCase().replace('_', '-')}`}>
                    {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                  </span>
                </div>
              </div>

              {resource.imageUrl ? (
                <div className="image-gallery">
                  <img src={resource.imageUrl} alt={resource.name} className="resource-image" />
                </div>
              ) : (
                <div className="image-gallery">
                  <div className="image-placeholder">{getResourceIcon(resource.type)}</div>
                </div>
              )}

              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">📍 Location</div>
                  <div className="info-value">{resource.location}</div>
                </div>

                {resource.capacity && (
                  <div className="info-card">
                    <div className="info-label">👥 Capacity</div>
                    <div className="info-value">{resource.capacity} people</div>
                  </div>
                )}
              </div>

              <div className="description-section">
                <h3 className="section-title">Description</h3>
                <p className="description-text">{resource.description}</p>
              </div>

              <div className="availability-section">
                <div className="availability-card">
                  <div className="availability-title">
                    📅 Availability Schedule
                  </div>
                  <p className="availability-text">{resource.availabilityWindows}</p>
                </div>
              </div>

              <div className="meta-section">
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Resource ID</span>
                    <span className="meta-value">#{resource.id}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Last Updated</span>
                    <span className="meta-value">
                      {new Date(resource.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <button
                  className="booking-btn"
                  onClick={handleOpenBooking}
                  disabled={resource.status !== 'ACTIVE'}
                >
                  {resource.status === 'ACTIVE' ? '📅 Book This Resource' : '❌ Currently Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Book {resource?.name}</h3>
              <button className="close-btn" onClick={handleCloseBooking}>×</button>
            </div>
            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={getTodayDate()}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (hours)</label>
                <select
                  className="form-select"
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(e.target.value)}
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="8">Full day (8 hours)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the purpose of your booking..."
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseBooking}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerResourceDetailsPage;
