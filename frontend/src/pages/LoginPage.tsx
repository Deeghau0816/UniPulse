import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

type LoginType = 'student' | 'staff' | 'admin' | 'technician';
type TechnicianType = 'electrical' | 'it-support' | 'mechanical' | 'lab-equipment';

type TechnicianOption = {
  value: TechnicianType;
  label: string;
};

type StatItem = {
  num: string;
  label: string;
};



// Inside your LoginPage component, before the return:


const LoginPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLoginType, setSelectedLoginType] = useState<LoginType>('student');
  const [selectedTechnicianType, setSelectedTechnicianType] =
    useState<TechnicianType>('electrical');

  const navigate = useNavigate();

  const navBtnStyle: CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '14px',
    border: '1px solid #d4d4d8',
    background: '#ffffff',
    color: '#111111',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  };

  const technicianTypes: TechnicianOption[] = [
    { value: 'electrical', label: 'Electrical Technician' },
    { value: 'it-support', label: 'IT Support Technician' },
    { value: 'mechanical', label: 'Mechanical Technician' },
    { value: 'lab-equipment', label: 'Lab Equipment Technician' },
  ];

  const handleGoogleLogin = (): void => {
    setIsLoading(true);
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const stats: StatItem[] = [
    { num: '0', label: 'Active Users' },
    { num: '0%', label: 'Resolution Rate' },
    { num: '0.0', label: 'User Rating' },
  ];

  const selectedTechnicianLabel =
    technicianTypes.find((tech) => tech.value === selectedTechnicianType)?.label ?? '';

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background:
            radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.12), transparent 22%),
            radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 20%),
            radial-gradient(circle at 82% 82%, rgba(24, 24, 27, 0.08), transparent 24%),
            linear-gradient(135deg, #ffffff 0%, #fafafa 48%, #fff7ed 100%);
          position: relative;
          overflow: hidden;
          color: #111111;
        }

        .login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(17, 17, 17, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17, 17, 17, 0.035) 1px, transparent 1px);
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
          opacity: 0.45;
        }

        .blob-1 {
          width: 360px;
          height: 360px;
          background: rgba(249, 115, 22, 0.18);
          top: -120px;
          left: -100px;
        }

        .blob-2 {
          width: 340px;
          height: 340px;
          background: rgba(251, 146, 60, 0.16);
          bottom: -110px;
          right: -80px;
        }

        .left-panel {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 72px;
          position: relative;
          z-index: 2;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.88);
          border: 1px solid #e4e4e7;
          margin-bottom: 28px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.04);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f97316;
        }

        .brand-badge span {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #18181b;
        }

        .hero-title {
          font-size: 64px;
          line-height: 1.05;
          font-weight: 800;
          margin-bottom: 22px;
          max-width: 760px;
          color: #111111;
          letter-spacing: -0.03em;
        }

        .hero-subtitle {
          max-width: 700px;
          font-size: 18px;
          line-height: 1.8;
          color: #52525b;
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(220px, 260px));
          gap: 18px;
        }

        .stat-card {
          padding: 24px 22px;
          border-radius: 22px;
          background: rgba(255,255,255,0.88);
          border: 1px solid #e4e4e7;
          box-shadow: 0 10px 26px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(0,0,0,0.07);
        }

        .stat-number {
          font-size: 34px;
          font-weight: 800;
          color: #111111;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #52525b;
        }

        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          position: relative;
          z-index: 2;
        }

        .glass-card {
          width: 100%;
          max-width: 920px;
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 30px;
          padding: 48px 42px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.10);
        }

        .card-top {
          margin-bottom: 30px;
          text-align: center;
        }

        .lock-icon-wrap {
          width: 78px;
          height: 78px;
          margin: 0 auto 20px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          box-shadow: 0 14px 32px rgba(249, 115, 22, 0.25);
        }

        .card-title {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #111111;
        }

        .card-subtitle {
          font-size: 15px;
          line-height: 1.8;
          color: #52525b;
          max-width: 560px;
          margin: 0 auto;
        }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 14px;
        }

        .login-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .type-card {
          border: 1px solid #e4e4e7;
          background: #ffffff;
          border-radius: 18px;
          padding: 18px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
        }

        .type-card:hover {
          transform: translateY(-2px);
          border-color: #fdba74;
        }

        .type-card.active {
          border: 1px solid #f97316;
          background: #fff7ed;
          box-shadow: 0 0 0 1px rgba(249,115,22,0.10);
        }

        .type-title {
          font-size: 17px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 6px;
        }

        .type-desc {
          font-size: 13px;
          line-height: 1.6;
          color: #52525b;
        }

        .field-group {
          margin-bottom: 24px;
        }

        .custom-select-wrap {
          position: relative;
        }

        .select-box {
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding: 16px 52px 16px 18px;
          border-radius: 16px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .select-box:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }

        .select-box option {
          color: #111111;
          background: #ffffff;
        }

        .select-icon {
          position: absolute;
          top: 50%;
          right: 18px;
          transform: translateY(-50%);
          pointer-events: none;
          color: #52525b;
        }

        .info-box {
          margin-bottom: 24px;
          padding: 18px 18px;
          border-radius: 18px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
        }

        .info-box p {
          font-size: 14px;
          line-height: 1.75;
          color: #3f3f46;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 22px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 18px;
          box-shadow: 0 10px 28px rgba(249, 115, 22, 0.22);
        }

        .google-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(249, 115, 22, 0.28);
        }

        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .footer-note {
          text-align: center;
          font-size: 13px;
          line-height: 1.8;
          color: #52525b;
        }

        .secure-note {
          margin-top: 14px;
          text-align: center;
          font-size: 12px;
          color: #71717a;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.45);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1280px) {
          .left-panel {
            padding: 64px 44px;
          }

          .right-panel {
            padding: 36px 34px;
          }

          .hero-title {
            font-size: 52px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(180px, 1fr));
          }
        }

        @media (max-width: 1080px) {
          .login-page {
            flex-direction: column;
          }

          .left-panel {
            padding: 48px 28px 20px;
          }

          .hero-title {
            font-size: 42px;
          }

          .hero-subtitle {
            font-size: 15px;
          }

          .right-panel {
            width: 100%;
            padding: 28px;
          }

          .glass-card {
            max-width: 1000px;
            padding: 38px 28px;
          }
        }

        @media (max-width: 640px) {
          .left-panel {
            padding: 36px 20px 10px;
          }

          .hero-title {
            font-size: 34px;
          }

          .hero-subtitle {
            font-size: 14px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .stat-card {
            padding: 18px 16px;
            border-radius: 18px;
          }

          .stat-number {
            font-size: 26px;
          }

          .right-panel {
            padding: 20px;
          }

          .glass-card {
            padding: 28px 20px;
            border-radius: 24px;
          }

          .login-type-grid {
            grid-template-columns: 1fr;
          }

          .card-title {
            font-size: 30px;
          }

          .type-card {
            padding: 16px;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="left-panel">
          <div className="brand-badge">
            <div className="badge-dot" />
            <span>SYSTEM ONLINE</span>
          </div>

          <h1 className="hero-title">Smart Campus Operations Hub</h1>

          <p className="hero-subtitle">
            Manage campus incident tickets, technician assignments, maintenance updates,
            and service operations through one secure platform.
          </p>

          <div className="stats-grid">
            {stats.map((item) => (
              <div className="stat-card" key={item.label}>
                <div className="stat-number">{item.num}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="glass-card">
            <div className="card-top">
              <div className="lock-icon-wrap">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                </svg>
              </div>

              <h2 className="card-title">Sign In</h2>
              <p className="card-subtitle">
                Choose your access type and continue with your secure campus account.
              </p>
            </div>

            <div className="field-group">
              <div className="section-label">Select Login Type</div>

              <div className="login-type-grid">
                <div
                  className={`type-card ${selectedLoginType === 'student' ? 'active' : ''}`}
                  onClick={() => setSelectedLoginType('student')}
                >
                  <div className="type-title">Student</div>
                  <div className="type-desc">Submit and track incident tickets</div>
                </div>

                <div
                  className={`type-card ${selectedLoginType === 'staff' ? 'active' : ''}`}
                  onClick={() => setSelectedLoginType('staff')}
                >
                  <div className="type-title">Staff</div>
                  <div className="type-desc">Report issues and monitor requests</div>
                </div>

                <div
                  className={`type-card ${selectedLoginType === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedLoginType('admin')}
                >
                  <div className="type-title">Admin</div>
                  <div className="type-desc">Manage users, tickets, and workflows</div>
                </div>

                <div
                  className={`type-card ${selectedLoginType === 'technician' ? 'active' : ''}`}
                  onClick={() => setSelectedLoginType('technician')}
                >
                  <div className="type-title">Technician</div>
                  <div className="type-desc">Handle assigned maintenance tasks</div>
                </div>
              </div>
            </div>

            {selectedLoginType === 'technician' && (
              <div className="field-group">
                <div className="section-label">Select Technician Type</div>

                <div className="custom-select-wrap">
                  <select
                    className="select-box"
                    value={selectedTechnicianType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedTechnicianType(e.target.value as TechnicianType)
                    }
                  >
                    {technicianTypes.map((tech) => (
                      <option key={tech.value} value={tech.value}>
                        {tech.label}
                      </option>
                    ))}
                  </select>

                  <div className="select-icon">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="info-box">
              <p>
                {selectedLoginType === 'student' &&
                  'Students can create incident tickets, upload evidence, comment on tickets, and track issue status.'}

                {selectedLoginType === 'staff' &&
                  'Staff members can report campus facility and equipment issues and follow service updates.'}

                {selectedLoginType === 'admin' &&
                  'Admins can manage tickets, assign technicians, review progress, and monitor overall operations.'}

                {selectedLoginType === 'technician' &&
                  `Technicians can access assigned repair tasks and update work progress as a ${selectedTechnicianLabel}.`}
              </p>
            </div>

            <button
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#ffffff"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#fff7ed"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#ffedd5"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#fed7aa"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
              <button onClick={() => navigate('/dashboard/my-tickets')} style={navBtnStyle}>
                Open My Tickets
              </button>

              <button onClick={() => navigate('/dashboard/technician/tickets')} style={navBtnStyle}>
                Open Technician Dashboard
              </button>

              <button onClick={() => navigate('/dashboard/admin/tickets')} style={navBtnStyle}>
                Open Admin Tickets
              </button>

              <button onClick={() => navigate('/dashboard/notifications')} style={navBtnStyle}>
                Open Notifications
              </button>
            </div>

            <div className="footer-note">
              Secure role-based access for students, staff, admins, and specialized technicians.
            </div>

            <div className="secure-note">
              OAuth 2.0 protected access · SLIIT Faculty of Computing
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;