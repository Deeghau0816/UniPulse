import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketService, type TicketStatus, type TicketPriority } from '../services/ticketService';

type Attachment = {
  id: number;
  name: string;
  url: string;
};

type CommentItem = {
  id: number;
  author: string;
  role: 'USER' | 'TECHNICIAN' | 'ADMIN';
  message: string;
  createdAt: string;
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
  comments: CommentItem[];
};

const AdminTicketDetailsPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) {
        setError('Ticket ID not found');
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
          preferredContact: ticketResponse.preferredContact || 'Not specified',
          createdBy: ticketResponse.createdBy,
          assignedTechnician: ticketResponse.assignedTechnician || 'Unassigned',
          technicianType: ticketResponse.technicianType || 'Not assigned',
          resolutionNotes: ticketResponse.resolutionNotes || 'No resolution notes yet',
          rejectionReason: ticketResponse.rejectionReason || '',
          attachments: ticketResponse.attachments.map(att => ({
            id: att.id,
            name: att.originalFileName || att.fileName,
            url: att.filePath
          })),
          comments: [] // Comments not available in TicketResponse, using empty array
        };

        setTicket(ticketDetails);
        setComments(ticketDetails.comments);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: TicketPriority): string => {
    switch (priority) {
      case 'LOW': return 'text-gray-600 bg-gray-100';
      case 'MEDIUM': return 'text-orange-600 bg-orange-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'CRITICAL': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: TicketStatus): string => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-orange-600 bg-orange-100';
      case 'RESOLVED': return 'text-green-600 bg-green-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => navigate('/dashboard/admin/tickets')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Admin Tickets
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

        .admin-details-page {
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

        .admin-details-page::before {
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

        .details-header {
          padding: 72px 72px 28px;
          position: relative;
          z-index: 2;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          color: #111111;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 6px 16px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        }

        .page-title {
          font-size: 42px;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.02em;
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

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 32px;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 20px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 14px;
          color: #111111;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .description-text {
          line-height: 1.7;
          color: #3f3f46;
          font-size: 15px;
          white-space: pre-wrap;
        }

        .comments-section {
          max-height: 400px;
          overflow-y: auto;
        }

        .comment-item {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .comment-item:last-child {
          border-bottom: none;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .comment-author {
          font-weight: 600;
          color: #111111;
          font-size: 14px;
        }

        .comment-role {
          font-size: 12px;
          color: #71717a;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 999px;
        }

        .comment-time {
          font-size: 12px;
          color: #71717a;
        }

        .comment-message {
          color: #3f3f46;
          font-size: 14px;
          line-height: 1.6;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
        }

        @media (max-width: 1024px) {
          .details-grid {
            grid-template-columns: 1fr;
          }

          .details-header,
          .content-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 768px) {
          .details-header {
            padding: 52px 24px 20px;
          }

          .content-section {
            padding: 0 24px 48px;
          }

          .page-title {
            font-size: 34px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="admin-details-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="details-header">
          <div className="header-content">
            <div>
              <a href="/dashboard/admin/tickets" className="back-btn">
                <span>Back to Admin Tickets</span>
              </a>
              <h1 className="page-title">Ticket #{ticket.id}</h1>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="content-container">
            <div className="details-grid">
              <div className="main-content">
                <div className="card">
                  <h2 className="card-title">Ticket Information</h2>
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
                      <span className={`status-badge ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Created By</span>
                      <span className="info-value">{ticket.createdBy}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Created At</span>
                      <span className="info-value">{formatDate(ticket.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Preferred Contact</span>
                      <span className="info-value">{ticket.preferredContact}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="card-title">Description</h2>
                  <p className="description-text">{ticket.description}</p>
                </div>

                <div className="card">
                  <h2 className="card-title">Comments</h2>
                  <div className="comments-section">
                    {comments.length === 0 ? (
                      <p style={{ color: '#71717a', fontStyle: 'italic' }}>No comments yet</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            <div className="comment-author">
                              {comment.author}
                              <span className="comment-role">{comment.role}</span>
                            </div>
                            <span className="comment-time">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="comment-message">{comment.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="sidebar">
                <div className="card">
                  <h2 className="card-title">Assignment Details</h2>
                  <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="info-item">
                      <span className="info-label">Assigned Technician</span>
                      <span className="info-value">{ticket.assignedTechnician}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Technician Type</span>
                      <span className="info-value">{ticket.technicianType}</span>
                    </div>
                  </div>
                </div>

                {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                  <div className="card">
                    <h2 className="card-title">Resolution Details</h2>
                    <div className="info-item">
                      <span className="info-label">Resolution Notes</span>
                      <p className="description-text">{ticket.resolutionNotes}</p>
                    </div>
                  </div>
                )}

                {ticket.status === 'REJECTED' && ticket.rejectionReason && (
                  <div className="card">
                    <h2 className="card-title">Rejection Reason</h2>
                    <p className="description-text">{ticket.rejectionReason}</p>
                  </div>
                )}

                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="card">
                    <h2 className="card-title">Attachments</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {ticket.attachments.map((attachment) => (
                        <div key={attachment.id} className="attachment-item">
                          <span>Attachment: {attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTicketDetailsPage;
