import type { TicketStatus } from '../services/ticketService';

interface TechnicianStatusUpdateProps {
  currentStatus: TicketStatus;
  assignedTechnician: string;
  onStatusUpdate: (newStatus: TicketStatus) => void;
}

const TechnicianStatusUpdate = ({ currentStatus, assignedTechnician, onStatusUpdate }: TechnicianStatusUpdateProps) => {
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

  if (!assignedTechnician) {
    return null;
  }

  return (
    <>
      <style>{`
        .status-update-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .current-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .status-label {
          font-weight: 600;
          color: #52525b;
        }

        .status-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .status-btn {
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .status-btn:hover {
          transform: translateY(-1px);
        }

        .status-btn.status-progress {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .status-btn.status-resolved {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .status-btn.status-closed {
          background: linear-gradient(135deg, #6b7280, #9ca3af);
          color: white;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }

        .status-btn.status-open {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .status-open {
          background: #fef3c7;
          color: #92400e;
          border-color: #fbbf24;
        }

        .status-progress {
          background: #dbeafe;
          color: #1e40af;
          border-color: #60a5fa;
        }

        .status-resolved {
          background: #d1fae5;
          color: #065f46;
          border-color: #34d399;
        }

        .status-closed {
          background: #f3f4f6;
          color: #374151;
          border-color: #9ca3af;
        }

        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
          border-color: #f87171;
        }

        @media (max-width: 768px) {
          .status-actions {
            flex-direction: column;
          }
          
          .status-btn {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="status-update-section">
        <div className="current-status">
          <span className="status-label">Current Status: </span>
          <span className={`badge ${getStatusClass(currentStatus)}`}>
            {currentStatus.replace('_', ' ')}
          </span>
        </div>
        <div className="status-actions">
          {currentStatus === 'OPEN' && (
            <button 
              className="status-btn status-progress"
              onClick={() => onStatusUpdate('IN_PROGRESS')}
            >
              Accept & Start Work
            </button>
          )}
          {currentStatus === 'IN_PROGRESS' && (
            <>
              <button 
                className="status-btn status-resolved"
                onClick={() => onStatusUpdate('RESOLVED')}
              >
                Mark as Resolved
              </button>
              <button 
                className="status-btn status-open"
                onClick={() => onStatusUpdate('OPEN')}
              >
                Reopen Ticket
              </button>
            </>
          )}
          {currentStatus === 'RESOLVED' && (
            <>
              <button 
                className="status-btn status-closed"
                onClick={() => onStatusUpdate('CLOSED')}
              >
                Close Ticket
              </button>
              <button 
                className="status-btn status-progress"
                onClick={() => onStatusUpdate('IN_PROGRESS')}
              >
                Reopen for More Work
              </button>
            </>
          )}
          {currentStatus === 'CLOSED' && (
            <button 
              className="status-btn status-progress"
              onClick={() => onStatusUpdate('IN_PROGRESS')}
            >
              Reopen Ticket
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default TechnicianStatusUpdate;
