import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketService, type TicketStatus, type TicketPriority } from '../services/ticketService';
import StatusIndicator from '../components/StatusIndicator';
import MessageChat from '../components/MessageChat';

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

const TicketDetailsPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [newComment, setNewComment] = useState<string>('');

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Partial<TicketDetails>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Current user state (for demo purposes - in real app, this would come from auth context)
  const [currentUserName] = useState(() => {
    // Check if user is viewing from technician dashboard
    const path = window.location.pathname;
    if (path.includes('/dashboard/technician/')) {
      return localStorage.getItem('selectedTechnician') || 'Current Technician';
    }
    return 'Current User';
  });
  
  const [currentUserRole] = useState<'USER' | 'TECHNICIAN' | 'ADMIN'>(() => {
    const path = window.location.pathname;
    if (path.includes('/dashboard/technician/')) {
      return 'TECHNICIAN';
    }
    return 'USER';
  });

  const isCurrentUserTechnician = currentUserRole === 'TECHNICIAN';

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
            url: `/api/tickets/${ticketResponse.id}/attachments/${att.id}`
          })) || [],
          comments: [], // TODO: Fetch comments when comment API is ready
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

  const timelineSteps: { key: Exclude<TicketStatus, 'REJECTED'>; label: string }[] = [
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  const statusOrder: Record<TicketStatus, number> = {
    OPEN: 1,
    IN_PROGRESS: 2,
    RESOLVED: 3,
    CLOSED: 4,
    REJECTED: 0,
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

  const handleAddComment = (): void => {
    if (!newComment.trim()) return;

    const comment: CommentItem = {
      id: Date.now(),
      author: 'Current User',
      role: 'USER',
      message: newComment,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment('');
  };

  const handleEditTicket = (): void => {
    if (ticket) {
      setEditForm({
        category: ticket.category,
        location: ticket.location,
        priority: ticket.priority,
        description: ticket.description,
        preferredContact: ticket.preferredContact,
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!ticket || !ticketId) return;
    
    try {
      setIsSaving(true);
      const updatedTicket = await ticketService.updateTicket(ticketId, {
        category: editForm.category as any,
        location: editForm.location || '',
        priority: editForm.priority as any,
        description: editForm.description || '',
        preferredContact: editForm.preferredContact || '',
        createdBy: ticket.createdBy,
      });
      
      // Update local state
      const ticketDetails: TicketDetails = {
        id: updatedTicket.id.toString(),
        category: updatedTicket.category,
        location: updatedTicket.location,
        priority: updatedTicket.priority,
        status: updatedTicket.status,
        description: updatedTicket.description,
        createdAt: updatedTicket.createdAt,
        preferredContact: updatedTicket.preferredContact,
        createdBy: updatedTicket.createdBy,
        assignedTechnician: updatedTicket.assignedTechnician || '',
        technicianType: updatedTicket.technicianType || '',
        resolutionNotes: updatedTicket.resolutionNotes || '',
        rejectionReason: updatedTicket.rejectionReason || '',
        attachments: [],
        comments: [],
      };
      
      setTicket(ticketDetails);
      setIsEditing(false);
      setEditForm({});
      alert('Ticket updated successfully!');
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('Failed to update ticket. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleEditFormChange = (field: string, value: string): void => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

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
    if (!ticketId) return;
    
    try {
      setIsDeleting(true);
      await ticketService.deleteTicket(ticketId);
      alert('Ticket deleted successfully!');
      navigate('/dashboard/my-tickets');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('Failed to delete ticket. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-details-page">
        <style>{`
          .ticket-details-page {
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
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="loading-box">
          <div className="spinner" />
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-details-page">
        <style>{`
          .ticket-details-page {
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
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .ticket-details-page {
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

        .ticket-details-page::before {
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
        }

        .top-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .nav-btn,
        .primary-btn {
          padding: 13px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn {
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
        }

        .nav-btn:hover {
          background: #fafafa;
        }

        .primary-btn {
          border: none;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(249, 115, 22, 0.25);
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .ticket-id {
          font-size: 13px;
          font-weight: 700;
          color: #ea580c;
          margin-bottom: 8px;
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

        .badge-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-end;
          align-items: center;
        }

        .badge {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid transparent;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .status-open { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
        .status-progress { background: #dbeafe; color: #1e40af; border-color: #60a5fa; }
        .status-resolved { background: #d1fae5; color: #065f46; border-color: #34d399; }
        .status-closed { background: #f3f4f6; color: #374151; border-color: #9ca3af; }
        .status-rejected { background: #fee2e2; color: #991b1b; border-color: #f87171; }

        .priority-low { background: #fafafa; color: #52525b; border-color: #d4d4d8; }
        .priority-medium { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
        .priority-high { background: #ffedd5; color: #c2410c; border-color: #fb923c; }
        .priority-critical { background: #111111; color: #ffffff; border-color: #111111; }

        .content-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .content-container {
          max-width: 1360px;
          margin: 0 auto;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 16px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .meta-item {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          padding: 16px;
        }

        .meta-label {
          font-size: 11px;
          font-weight: 700;
          color: #71717a;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .meta-value {
          font-size: 14px;
          color: #111111;
          font-weight: 500;
        }

        .description-box {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          padding: 16px;
          font-size: 14px;
          line-height: 1.7;
          color: #3f3f46;
        }

        .timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          padding: 20px 0;
        }

        .timeline::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: #e4e4e7;
          z-index: 1;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #e4e4e7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #71717a;
          margin-bottom: 8px;
        }

        .timeline-step.done .step-circle {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .timeline-step.active .step-circle {
          background: #f97316;
          border-color: #f97316;
          color: white;
        }

        .step-label {
          font-size: 12px;
          font-weight: 600;
          color: #52525b;
          text-align: center;
        }

        .resolution-box {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          padding: 16px;
          font-size: 14px;
          color: #3f3f46;
        }

        .comment-box {
          margin-bottom: 20px;
        }

        .comment-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d4d4d8;
          border-radius: 12px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
          margin-bottom: 12px;
        }

        .comment-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment-card {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          padding: 16px;
        }

        .comment-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .comment-author {
          font-size: 14px;
          font-weight: 700;
          color: #111111;
        }

        .comment-role {
          font-size: 11px;
          font-weight: 700;
          color: #ea580c;
          margin-left: 8px;
        }

        .comment-date {
          font-size: 12px;
          color: #71717a;
        }

        .comment-message {
          font-size: 14px;
          line-height: 1.7;
          color: #3f3f46;
        }

        .edit-input,
        .edit-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d4d4d8;
          border-radius: 8px;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          outline: none;
        }

        .edit-input:focus,
        .edit-textarea:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .edit-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .edit-description {
          margin-top: 16px;
        }

        .edit-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .delete-btn {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: #ffffff;
          border: none;
          padding: 13px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(220, 38, 38, 0.20);
        }

        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 12px;
        }

        .dialog-message {
          font-size: 14px;
          color: #52525b;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
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
        }

        .attachment-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .attachment-name {
          font-size: 12px;
          color: #52525b;
          font-weight: 500;
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

          .timeline {
            flex-direction: column;
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
          .comment-top {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="ticket-details-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="page-header">
          <div className="header-content">
            <div className="top-actions">
              <button className="nav-btn" onClick={() => navigate('/dashboard/my-tickets')}>
                Back to My Tickets
              </button>
              <button className="nav-btn" onClick={() => navigate('/dashboard/notifications')}>
                Notifications
              </button>
              <button className="nav-btn" onClick={() => navigate('/dashboard/admin/tickets')}>
                Admin View
              </button>
            </div>

            <div className="title-row">
              <div>
                <div className="ticket-id">{ticket.id}</div>
                <h1 className="page-title">Ticket Details</h1>
                <p className="page-subtitle">
                  View the full progress, technician updates, attachments, comments, and resolution details for this incident ticket.
                </p>
              </div>

              <div className="badge-wrap">
                <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`badge ${getStatusClass(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                {!isEditing && (
                  <>
                    <button className="primary-btn" onClick={handleEditTicket}>
                      Edit Ticket
                    </button>
                    <button className="delete-btn" onClick={() => setShowDeleteDialog(true)}>
                      Delete Ticket
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="content-container">
            <StatusIndicator status={ticket.status} />

            <div className="details-grid">
              <div className="left-column">
                <div className="card">
                  <div className="card-title">Ticket Overview</div>

                  {isEditing ? (
                    <div className="edit-form">
                      <div className="meta-grid">
                        <div className="meta-item">
                          <div className="meta-label">Category</div>
                          <select 
                            className="edit-input"
                            value={editForm.category || ''}
                            onChange={(e) => handleEditFormChange('category', e.target.value)}
                          >
                            <option value="Electrical">Electrical</option>
                            <option value="IT Support">IT Support</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Lab Equipment">Lab Equipment</option>
                          </select>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Location</div>
                          <input 
                            type="text"
                            className="edit-input"
                            value={editForm.location || ''}
                            onChange={(e) => handleEditFormChange('location', e.target.value)}
                            placeholder="Enter location"
                          />
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Priority</div>
                          <select 
                            className="edit-input"
                            value={editForm.priority || ''}
                            onChange={(e) => handleEditFormChange('priority', e.target.value)}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Preferred Contact</div>
                          <input 
                            type="text"
                            className="edit-input"
                            value={editForm.preferredContact || ''}
                            onChange={(e) => handleEditFormChange('preferredContact', e.target.value)}
                            placeholder="Enter contact info"
                          />
                        </div>
                      </div>

                      <div className="edit-description">
                        <div className="meta-label">Description</div>
                        <textarea 
                          className="edit-textarea"
                          value={editForm.description || ''}
                          onChange={(e) => handleEditFormChange('description', e.target.value)}
                          placeholder="Enter description"
                          rows={4}
                        />
                      </div>

                      <div className="edit-actions">
                        <button 
                          className="primary-btn" 
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          className="nav-btn" 
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="meta-grid">
                        <div className="meta-item">
                          <div className="meta-label">Category</div>
                          <div className="meta-value">{ticket.category}</div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Location</div>
                          <div className="meta-value">{ticket.location}</div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Created By</div>
                          <div className="meta-value">{ticket.createdBy}</div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Preferred Contact</div>
                          <div className="meta-value">{ticket.preferredContact}</div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Assigned Technician</div>
                          <div className="meta-value">{ticket.assignedTechnician}</div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Technician Type</div>
                          <div className="meta-value">{ticket.technicianType}</div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Created At</div>
                          <div className="meta-value">{formatDate(ticket.createdAt)}</div>
                        </div>

                        <div className="meta-item">
                          <div className="meta-label">Current Status</div>
                          <div className="meta-value">{ticket.status.replace('_', ' ')}</div>
                        </div>
                      </div>

                      <div className="card-title" style={{ marginTop: '6px' }}>Issue Description</div>
                      <div className="description-box">{ticket.description}</div>
                    </>
                  )}
                </div>

                <div className="card">
                  <div className="card-title">Status Timeline</div>

                  {ticket.status === 'REJECTED' ? (
                    <div className="resolution-box">
                      This ticket has been rejected.
                      {ticket.rejectionReason
                        ? ` Reason: ${ticket.rejectionReason}`
                        : ' No rejection reason was provided.'}
                    </div>
                  ) : (
                    <div className="timeline">
                      {timelineSteps.map((step, index) => {
                        const current = statusOrder[ticket.status];
                        const stepNumber = index + 1;
                        const isDone = current > stepNumber;
                        const isActive = current === stepNumber;

                        return (
                          <div
                            key={step.key}
                            className={`timeline-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                          >
                            <div className="step-circle">{stepNumber}</div>
                            <div className="step-label">{step.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="card-title">Comments</div>

                  <div className="comment-box">
                    <textarea
                      className="comment-input"
                      placeholder="Add a new comment..."
                      value={newComment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNewComment(e.target.value)
                      }
                    />
                    <button className="comment-btn" onClick={handleAddComment}>
                      Post Comment
                    </button>
                  </div>

                  <div className="comments-list">
                    {comments.map((comment) => (
                      <div key={comment.id} className="comment-card">
                        <div className="comment-top">
                          <div>
                            <span className="comment-author">{comment.author}</span>
                            <span className="comment-role">{comment.role}</span>
                          </div>
                          <div className="comment-date">{formatDate(comment.createdAt)}</div>
                        </div>
                        <div className="comment-message">{comment.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="card">
                  <div className="card-title">Attachments</div>

                  {ticket.attachments.length === 0 ? (
                    <div className="description-box">No attachments available.</div>
                  ) : (
                    <div className="attachments-grid">
                      {ticket.attachments.map((attachment) => (
                        <div key={attachment.id} className="attachment-card">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="attachment-image"
                          />
                          <div className="attachment-name">{attachment.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="card-title">Resolution Notes</div>
                  <div className="resolution-box">
                    {ticket.resolutionNotes || 'No resolution notes have been added yet.'}
                  </div>
                </div>

                {ticket.assignedTechnician && (
                  <div className="card">
                    <div className="card-title">Direct Messages</div>
                    <MessageChat
                      ticketId={ticket.id}
                      currentUserName={currentUserName}
                      currentUserRole={currentUserRole}
                      recipientName={isCurrentUserTechnician ? ticket.createdBy : ticket.assignedTechnician}
                      isTechnician={isCurrentUserTechnician}
                    />
                  </div>
                )}

                
              </div>
            </div>
          </div>
        </div>

        {showDeleteDialog && (
          <div className="dialog-overlay">
            <div className="dialog-box">
              <div className="dialog-title">Delete Ticket</div>
              <div className="dialog-message">
                Are you sure you want to delete this ticket? This action cannot be undone.
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
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketDetailsPage;
