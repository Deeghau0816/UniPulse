import React from 'react';
import type { ReservationStatus } from '../../types/reservation';

interface StatusBadgeProps {
  status: ReservationStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ReservationStatus, { label: string; bg: string; color: string; dot: string }> = {
  PENDING:   { label: 'Pending',   bg: '#FFF3CD', color: '#856404', dot: '#F59E0B' },
  APPROVED:  { label: 'Approved',  bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  REJECTED:  { label: 'Rejected',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  CANCELLED: { label: 'Cancelled', bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = statusConfig[status];
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding,
      borderRadius: '20px',
      backgroundColor: cfg.bg,
      color: cfg.color,
      fontSize,
      fontWeight: 600,
      letterSpacing: '0.3px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: cfg.dot,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
};
