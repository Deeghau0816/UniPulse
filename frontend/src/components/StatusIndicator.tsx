import type { TicketStatus } from '../services/ticketService';

interface StatusIndicatorProps {
  status: TicketStatus;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => {
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

  const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return {
          title: 'Ticket is Open',
          description: 'Waiting for technician assignment and acceptance.',
          icon: ' ',
        };
      case 'IN_PROGRESS':
        return {
          title: 'Work in Progress',
          description: 'Technician is actively working on this issue.',
          icon: ' ',
        };
      case 'RESOLVED':
        return {
          title: 'Issue Resolved',
          description: 'The issue has been resolved and awaits confirmation.',
          icon: ' ',
        };
      case 'CLOSED':
        return {
          title: 'Ticket Closed',
          description: 'This ticket has been completed and closed.',
          icon: ' ',
        };
      case 'REJECTED':
        return {
          title: 'Ticket Rejected',
          description: 'This ticket was rejected and will not be processed.',
          icon: ' ',
        };
      default:
        return {
          title: 'Unknown Status',
          description: 'Status information not available.',
          icon: ' ',
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <>
      <style>{`
        .status-indicator {
          background: rgba(255,255,255,0.95);
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }

        .status-icon.status-open {
          background: #fff7ed;
          color: #ea580c;
        }

        .status-icon.status-progress {
          background: #dbeafe;
          color: #3b82f6;
        }

        .status-icon.status-resolved {
          background: #d1fae5;
          color: #10b981;
        }

        .status-icon.status-closed {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-icon.status-rejected {
          background: #fee2e2;
          color: #ef4444;
        }

        .status-content {
          flex: 1;
        }

        .status-title {
          font-size: 18px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 4px;
        }

        .status-description {
          font-size: 14px;
          color: #52525b;
          line-height: 1.5;
        }

        .status-badge {
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .status-open { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
        .status-progress { background: #dbeafe; color: #1e40af; border-color: #60a5fa; }
        .status-resolved { background: #d1fae5; color: #065f46; border-color: #34d399; }
        .status-closed { background: #f3f4f6; color: #374151; border-color: #9ca3af; }
        .status-rejected { background: #fee2e2; color: #991b1b; border-color: #f87171; }

        @media (max-width: 768px) {
          .status-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .status-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
        }
      `}</style>
      
      <div className="status-indicator">
        <div className="status-header">
          <div className={`status-icon ${getStatusClass(status)}`}>
            {statusInfo.icon}
          </div>
          <div className="status-content">
            <div className="status-title">{statusInfo.title}</div>
            <div className="status-description">{statusInfo.description}</div>
          </div>
          <div className={`status-badge ${getStatusClass(status)}`}>
            {status.replace('_', ' ')}
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusIndicator;
