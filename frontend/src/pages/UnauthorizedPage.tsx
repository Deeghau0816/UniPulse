import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (user?.role === 'ADMIN') {
      navigate('/dashboard/admin/tickets');
    } else if (user?.role === 'TECHNICIAN') {
      navigate('/dashboard/technician/tickets');
    } else {
      navigate('/dashboard/my-tickets');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        .unauthorized-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 48%, #fff7ed 100%);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          padding: 20px;
        }

        .unauthorized-card {
          background: white;
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          text-align: center;
          max-width: 480px;
          width: 100%;
          border: 1px solid #e4e4e7;
        }

        .unauthorized-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        }

        .unauthorized-title {
          font-size: 28px;
          font-weight: 800;
          color: #111111;
          margin: 0 0 12px 0;
        }

        .unauthorized-message {
          font-size: 16px;
          color: #52525b;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .unauthorized-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.25);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d4d4d8;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-danger {
          background: #ffffff;
          color: #dc2626;
          border: 1px solid #d4d4d8;
        }

        .btn-danger:hover {
          background: #fee2e2;
          border-color: #dc2626;
        }

        .user-info {
          background: #f9fafb;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .user-role {
          font-size: 14px;
          font-weight: 600;
          color: #111111;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 480px) {
          .unauthorized-card {
            padding: 32px 24px;
          }

          .unauthorized-title {
            font-size: 24px;
          }

          .unauthorized-message {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <div className="unauthorized-icon">{'\ud83d\udd12'}</div>
          
          <h1 className="unauthorized-title">Access Denied</h1>
          
          <p className="unauthorized-message">
            You don't have permission to access this page. This area is restricted to specific user roles.
          </p>

          {user && (
            <div className="user-info">
              <div className="user-role">Current Role: {user.role}</div>
              <div className="user-email">{user.email}</div>
            </div>
          )}

          <div className="unauthorized-actions">
            <button className="btn btn-primary" onClick={handleGoHome}>
              Go to Dashboard
            </button>
            <button className="btn btn-secondary" onClick={handleGoBack}>
              Go Back
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnauthorizedPage;
