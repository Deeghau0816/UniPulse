import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketService, type TicketStatus, type TicketPriority } from '../services/ticketService';
import StatusIndicator from '../components/StatusIndicator';
import MessageChat from '../components/MessageChat';
import UnifiedNavbar from '../components/UnifiedNavbar';

type Attachment = {
  id: number;
  name: string;
  url: string;
};

type TicketDetails = {
  id: string;
  category: string;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
  preferredContact: string;
  createdBy: string;
  assignedTechnician: string;
  technicianType: string;
  resolutionNotes: string;
  rejectionReason: string;
  attachments: Attachment[];
};

const TechnicianTicketDetailsPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Resolution notes editing state
  const [isEditingResolutionNotes, setIsEditingResolutionNotes] = useState<boolean>(false);
  const [resolutionNotesText, setResolutionNotesText] = useState<string>('');
  const [isSavingResolutionNotes, setIsSavingResolutionNotes] = useState<boolean>(false);

  // Current technician state
  const [currentUserName] = useState(() => {
    return localStorage.getItem('selectedTechnician') || 'Current Technician';
  });

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) {
        setError('No ticket ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ticketResponse = await ticketService.getTicketById(ticketId);
        
        const ticketDetails: TicketDetails = {
          id: ticketResponse.id.toString(),
          category: ticketResponse.category,
          location: ticketResponse.location,
          priority: ticketResponse.priority,
          status: ticketResponse.status,
          description: ticketResponse.description,
          createdAt: ticketResponse.createdAt,
          preferredContact: ticketResponse.preferredContact,
          createdBy: ticketResponse.createdBy,
          assignedTechnician: ticketResponse.assignedTechnician || '',
          technicianType: ticketResponse.technicianType || '',
          resolutionNotes: ticketResponse.resolutionNotes || '',
          rejectionReason: ticketResponse.rejectionReason || '',
          attachments: ticketResponse.attachments?.map(att => ({
            id: att.id,
            name: att.originalFileName || att.fileName,
            url: `http://localhost:8083/api/tickets/${ticketResponse.id}/attachments/${att.id}`
          })) || [],
        };
        
        setTicket(ticketDetails);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch ticket details:', err);
        setError('Failed to load ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  const handleStatusUpdate = async (newStatus: TicketStatus): Promise<void> => {
    if (!ticketId) return;
    
    try {
      const updatedTicket = await ticketService.updateTicketStatus(ticketId, newStatus);
      
      // Update local state
      const ticketDetails: TicketDetails = {
        ...ticket!,
        status: updatedTicket.status,
      };
      
      setTicket(ticketDetails);
      alert('Ticket status updated successfully!');
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      alert('Failed to update ticket status. Please try again.');
    }
  };

  const handleDeleteTicket = async (): Promise<void> => {
    if (!ticket) return;
    
    try {
      setIsDeleting(true);
      await ticketService.deleteTicket(ticket.id);
      navigate('/dashboard/technician/tickets');
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditResolutionNotes = (): void => {
    setResolutionNotesText(ticket?.resolutionNotes || '');
    setIsEditingResolutionNotes(true);
  };

  const handleSaveResolutionNotes = async (): Promise<void> => {
    if (!ticketId) return;
    
    try {
      setIsSavingResolutionNotes(true);
      
      // Call the resolution notes API
      const response = await fetch(`http://localhost:8083/api/tickets/${ticketId}/resolution-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: resolutionNotesText,
          createdBy: currentUserName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resolution notes');
      }

      // Update local state
      setTicket(prev => prev ? { ...prev, resolutionNotes: resolutionNotesText } : null);
      setIsEditingResolutionNotes(false);
      alert('Resolution notes saved successfully!');
    } catch (error) {
      console.error('Failed to save resolution notes:', error);
      alert('Failed to save resolution notes. Please try again.');
    } finally {
      setIsSavingResolutionNotes(false);
    }
  };

  const handleCancelResolutionNotes = (): void => {
    setIsEditingResolutionNotes(false);
    setResolutionNotesText('');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="error-container">
        <div className="error-box">
          <p>{error || 'Ticket not found'}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

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

        .technician-ticket-details-page {
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

        .technician-ticket-details-page::before {
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
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .title-row {
          flex: 1;
          min-width: 300px;
        }

        .ticket-id {
          display: inline-block;
          padding: 6px 12px;
          background: rgba(249, 115, 22, 0.1);
          color: #ea580c;
          font-size: 12px;
          font-weight: 700;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .page-title {
          font-size: 42px;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: #111111;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 15px;
          line-height: 1.7;
          color: #52525b;
          margin: 0;
          max-width: 760px;
        }

        .top-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .nav-btn {
          padding: 10px 16px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: #fafafa;
          border-color: #f97316;
        }

        .primary-btn {
          padding: 10px 16px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.25);
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .delete-btn {
          padding: 10px 16px;
          background: #ffffff;
          color: #dc2626;
          border: 1px solid #d4d4d8;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-btn:hover {
          background: #fee2e2;
          border-color: #dc2626;
        }

        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .content-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .content-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #111111;
        }

        .info-grid {
          display: grid;
          gap: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .info-label {
          font-size: 14px;
          font-weight: 600;
          color: #52525b;
        }

        .info-value {
          font-size: 14px;
          color: #111111;
          font-weight: 500;
        }

        .priority-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .priority-low {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .priority-medium {
          background: rgba(251, 146, 60, 0.1);
          color: #ea580c;
        }

        .priority-high {
          background: rgba(249, 115, 22, 0.1);
          color: #ea580c;
        }

        .priority-critical {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }

        .meta-grid {
          display: grid;
          gap: 12px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .meta-label {
          font-size: 14px;
          font-weight: 600;
          color: #52525b;
        }

        .meta-value {
          font-size: 14px;
          color: #111111;
          font-weight: 500;
        }

        .description-box {
          background: #f9fafb;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          padding: 16px;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          margin-bottom: 16px;
        }

        .ticket-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .status-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .status-btn {
          padding: 8px 16px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-btn:hover {
          background: #fafafa;
          border-color: #f97316;
        }

        .status-btn.active {
          background: #f97316;
          color: white;
          border-color: #f97316;
        }

        .attachments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .attachment-card {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          position: relative;
        }

        .attachment-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .attachment-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 120px;
          background: #f3f4f6;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .attachment-fallback.hidden {
          display: none;
        }

        .file-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }

        .file-type {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
        }

        .attachment-name {
          font-size: 12px;
          color: #52525b;
          font-weight: 500;
          margin-bottom: 8px;
          word-break: break-all;
        }

        .download-btn {
          display: inline-block;
          padding: 6px 12px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .download-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .resolution-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 16px;
          font-size: 14px;
          line-height: 1.6;
          color: #166534;
        }

        .resolution-edit-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .resolution-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid #d4d4d8;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          background: #ffffff;
        }

        .resolution-textarea:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .resolution-edit-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .save-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          padding: 8px 16px;
          background: #ffffff;
          color: #52525b;
          border: 1px solid #d4d4d8;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resolution-display {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .edit-resolution-btn {
          align-self: flex-end;
          padding: 6px 12px;
          background: #ffffff;
          color: #ea580c;
          border: 1px solid #f97316;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-resolution-btn:hover {
          background: #fff7ed;
          border-color: #ea580c;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .dialog-box {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #111111;
        }

        .dialog-message {
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          margin-bottom: 24px;
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #ffffff;
        }

        .error-box {
          text-align: center;
          padding: 40px;
          border-radius: 16px;
          border: 1px solid #e4e4e7;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .retry-btn {
          margin-top: 16px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 1180px) {
          .page-header,
          .content-section {
            padding-left: 40px;
            padding-right: 40px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .meta-grid,
          .attachments-grid {
            grid-template-columns: 1fr;
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

          .card {
            padding: 18px;
          }

          .title-row,
          .top-actions {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="technician-ticket-details-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="page-header">
          <div className="header-content">
            <div className="title-row">
              <div className="ticket-id">{ticket.id}</div>
              <h1 className="page-title">Ticket Details</h1>
              <p className="page-subtitle">
                View and manage this incident ticket, communicate with the user, and update resolution status.
              </p>
            </div>

            <div className="top-actions">
              <button className="nav-btn" onClick={() => navigate('/dashboard/technician/tickets')}>
                Technician Dashboard
              </button>
              <button className="nav-btn" onClick={() => navigate('/dashboard/ticket-notifications')}>
                Notifications
              </button>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="content-container">
            <div className="details-grid">
              <div className="left-column">
                <div className="card">
                  <div className="card-title">Ticket Information</div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Category</span>
                      <span className="info-value">{ticket.category}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Location</span>
                      <span className="info-value">{ticket.location}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Priority</span>
                      <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <StatusIndicator status={ticket.status} />
                    </div>
                    <div className="info-item">
                      <span className="info-label">Created</span>
                      <span className="info-value">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Preferred Contact</span>
                      <span className="info-value">{ticket.preferredContact}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">User Information</div>
                  <div className="meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Created By</span>
                      <span className="meta-value">{ticket.createdBy}</span>
                    </div>
                    {ticket.technicianType && (
                      <div className="meta-item">
                        <span className="meta-label">Technician Type</span>
                        <span className="meta-value">{ticket.technicianType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="card">
                  <div className="card-title">Description</div>
                  <div className="description-box">
                    {ticket.description}
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Update Status</div>
                  <div className="status-actions">
                    <button 
                      className={`status-btn ${ticket.status === 'OPEN' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('OPEN')}
                      disabled={ticket.status === 'OPEN'}
                    >
                      Open
                    </button>
                    <button 
                      className={`status-btn ${ticket.status === 'IN_PROGRESS' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('IN_PROGRESS')}
                      disabled={ticket.status === 'IN_PROGRESS'}
                    >
                      In Progress
                    </button>
                    <button 
                      className={`status-btn ${ticket.status === 'RESOLVED' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('RESOLVED')}
                      disabled={ticket.status === 'RESOLVED'}
                    >
                      Resolved
                    </button>
                    <button 
                      className={`status-btn ${ticket.status === 'CLOSED' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('CLOSED')}
                      disabled={ticket.status === 'CLOSED'}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Attachments</div>

                  {ticket.attachments.length === 0 ? (
                    <div className="description-box">No attachments available.</div>
                  ) : (
                    <div className="attachments-grid">
                      {ticket.attachments.map((attachment) => (
                        <div key={attachment.id} className="attachment-card">
                          {attachment.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="attachment-image"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`attachment-fallback ${attachment.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? 'hidden' : ''}`}>
                            <div className="file-icon">{'\ud83d\udcce'}</div>
                            <div className="file-type">{attachment.name.split('.').pop()?.toUpperCase()}</div>
                          </div>
                          <div className="attachment-name">{attachment.name}</div>
                          <a 
                            href={attachment.url} 
                            download={attachment.name}
                            className="download-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="card-title">Resolution Notes</div>
                  
                  {isEditingResolutionNotes ? (
                    <div className="resolution-edit-form">
                      <textarea
                        className="resolution-textarea"
                        value={resolutionNotesText}
                        onChange={(e) => setResolutionNotesText(e.target.value)}
                        placeholder="Enter resolution details..."
                        rows={4}
                      />
                      <div className="resolution-edit-actions">
                        <button
                          className="save-btn"
                          onClick={handleSaveResolutionNotes}
                          disabled={isSavingResolutionNotes}
                        >
                          {isSavingResolutionNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={handleCancelResolutionNotes}
                          disabled={isSavingResolutionNotes}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="resolution-display">
                      <div className="resolution-box">
                        {ticket.resolutionNotes || 'No resolution notes have been added yet.'}
                      </div>
                      <button
                        className="edit-resolution-btn"
                        onClick={handleEditResolutionNotes}
                      >
                        {ticket.resolutionNotes ? 'Edit Notes' : 'Add Notes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="card-title">Direct Messages</div>
                  <MessageChat
                    ticketId={ticket.id}
                    currentUserName={currentUserName}
                    currentUserRole="TECHNICIAN"
                    recipientName={ticket.createdBy}
                    isTechnician={true}
                  />
                </div>

                <div className="ticket-actions">
                  <button className="delete-btn" onClick={() => setShowDeleteDialog(true)}>
                    Close Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDeleteDialog && (
          <div className="dialog-overlay">
            <div className="dialog-box">
              <div className="dialog-title">Close Ticket</div>
              <div className="dialog-message">
                Are you sure you want to close this ticket? This action cannot be undone.
              </div>
              <div className="dialog-actions">
                <button className="nav-btn" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </button>
                <button 
                  className="delete-btn" 
                  onClick={handleDeleteTicket}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Closing...' : 'Close Ticket'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TechnicianTicketDetailsPage;
