import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const typeConfig = {
  success: { bg: '#ECFDF5', border: '#10B981', color: '#065F46', icon: '✅' },
  error:   { bg: '#FEF2F2', border: '#EF4444', color: '#991B1B', icon: '❌' },
  warning: { bg: '#FFFBEB', border: '#F59E0B', color: '#92400E', icon: '⚠️' },
  info:    { bg: '#EFF6FF', border: '#3B82F6', color: '#1E40AF', icon: 'ℹ️' },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  const cfg = typeConfig[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '14px 18px',
      backgroundColor: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.border}`,
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
      maxWidth: '380px',
      animation: 'slideIn 0.3s ease',
      color: cfg.color,
    }}>
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{cfg.icon}</span>
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: cfg.color,
          fontSize: '16px',
          padding: '0',
          lineHeight: 1,
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ─── Toast Manager Hook ───────────────────────────────────────────────────────
export const useToast = () => {
  const [toast, setToast] = React.useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = React.useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const closeToast = React.useCallback(() => setToast(null), []);

  const ToastRenderer = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={closeToast} />
  ) : null;

  return { showToast, ToastRenderer };
};
