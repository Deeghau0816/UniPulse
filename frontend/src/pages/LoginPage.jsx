import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState('student');
  const [selectedTechnicianType, setSelectedTechnicianType] = useState('electrical');
const navigate = useNavigate();

const navBtnStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.08)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  cursor: 'pointer'
};

  const technicianTypes = [
    { value: 'electrical', label: 'Electrical Technician' },
    { value: 'it-support', label: 'IT Support Technician' },
    { value: 'mechanical', label: 'Mechanical Technician' },
    { value: 'lab-equipment', label: 'Lab Equipment Technician' },
  ];

  const handleGoogleLogin = () => {
    setIsLoading(true);

    // Later you can pass selectedLoginType and selectedTechnicianType to backend if needed
    // Example:
    // window.location.href = `http://localhost:8080/oauth2/authorization/google?loginType=${selectedLoginType}&techType=${selectedTechnicianType}`;

    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const stats = [
    { num: '24/7', label: 'Support Available' },
    { num: '500+', label: 'Active Users' },
    { num: '98%', label: 'Resolution Rate' },
    { num: '4.8★', label: 'User Rating' },
  ];

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
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e1b4b 100%);
          position: relative;
          overflow: hidden;
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

        .left-panel {
          flex: 1.4;
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
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          margin-bottom: 28px;
          backdrop-filter: blur(12px);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
        }

        .brand-badge span {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #bfdbfe;
        }

        .hero-title {
          font-size: 68px;
          line-height: 1.05;
          font-weight: 800;
          margin-bottom: 22px;
          max-width: 760px;
          background: linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          max-width: 700px;
          font-size: 18px;
          line-height: 1.8;
          color: rgba(219, 234, 254, 0.82);
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(220px, 260px));
          gap: 18px;
        }

        .stat-card {
          padding: 26px 24px;
          border-radius: 24px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(14px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.09);
        }

        .stat-number {
          font-size: 34px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(191, 219, 254, 0.8);
        }

        .right-panel {
          flex: 1.15;
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
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.16);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 34px;
          padding: 52px 46px;
          box-shadow: 0 32px 90px rgba(0,0,0,0.38);
        }

        .card-top {
          margin-bottom: 34px;
          text-align: center;
        }

        .lock-icon-wrap {
          width: 82px;
          height: 82px;
          margin: 0 auto 22px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 14px 36px rgba(79, 70, 229, 0.35);
        }

        .card-title {
          font-size: 38px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #ffffff;
        }

        .card-subtitle {
          font-size: 15px;
          line-height: 1.8;
          color: rgba(219, 234, 254, 0.76);
          max-width: 560px;
          margin: 0 auto;
        }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(191, 219, 254, 0.76);
          margin-bottom: 14px;
        }

        .login-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .type-card {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 20px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .type-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.08);
        }

        .type-card.active {
          border: 1px solid rgba(96, 165, 250, 0.9);
          background: rgba(59, 130, 246, 0.16);
          box-shadow: 0 0 0 1px rgba(96,165,250,0.22);
        }

        .type-title {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .type-desc {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(219, 234, 254, 0.72);
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
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.14);
          background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          backdrop-filter: blur(14px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .select-box:focus {
          border-color: rgba(96, 165, 250, 0.95);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
          background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.07));
        }

        .select-box option {
          color: #111827;
          background: #ffffff;
        }

        .select-icon {
          position: absolute;
          top: 50%;
          right: 18px;
          transform: translateY(-50%);
          pointer-events: none;
          color: rgba(191, 219, 254, 0.9);
        }

        .info-box {
          margin-bottom: 24px;
          padding: 18px 18px;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .info-box p {
          font-size: 14px;
          line-height: 1.75;
          color: rgba(219, 234, 254, 0.78);
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 22px;
          border: none;
          border-radius: 20px;
          background: #ffffff;
          color: #111827;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.22);
        }

        
        .google-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(0,0,0,0.28);
        }

        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .footer-note {
          text-align: center;
          font-size: 13px;
          line-height: 1.8;
          color: rgba(191, 219, 254, 0.66);
        }

        .secure-note {
          margin-top: 14px;
          text-align: center;
          font-size: 12px;
          color: rgba(191, 219, 254, 0.56);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-top-color: #4f46e5;
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
            font-size: 54px;
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
        <div className="orb orb-1" />
        <div className="orb orb-2" />

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
                    onChange={(e) => setSelectedTechnicianType(e.target.value)}
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
                  `Technicians can access assigned repair tasks and update work progress as a ${
                    technicianTypes.find((tech) => tech.value === selectedTechnicianType)?.label
                  }.`}
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
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
  <button
    onClick={() => navigate('/dashboard/my-tickets')}
    style={navBtnStyle}
  >
    Open My Tickets
  </button>

  <button
    onClick={() => navigate('/dashboard/technician/tickets')}
    style={navBtnStyle}
  >
    Open Technician Dashboard
  </button>

  <button
    onClick={() => navigate('/dashboard/admin/tickets')}
    style={navBtnStyle}
  >
    Open Admin Tickets
  </button>

  <button
    onClick={() => navigate('/dashboard/notifications')}
    style={navBtnStyle}
  >
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