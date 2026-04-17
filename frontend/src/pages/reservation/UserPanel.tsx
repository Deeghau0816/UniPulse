import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import type { ReservationSummary, ReservationRecord } from '../../types/reservation';
import { ReservationRequestForm } from '../../components/reservation/ReservationRequestForm';
import { MyReservationsList } from '../../components/reservation/MyReservationsList';
import { NotificationPanel } from '../../components/reservation/NotificationPanel';

// Hard-coded demo user; replace with OAuth user in Module E
const DEMO_USER = { id: 'user-001', name: 'Alice Johnson' };

type Tab = 'dashboard' | 'request' | 'reservations' | 'notifications';

const navColors: Record<Tab, { active: string; glow: string; hover: string }> = {
  dashboard:     { active: '#002d75', glow: 'rgba(0, 35, 92, 0.45)',  hover: '#002679' },
  request:       { active: '#002d75', glow: 'rgba(0, 35, 92, 0.45)',  hover: '#002679'},
  reservations:  { active: '#002d75', glow: 'rgba(0, 35, 92, 0.45)',  hover: '#002679'},
  notifications: { active: '#002d75', glow: 'rgba(0, 35, 92, 0.45)',  hover: '#002679'},
};

const UserPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [summary, setSummary] = useState<ReservationSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingReservation, setUpdatingReservation] = useState<ReservationRecord | null>(null);
  const [hoveredNav, setHoveredNav] = useState<Tab | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const data = await reservationService.getSummary(DEMO_USER.id);
      setSummary(data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary, refreshKey]);

  const handleUpdateClick = (reservation: ReservationRecord) => {
    setUpdatingReservation(reservation);
    setActiveTab('request');
  };

  const handleUpdateSuccess = () => {
    setUpdatingReservation(null);
    setRefreshKey(k => k + 1);
    setActiveTab('reservations');
  };

  const navItems: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'dashboard',     label: 'Booking Dashboard',   icon: '' },
    { id: 'request',      label: 'New Booking Request',  icon: '' },
    { id: 'reservations', label: 'My Bookings',          icon: '' },
    { id: 'notifications',label: 'Notifications',        icon: '' },
  ];

  const summaryCards = [
    { label: 'Total Requests', value: summary?.totalRequests ?? 0,  color: '#3B82F6', bg: '#EFF6FF', icon: '' },
    { label: 'Pending',        value: summary?.pendingCount ?? 0,    color: '#F59E0B', bg: '#FFFBEB', icon: '' },
    { label: 'Approved',       value: summary?.approvedCount ?? 0,   color: '#10B981', bg: '#ECFDF5', icon: '' },
    { label: 'Rejected',       value: summary?.rejectedCount ?? 0,   color: '#EF4444', bg: '#FEF2F2', icon: '' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', fontSize: '16px' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        /* light ash gradient */
        background: 'linear-gradient(160deg, #d6d8db 0%, #b8bcc2 35%, #9ea3ab 65%, #8a9099 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
      }}>

        {/* Brand */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px' }}>🏛️</span>
            <span style={{ color: '#1a1a2e', fontWeight: 800, fontSize: '18px' }}>UniPulse</span>
          </div>
          <div style={{ fontSize: '11px', color: 'rgb(0, 0, 0)', marginLeft: '34px' }}>User Control Panel</div>
        </div>

        {/* User Info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>
          <div style={{
            width: '48px', height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}>👤</div>
          <div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '16px' }}>{DEMO_USER.name}</div>
          <div style={{ color: 'rgba(20,20,40,0.55)', fontSize: '13px' }}>Student – USER role</div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => {
            const isActive  = activeTab === item.id;
            const isHovered = hoveredNav === item.id;
            const c = navColors[item.id];

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 600,
                  fontFamily: 'inherit',
                  color: isActive ? '#ffffff' : '#1a1a2e',
                  textAlign: 'left',

                  /* 3-D transform */
                  transform: isActive
                    ? 'perspective(600px) rotateX(0deg) translateZ(8px) scale(1.04)'
                    : isHovered
                      ? 'perspective(600px) rotateX(-4deg) translateZ(6px) scale(1.03)'
                      : 'perspective(600px) rotateX(4deg) translateZ(0px) scale(1)',

                  /* background */
                  background: isActive
                    ? `linear-gradient(135deg, ${c.active}, ${c.hover})`
                    : isHovered
                      ? 'rgba(255,255,255,0.55)'
                      : 'rgba(255,255,255,0.22)',

                  /* shadow / glow */
                  boxShadow: isActive
                    ? `0 8px 20px ${c.glow}, 0 3px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)`
                    : isHovered
                      ? `0 6px 16px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)`
                      : `0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.35)`,

                  /* left accent bar */
                  borderLeft: isActive ? `4px solid rgba(255,255,255,0.6)` : '4px solid transparent',

                  transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back to home link */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgb(0, 0, 0)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'rgb(0, 0, 0)', fontSize: '14px', cursor: 'pointer', textAlign: 'left', padding: '6px 0', fontFamily: 'Arial, sans-serif' }}
          >
            Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 28px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#111827' }}>
              {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#9CA3AF' }}>
              Smart Campus Booking System - User Panel
            </p>
          </div>
          <button
            onClick={() => { setActiveTab('request'); }}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.4), 0 4px 12px rgba(0,0,0,0.15)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB, #4F46E5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6, #6366F1)';
            }}
          >
            New Booking
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <div>
              <h3 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                Welcome back, {DEMO_USER.name.split(' ')[0]}!
              </h3>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '32px' }}>
                {summaryCards.map(card => (
                  <div key={card.label} style={{
                    backgroundColor: card.bg,
                    border: `1px solid ${card.color}30`,
                    borderRadius: '16px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    position: 'relative',
                    transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)',
                    boxShadow: `
                      0 20px 40px rgba(0, 0, 0, 0.15),
                      0 10px 20px rgba(0, 0, 0, 0.1),
                      0 5px 10px rgba(0, 0, 0, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(20px) scale(1.05)';
                    e.currentTarget.style.border = `1px solid ${card.color}`;
                    e.currentTarget.style.boxShadow = `
                      0 30px 60px rgba(0, 0, 0, 0.2),
                      0 15px 30px rgba(0, 0, 0, 0.15),
                      0 8px 16px rgba(0, 0, 0, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(-5deg)';
                    e.currentTarget.style.border = `1px solid ${card.color}30`;
                    e.currentTarget.style.boxShadow = `
                      0 20px 40px rgba(0, 0, 0, 0.15),
                      0 10px 20px rgba(0, 0, 0, 0.1),
                      0 5px 10px rgba(0, 0, 0, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `;
                  }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '10px', transform: 'translateZ(10px)' }}>{card.icon}</div>
                    <div style={{ fontSize: '30px', fontWeight: 800, color: card.color, lineHeight: 1, transform: 'translateZ(10px)' }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: '15px', color: '#000000', marginTop: '6px', fontWeight: 600, transform: 'translateZ(10px)' }}>
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{
                backgroundColor: '#f3f3f3',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '38px',
              }}>
                <h4 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#0a1423' }}>Quick Actions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '30px' }}>
                  {[
                    { label: 'New Booking Request', icon: '', tab: 'request' as Tab, bg: '#ffffff', color: '#1e3483' },
                    { label: 'View My Bookings',    icon: '', tab: 'reservations' as Tab, bg: '#ffffff', color: '#06691f' },
                    { label: 'Check Notifications',     icon: '', tab: 'notifications' as Tab, bg: '#ffffff', color: '#9b4300' },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={() => setActiveTab(action.tab)}
                      style={{
                        padding: '16px',
                        backgroundColor: action.bg,
                        border: `1px solid ${action.color}30`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: action.color,
                        fontFamily: 'Poppins, sans-serif',
                        position: 'relative',
                        transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)',
                        boxShadow: `
                          0 20px 40px rgba(0, 0, 0, 0.15),
                          0 10px 20px rgba(0, 0, 0, 0.1),
                          0 5px 10px rgba(0, 0, 0, 0.05),
                          inset 0 1px 0 rgba(255, 255, 255, 0.6),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                        `,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transformStyle: 'preserve-3d',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(20px) scale(1.05)';
                        e.currentTarget.style.border = `1px solid ${action.color}`;
                        e.currentTarget.style.boxShadow = `
                          0 30px 60px rgba(0, 0, 0, 0.2),
                          0 15px 30px rgba(0, 0, 0, 0.15),
                          0 8px 16px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.8),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                        `;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(-5deg)';
                        e.currentTarget.style.border = `1px solid ${action.color}30`;
                        e.currentTarget.style.boxShadow = `
                          0 20px 40px rgba(0, 0, 0, 0.15),
                          0 10px 20px rgba(0, 0, 0, 0.1),
                          0 5px 10px rgba(0, 0, 0, 0.05),
                          inset 0 1px 0 rgba(255, 255, 255, 0.6),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                        `;
                      }}
                    >
                      <span style={{ fontSize: '24px', transform: 'translateZ(10px)' }}>{action.icon}</span>
                      <span style={{ transform: 'translateZ(10px)' }}>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Reservations Preview */}
              <div style={{ backgroundColor: '#f3f3f3', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#0a1423' }}>Recent Bookings</h4>
                <MyReservationsList userId={DEMO_USER.id} refreshKey={refreshKey} onUpdateClick={handleUpdateClick} />
              </div>
            </div>
          )}

          {/* ── MY RESERVATIONS TAB ── */}
          {activeTab === 'reservations' && (
            <div style={{ backgroundColor: '#f3f3f3', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                 My Bookings
              </h3>
              <MyReservationsList userId={DEMO_USER.id} refreshKey={refreshKey} onUpdateClick={handleUpdateClick} />
            </div>
          )}

          {/* ── REQUEST FORM TAB ── */}
          {activeTab === 'request' && (
            <div style={{ backgroundColor: '#f3f3f3', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                 {updatingReservation ? 'Update Booking Request' : 'New Booking Request'}
              </h3>
              <ReservationRequestForm
                userId={DEMO_USER.id}
                userName={DEMO_USER.name}
                initialData={updatingReservation || undefined}
                isUpdate={!!updatingReservation}
                onSuccess={updatingReservation ? handleUpdateSuccess : () => {
                  setRefreshKey(k => k + 1);
                  setActiveTab('reservations');
                }}
              />
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && (
            <div style={{ backgroundColor: '#f3f3f3', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
              <NotificationPanel userId={DEMO_USER.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserPanel;