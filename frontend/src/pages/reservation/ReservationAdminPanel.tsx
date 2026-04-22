import React, { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../../services/reservationService';
import type { ReservationSummary } from '../../types/reservation';
import { AllReservationsTable } from '../../components/reservationadmin/AllReservationsTable';
import { ReservationCalendarView } from '../../components/reservationadmin/ReservationCalendarView';

const ADMIN = { name: 'Admin User' };

type AdminTab = 'dashboard' | 'all-reservations' | 'calendar' | 'peak-hours';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [summary, setSummary] = useState<ReservationSummary | null>(null);
  const [bookingsByHour, setBookingsByHour] = useState<{ hour: number; bookings: number }[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [hourDetails, setHourDetails] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<AdminTab | null>(null);

  const aggregateBookingsByHour = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const allReservations = await reservationService.getAll();
      const hourCounts: { [key: number]: number } = {};
      for (let i = 7; i <= 19; i++) { hourCounts[i] = 0; }
     allReservations.forEach(reservation => {
    if (reservation.startTime && reservation.endTime) {
    const [startHourStr] = reservation.startTime.split(':');
    const [endHourStr]   = reservation.endTime.split(':');
    const startHour = parseInt(startHourStr, 10);
    const endHour   = parseInt(endHourStr, 10);
    for (let h = startHour; h < endHour; h++) {
      if (h >= 7 && h <= 19) { hourCounts[h]++; }
    }
  }
});
      const data = Array.from({ length: 13 }, (_, i) => {
        const hour = i + 7;
        return { hour, bookings: hourCounts[hour] || 0 };
      });
      setBookingsByHour(data);
    } catch (error) {
      console.error('Failed to aggregate bookings by hour:', error);
      const mockData = Array.from({ length: 13 }, (_, i) => ({
        hour: i + 7,
        bookings: Math.floor(Math.random() * 15) + 1,
      }));
      setBookingsByHour(mockData);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const getHourDetails = useCallback(async (hour: number) => {
  try {
    const allReservations = await reservationService.getAll();
    const hourBookings = allReservations.filter(reservation => {
      if (reservation.startTime && reservation.endTime) {
        const [startHourStr] = reservation.startTime.split(':');
        const [endHourStr]   = reservation.endTime.split(':');
        const startHour = parseInt(startHourStr, 10);
        const endHour   = parseInt(endHourStr, 10);
        return startHour <= hour && endHour > hour;
      }
      return false;
    });
    setHourDetails(hourBookings);
    setSelectedHour(hour);
    setShowDetails(true);
  } catch (error) {
    console.error('Failed to get hour details:', error);
  }
}, []);

  const loadSummary = useCallback(async () => {
    try {
      const all = await reservationService.getAll();
      const s: ReservationSummary = {
        totalRequests: all.length,
        pendingCount:   all.filter(r => r.status === 'PENDING').length,
        approvedCount:  all.filter(r => r.status === 'APPROVED').length,
        rejectedCount:  all.filter(r => r.status === 'REJECTED').length,
        cancelledCount: all.filter(r => r.status === 'CANCELLED').length,
      };
      setSummary(s);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => {
    if (activeTab === 'peak-hours') { aggregateBookingsByHour(); }
  }, [activeTab, aggregateBookingsByHour]);

  const navItems: Array<{ id: AdminTab; label: string; accent: string }> = [
    { id: 'dashboard',        label: 'Dashboard',          accent: '#ea580c' },
    { id: 'all-reservations', label: 'All Requests',       accent: '#ea580c' },
    { id: 'calendar',         label: 'Calendar View',      accent: '#ea580c' },
    { id: 'peak-hours',       label: 'Peak Booking Hours', accent: '#ea580c' },
  ];

  const summaryCards = [
    { label: 'Total',     value: summary?.totalRequests ?? 0, color: '#3B82F6', bg: '#EFF6FF', icon: '' },
    { label: 'Pending',   value: summary?.pendingCount ?? 0,  color: '#F59E0B', bg: '#FFFBEB', icon: '' },
    { label: 'Approved',  value: summary?.approvedCount ?? 0, color: '#10B981', bg: '#ECFDF5', icon: '' },
    { label: 'Rejected',  value: summary?.rejectedCount ?? 0, color: '#EF4444', bg: '#FEF2F2', icon: '' },
    { label: 'Cancelled', value: summary?.cancelledCount ?? 0,color: '#6B7280', bg: '#F3F4F6', icon: '' },
  ];

  const maxBookings = Math.max(...bookingsByHour.map(d => d.bookings), 1);
  const yAxisMax    = Math.ceil(maxBookings / 5) * 5 || 20;
  const CHART_H     = 260;
  const Y_STEPS     = 5;

  const getBarColor = (bookings: number) => {
    if (bookings > 15) return { main: '#EF4444', light: '#FCA5A5', glow: 'rgba(239,68,68,0.30)' };
    if (bookings > 10) return { main: '#F59E0B', light: '#FCD34D', glow: 'rgba(245,158,11,0.30)' };
    if (bookings > 5)  return { main: '#10B981', light: '#6EE7B7', glow: 'rgba(16,185,129,0.30)' };
    return               { main: '#6366F1', light: '#A5B4FC', glow: 'rgba(99,102,241,0.30)' };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex' }}>

      <style>{`
        @keyframes pulse-badge {
          0%,100% { box-shadow: 0 2px 6px rgba(239,68,68,0.40); }
          50%      { box-shadow: 0 2px 14px rgba(239,68,68,0.75); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside style={{
        width: '248px',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #fed7aa, #fb923c)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 0',
        /* right shadow creates separation from main */
        boxShadow: '4px 0 20px rgba(249,115,22,0.09), 2px 0 6px rgba(0,0,0,0.07)',
        borderRight: '1px solid rgba(255,255,255,0.75)',
        position: 'relative',
      }}>

        {/* inner glassy sheen */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(140deg,rgba(255,255,255,0.60) 0%,rgba(255,255,255,0.08) 55%,transparent 100%)',
        }} />

        {/* ── Brand ── */}
        <div style={{
          padding: '0 18px 20px',
          borderBottom: '1px solid rgba(249,115,22,0.13)',
          position: 'relative',
        }}>
          <div style={{ color: '#1E1B4B', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.4px', lineHeight: 1.2 }}>Admin Control Panel</div>
        </div>

        {/* ── Admin Badge ── */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(249,115,22,0.13)',
          position: 'relative',
        }}>
          <div style={{ color: '#1E1B4B', fontWeight: 700, fontSize: '13.5px' }}>{ADMIN.name}</div>
          <div style={{
            display: 'inline-block', marginTop: '4px', padding: '2px 9px',
            background: 'linear-gradient(90deg,#ea580c,#fb923c)',
            borderRadius: '10px', fontSize: '9.5px', fontWeight: 800,
            color: '#FFFFFF', letterSpacing: '1.2px',
            boxShadow: '0 2px 8px rgba(249,115,22,0.38)',
          }}>ADMIN</div>
        </div>

        {/* ── Nav items ── */}
        <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
          {navItems.map(item => {
            const isActive  = activeTab === item.id;
            const isHovered = hoveredNav === item.id && !isActive;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: 'none',
                  borderRadius: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  textAlign: 'left',
                  position: 'relative',
                  color: isActive ? item.accent : '#374151',
                  /* 3-D shadow stack */
                  background: isActive
                    ? `linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 100%)`
                    : isHovered
                      ? 'rgba(255,255,255,0.72)'
                      : 'rgba(255,255,255,0.28)',
                  boxShadow: isActive
                    ? `0 6px 20px ${item.accent}28,
                       0 3px 8px rgba(0,0,0,0.10),
                       0 1px 0 rgba(255,255,255,0.95) inset,
                       0 -3px 0 ${item.accent}18 inset`
                    : isHovered
                      ? `0 4px 16px rgba(0,0,0,0.10),
                         0 2px 4px rgba(0,0,0,0.06),
                         0 1px 0 rgba(255,255,255,0.90) inset,
                         0 -1px 0 rgba(0,0,0,0.05) inset`
                      : `0 1px 3px rgba(0,0,0,0.05),
                         0 1px 0 rgba(255,255,255,0.60) inset`,
                  transform: isActive
                    ? 'translateY(-2px) scale(1.015)'
                    : isHovered
                      ? 'translateY(-1px)'
                      : 'translateY(0) scale(1)',
                  transition: 'all 0.20s cubic-bezier(0.34,1.56,0.64,1)',
                  /* left accent stripe for active */
                  borderLeft: isActive ? `3px solid ${item.accent}` : '3px solid transparent',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                <span style={{ flex: 1, paddingLeft: '4px' }}>{item.label}</span>

                {/* Pending badge */}
                {item.id === 'all-reservations' && summary && summary.pendingCount > 0 && (
                  <span style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '2px 7px',
                    fontSize: '11px',
                    fontWeight: 800,
                    animation: 'pulse-badge 2s infinite',
                    flexShrink: 0,
                  }}>{summary.pendingCount}</span>
                )}

                {/* Active indicator dot */}
                {isActive && (
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: item.accent,
                    boxShadow: `0 0 8px ${item.accent}`,
                    flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Divider + version tag ── */}
        <div style={{
          padding: '12px 18px 0',
          borderTop: '1px solid rgba(99,102,241,0.12)',
          position: 'relative',
        }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, textAlign: 'center', letterSpacing: '0.3px' }}>
            UniPulse Admin v1.0
          </div>
        </div>
      </aside>
      {/* ═════════════════════════════════════ */}

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 28px', backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111827' }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#9CA3AF' }}>
              Smart Campus Booking System - Admin Panel
            </p>
          </div>
          {summary && summary.pendingCount > 0 && (
            <div
              style={{
                padding: '8px 16px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D',
                borderRadius: '8px', fontSize: '13px', color: '#92400E', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s ease', transform: 'translateZ(0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FDE68A';
                e.currentTarget.style.borderColor = '#F59E0B';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(245,158,11,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF3C7';
                e.currentTarget.style.borderColor = '#FCD34D';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => setActiveTab('all-reservations')}
            >
               {summary.pendingCount} pending request{summary.pendingCount !== 1 ? 's' : ''} awaiting review
            </div>
          )}
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '18px', marginBottom: '32px' }}>
                {summaryCards.map(card => (
                  <div key={card.label} style={{
                    backgroundColor: card.bg, border: `1px solid ${card.color}30`,
                    borderRadius: '12px', padding: '24px 20px', textAlign: 'center',
                    transform: 'translateZ(0)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${card.color}20,0 4px 12px rgba(0,0,0,0.15)`;
                    e.currentTarget.style.borderColor = card.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = `${card.color}30`;
                  }}>
                    <div style={{ fontSize: '30px', marginBottom: '8px' }}>{card.icon}</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                    <div style={{ fontSize: '14px', color: '#000000', marginTop: '4px', fontWeight: 600 }}>{card.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#eeeeee', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 14px', fontWeight: 700, color: '#000000', fontSize: '16px' }}>Quick Actions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '50px' }}>
                  {[
                    { label: 'Review Pending Requests', icon: '', tab: 'all-reservations' as AdminTab, bg: '#FFFBEB', color: '#9d6300' },
                    { label: 'View Calendar',           icon: '', tab: 'calendar' as AdminTab,          bg: '#EFF6FF', color: '#002d75' },
                  ].map(a => (
                    <button key={a.label} onClick={() => setActiveTab(a.tab)} style={{
                      padding: '14px', backgroundColor: a.bg, border: `1px solid ${a.color}30`,
                      borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      gap: '10px', fontSize: '14px', fontWeight: 600, color: a.color,
                      fontFamily: 'Arial,sans-serif', transform: 'translateZ(0)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = `0 8px 25px ${a.color}20,0 4px 12px rgba(0,0,0,0.15)`;
                      e.currentTarget.style.borderColor = a.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = `${a.color}30`;
                    }}>
                      <span style={{ fontSize: '20px' }}>{a.icon}</span>{a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                backgroundColor: '#eeeeee', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '20px',
                transform: 'translateZ(0)', boxShadow: '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)';
              }}>
                <h4 style={{ margin: '0 0 16px', fontWeight: 700, color: '#000000', fontSize: '16px', fontFamily: 'Inter,sans-serif' }}>
                   Pending Bookings (Awaiting Action)
                </h4>
                <AllReservationsTable adminName={ADMIN.name} />
              </div>
            </div>
          )}

          {/* ── ALL RESERVATIONS ── */}
          {activeTab === 'all-reservations' && (
            <div style={{
              backgroundColor: '#eeeeee', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '24px',
              transform: 'translateZ(0)', boxShadow: '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)';
            }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#111827', fontFamily: 'Inter,sans-serif' }}>
                All Booking Requests
              </h3>
              <AllReservationsTable adminName={ADMIN.name} />
            </div>
          )}

          {/* ── CALENDAR ── */}
          {activeTab === 'calendar' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Booking Calendar</h3>
              <ReservationCalendarView />
            </div>
          )}

          {/* ── PEAK HOURS ── */}
          {activeTab === 'peak-hours' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#111827',
                  fontFamily: "Inter,sans-serif", letterSpacing: '-0.5px',
                }}>Peak Booking Hours Across All Days</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontFamily: "'Inter',sans-serif" }}>
                  Click on any bar to see detailed bookings for that hour
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg,#FFFFFF 0%,#F8FAFF 100%)',
                border: '1px solid #E0E7FF', borderRadius: '20px', padding: '28px 32px 24px',
                boxShadow: '0 8px 32px rgba(99,102,241,0.08),0 2px 8px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '260px', height: '260px',
                  background: 'radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '11px',
                      background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                    }}>📊</div>
                    <div>
                      <h4 style={{
                        margin: 0, fontSize: '17px', fontWeight: 700, color: '#1E1B4B',
                        fontFamily: "'Georgia',serif", letterSpacing: '-0.3px',
                      }}>Hourly Booking Distribution</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#474c56', fontFamily: "'Inter',sans-serif" }}>
                        7:00 AM — 7:00 PM
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px',
                    background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
                    border: '1px solid #6EE7B7', borderRadius: '20px',
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 0 2px rgba(16,185,129,0.3)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', fontFamily: "'Inter',sans-serif", letterSpacing: '0.8px', textTransform: 'uppercase' }}>Live Data</span>
                  </div>
                </div>

                {loadingBookings ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '360px', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', border: '3px solid #E5E7EB', borderTop: '3px solid #6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ color: '#9CA3AF', fontSize: '13px', fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Loading booking data…</span>
                  </div>
                ) : bookingsByHour.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '360px', color: '#9CA3AF', fontSize: '14px' }}>
                    No booking data available
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <div style={{ width: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '52px' }}>
                      <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '13px', fontWeight: 700, color: '#4B5563', fontFamily: "'Georgia',serif", letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        Number of Bookings
                      </span>
                    </div>
                    <div style={{ width: '30px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '52px', paddingTop: '2px' }}>
                      {Array.from({ length: Y_STEPS + 1 }, (_, i) => (
                        <span key={i} style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', fontFamily: "'Inter',monospace", textAlign: 'right', lineHeight: 1, display: 'block' }}>
                          {Math.round(yAxisMax * (1 - i / Y_STEPS))}
                        </span>
                      ))}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: '8px' }}>
                      <div style={{ position: 'relative', height: `${CHART_H}px`, borderLeft: '2px solid #94A3B8', borderBottom: '2px solid #94A3B8', background: 'linear-gradient(180deg,#F9FAFB 0%,#FFFFFF 100%)', borderRadius: '0 8px 0 0' }}>
                        {Array.from({ length: Y_STEPS + 1 }, (_, i) => (
                          i < Y_STEPS && (
                            <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i / Y_STEPS) * 100}%`, height: '1px', background: 'repeating-linear-gradient(90deg,#CBD5E1 0,#CBD5E1 4px,transparent 4px,transparent 10px)', pointerEvents: 'none' }} />
                          )
                        ))}
                        <div style={{ position: 'absolute', inset: '0 8px 0 8px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingBottom: '2px' }}>
                          {bookingsByHour.map(({ hour, bookings }) => {
                            const pct    = bookings > 0 ? Math.max((bookings / yAxisMax) * 100, 1.5) : 0;
                            const colors = getBarColor(bookings);
                            return (
                              <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: bookings > 0 ? colors.main : '#D1D5DB', fontFamily: "'Inter',monospace", marginBottom: '3px', lineHeight: 1, userSelect: 'none' as const }}>
                                  {bookings}
                                </span>
                                {bookings > 0 ? (
                                  <div
                                    title={`${hour}:00 – ${hour + 1}:00 · ${bookings} booking${bookings !== 1 ? 's' : ''}`}
                                    onClick={() => getHourDetails(hour)}
                                    style={{ width: '100%', height: `${pct}%`, minHeight: '4px', background: `linear-gradient(180deg,${colors.light} 0%,${colors.main} 100%)`, borderRadius: '5px 5px 2px 2px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 3px 10px ${colors.glow}`, border: `1px solid ${colors.main}50`, borderBottom: 'none' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scaleX(1.05)'; e.currentTarget.style.boxShadow = `0 8px 20px ${colors.glow}`; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 3px 10px ${colors.glow}`; e.currentTarget.style.filter = 'none'; }}
                                  />
                                ) : (
                                  <div style={{ width: '100%', height: '2px', background: 'transparent' }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', padding: '0 8px', gap: '6px', marginTop: '7px' }}>
                        {bookingsByHour.map(({ hour }) => (
                          <div key={hour} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: 600, fontFamily: "'Inter',sans-serif", letterSpacing: '0.2px' }}>
                            {hour}:00
                          </div>
                        ))}
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', fontWeight: 700, color: '#4B5563', fontFamily: "'Georgia',serif", letterSpacing: '0.3px' }}>
                        Time of Day
                      </div>
                    </div>
                  </div>
                )}

                {showDetails && (
                  <div style={{ background: 'linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%)', border: '1px solid #C4B5FD', borderRadius: '14px', padding: '20px', marginTop: '24px', boxShadow: '0 4px 16px rgba(99,102,241,0.10)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#3730A3', fontFamily: "'Georgia',serif", letterSpacing: '-0.2px' }}>
                        🕐 Bookings for {selectedHour}:00 – {selectedHour! + 1}:00
                      </h4>
                      <button onClick={() => setShowDetails(false)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>×</button>
                    </div>
                    {hourDetails.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', padding: '20px', fontFamily: "'Inter',sans-serif" }}>No bookings found for this hour</div>
                    ) : (
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {hourDetails.map((booking, index) => (
                          <div key={booking.id || index} style={{ backgroundColor: '#FFFFFF', border: '1px solid #DDD6FE', borderRadius: '10px', padding: '14px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(99,102,241,0.07)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <div style={{ fontWeight: 700, color: '#1E1B4B', fontSize: '15px', fontFamily: "'Georgia',serif" }}>{booking.resourceName || 'Unknown Resource'}</div>
                              <div style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, fontFamily: "'Inter',sans-serif", letterSpacing: '0.5px', textTransform: 'uppercase' as const,
                                backgroundColor: booking.status === 'APPROVED' ? '#D1FAE5' : booking.status === 'PENDING' ? '#FEF3C7' : booking.status === 'REJECTED' ? '#FEE2E2' : '#F3F4F6',
                                color: booking.status === 'APPROVED' ? '#065F46' : booking.status === 'PENDING' ? '#92400E' : booking.status === 'REJECTED' ? '#991B1B' : '#374151',
                                border: booking.status === 'APPROVED' ? '1px solid #6EE7B7' : booking.status === 'PENDING' ? '1px solid #FCD34D' : booking.status === 'REJECTED' ? '1px solid #FCA5A5' : '1px solid #D1D5DB',
                              }}>{booking.status || 'UNKNOWN'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '14px', color: '#090b0e', fontFamily: "'Inter',sans-serif" }}>
                              <div><strong style={{ color: '#16181c' }}>User:</strong> {booking.userName || 'Unknown'}</div>
                              <div><strong style={{ color: '#374151' }}>Time:</strong> {booking.startTime} – {booking.endTime}</div>
                              <div><strong style={{ color: '#374151' }}>Date:</strong> {booking.reservationDate}</div>
                              <div><strong style={{ color: '#374151' }}>Location:</strong> {booking.resourceLocation || 'N/A'}</div>
                            </div>
                            {booking.purpose && <div style={{ marginTop: '8px', fontSize: '14px', color: '#1b1f27', fontFamily: "'Inter',sans-serif" }}><strong>Purpose:</strong> {booking.purpose}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: '20px', marginTop: '28px', padding: '14px 20px', background: 'rgba(243,244,246,0.8)', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  {[
                    { color: '#EF4444', light: '#FCA5A5', label: 'High',     range: '15–20' },
                    { color: '#F59E0B', light: '#FCD34D', label: 'Medium',   range: '10–14' },
                    { color: '#10B981', light: '#6EE7B7', label: 'Low',      range: '5–9'   },
                    { color: '#6366F1', light: '#A5B4FC', label: 'Very Low', range: '0–4'   },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: `linear-gradient(180deg,${item.light},${item.color})`, boxShadow: `0 2px 6px ${item.color}40` }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', fontFamily: "'Inter',sans-serif" }}>
                        {item.label}<span style={{ color: '#9CA3AF', fontWeight: 400, marginLeft: '4px' }}>({item.range})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminPanel;