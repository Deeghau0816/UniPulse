import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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

  const ticket = useMemo<TicketDetails>(
    () => ({
      id: ticketId || 'TKT-001',
      category: 'Electrical',
      location: 'Lab Building - Room 203',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      description:
        'Power outage in computer lab affecting multiple workstations and projector access. Students are unable to continue practical sessions properly, and the room needs urgent technician attention.',
      createdAt: '2026-03-30T10:30:00Z',
      preferredContact: 'student@sliit.lk',
      createdBy: 'Kavindi Perera',
      assignedTechnician: 'Nimal Perera',
      technicianType: 'Electrical Technician',
      resolutionNotes:
        'Main circuit line inspection has been completed. A damaged power distribution point was identified and temporary restoration has been done. Full replacement is scheduled.',
      rejectionReason: '',
      attachments: [
        {
          id: 1,
          name: 'lab-power-issue-1.jpg',
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
        },
        {
          id: 2,
          name: 'lab-power-issue-2.jpg',
          url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80',
        },
      ],
      comments: [
        {
          id: 1,
          author: 'Kavindi Perera',
          role: 'USER',
          message: 'The issue started around 9.30 AM during our lab session.',
          createdAt: '2026-03-30T10:40:00Z',
        },
        {
          id: 2,
          author: 'Nimal Perera',
          role: 'TECHNICIAN',
          message: 'Initial inspection completed. I am checking the affected power line now.',
          createdAt: '2026-03-30T11:20:00Z',
        },
      ],
    }),
    [ticketId]
  );

  const [comments, setComments] = useState<CommentItem[]>(ticket.comments);

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
          margin-bottom: 10px;
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
        .status-progress { background: #fff7ed; color: #ea580c; border-color: #fb923c; }
        .status-resolved { background: #f4f4f5; color: #18181b; border-color: #d4d4d8; }
        .status-closed { background: #fafafa; color: #3f3f46; border-color: #d4d4d8; }
        .status-rejected { background: #111111; color: #ffffff; border-color: #111111; }

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
          grid-template-columns: 1.2fr 0.9fr;
          gap: 24px;
          align-items: start;
        }

        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.05);
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: #111111;
          margin-bottom: 16px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .meta-item {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 14px;
        }

        .meta-label {
          font-size: 11px;
          font-weight: 700;
          color: #71717a;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .meta-value {
          font-size: 14px;
          color: #111111;
          line-height: 1.6;
        }

        .description-box,
        .resolution-box {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 16px;
          color: #3f3f46;
          line-height: 1.8;
          font-size: 14px;
        }

        .timeline {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .timeline-step {
          flex: 1;
          min-width: 120px;
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 16px;
          text-align: center;
        }

        .timeline-step.active {
          background: #fff7ed;
          border-color: #fb923c;
        }

        .timeline-step.done {
          background: #111111;
          border-color: #111111;
        }

        .step-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          background: #f4f4f5;
          color: #111111;
        }

        .timeline-step.active .step-circle {
          background: #f97316;
          color: #ffffff;
        }

        .timeline-step.done .step-circle {
          background: #ffffff;
          color: #111111;
        }

        .timeline-step.done .step-label {
          color: #ffffff;
        }

        .step-label {
          font-size: 13px;
          font-weight: 700;
          color: #111111;
        }

        .attachments-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .attachment-card {
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 12px;
        }

        .attachment-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 10px;
        }

        .attachment-name {
          font-size: 13px;
          color: #3f3f46;
          word-break: break-word;
        }

        .comment-box {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .comment-input {
          width: 100%;
          min-height: 110px;
          border-radius: 16px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
          resize: vertical;
        }

        .comment-input::placeholder {
          color: #71717a;
        }

        .comment-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }

        .comment-btn {
          align-self: flex-end;
          border: none;
          border-radius: 14px;
          padding: 12px 18px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 18px;
        }

        .comment-card {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 16px;
        }

        .comment-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
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
                ← Back to My Tickets
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
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="content-container">
            <div className="details-grid">
              <div className="left-column">
                <div className="card">
                  <div className="card-title">Ticket Overview</div>

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

                <button
                  className="primary-btn"
                  onClick={() => navigate('/dashboard/technician/tickets')}
                >
                  Open Technician Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetailsPage;