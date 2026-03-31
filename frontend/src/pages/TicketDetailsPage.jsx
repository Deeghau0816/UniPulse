import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TicketDetailsPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [newComment, setNewComment] = useState('');

  const ticket = useMemo(
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

  const [comments, setComments] = useState(ticket.comments);

  const timelineSteps = [
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  const statusOrder = {
    OPEN: 1,
    IN_PROGRESS: 2,
    RESOLVED: 3,
    CLOSED: 4,
    REJECTED: 0,
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
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
        }

        .ticket-details-page {
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
        }

        .back-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.10);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 22px;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.16);
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
          font-size: 14px;
          font-weight: 700;
          color: #93c5fd;
          margin-bottom: 10px;
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

        .badge-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .badge {
          padding: 9px 14px;
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
          grid-template-columns: 1.25fr 0.9fr;
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
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 16px;
          color: #ffffff;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 18px;
        }

        .meta-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 16px;
        }

        .meta-label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(191, 219, 254, 0.72);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .meta-value {
          font-size: 14px;
          color: #ffffff;
          line-height: 1.6;
        }

        .description-box {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 18px;
          color: rgba(219, 234, 254, 0.86);
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
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 16px;
          text-align: center;
          position: relative;
        }

        .timeline-step.active {
          background: rgba(37, 99, 235, 0.18);
          border-color: rgba(96, 165, 250, 0.35);
        }

        .timeline-step.done {
          background: rgba(34,197,94,0.16);
          border-color: rgba(134,239,172,0.28);
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
          background: rgba(255,255,255,0.10);
          color: #fff;
        }

        .timeline-step.active .step-circle {
          background: #2563eb;
        }

        .timeline-step.done .step-circle {
          background: #16a34a;
        }

        .step-label {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
        }

        .attachments-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .attachment-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 12px;
        }

        .attachment-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 14px;
          margin-bottom: 10px;
        }

        .attachment-name {
          font-size: 13px;
          color: rgba(219, 234, 254, 0.82);
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
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
          resize: vertical;
        }

        .comment-input::placeholder {
          color: rgba(191, 219, 254, 0.55);
        }

        .comment-input:focus {
          border-color: rgba(96, 165, 250, 0.95);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
        }

        .comment-btn {
          align-self: flex-end;
          border: none;
          border-radius: 14px;
          padding: 12px 18px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
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
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
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
          color: #ffffff;
        }

        .comment-role {
          font-size: 11px;
          font-weight: 700;
          color: #93c5fd;
          margin-left: 8px;
        }

        .comment-date {
          font-size: 12px;
          color: rgba(191, 219, 254, 0.66);
        }

        .comment-message {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(219, 234, 254, 0.84);
        }

        .resolution-box {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 18px;
          color: rgba(219, 234, 254, 0.86);
          line-height: 1.8;
          font-size: 14px;
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
            border-radius: 20px;
          }
        }
      `}</style>

      <div className="ticket-details-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="page-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/dashboard/my-tickets')}>
              ← Back to My Tickets
            </button>

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

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
  <button className="back-btn" onClick={() => navigate('/dashboard/my-tickets')}>
    My Tickets
  </button>
  <button className="back-btn" onClick={() => navigate('/dashboard/notifications')}>
    Notifications
  </button>
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
                      {ticket.rejectionReason ? ` Reason: ${ticket.rejectionReason}` : ' No rejection reason was provided.'}
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
                      onChange={(e) => setNewComment(e.target.value)}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetailsPage;