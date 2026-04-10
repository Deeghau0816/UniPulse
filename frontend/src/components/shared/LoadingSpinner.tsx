import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const dim = size === 'sm' ? 24 : size === 'lg' ? 56 : 40;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '16px',
    }}>
      <div style={{
        width: dim,
        height: dim,
        border: `3px solid #E5E7EB`,
        borderTop: `3px solid #3B82F6`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {message && (
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>{message}</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
