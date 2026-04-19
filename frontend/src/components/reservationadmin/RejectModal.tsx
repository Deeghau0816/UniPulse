import React, { useState } from 'react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
  actionLabel?: string;
  submitting?: boolean;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Reject Reservation',
  actionLabel = 'Reject',
  submitting = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const isReject = actionLabel.toLowerCase().includes('reject');
  const accentColor = isReject ? '#EF4444' : '#F59E0B';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(2px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '440px',
        margin: '16px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {isReject ? '❌' : '🚫'} {title}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9CA3AF' }}>×</button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6B7280' }}>
          Please provide a reason. This will be visible to the user.
        </p>

        <textarea
          autoFocus
          placeholder="Enter reason..."
          value={reason}
          onChange={e => { setReason(e.target.value); setError(''); }}
          rows={4}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: `1px solid ${error ? '#EF4444' : '#D1D5DB'}`,
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            color: '#111827',
          }}
        />
        {error && <p style={{ fontSize: '12px', color: '#EF4444', margin: '4px 0 0' }}>{error}</p>}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '11px',
              backgroundColor: '#F9FAFB',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '11px',
              backgroundColor: submitting ? '#D1D5DB' : accentColor,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Processing...' : actionLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};
