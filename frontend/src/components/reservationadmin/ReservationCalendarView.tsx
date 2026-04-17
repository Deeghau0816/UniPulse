import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/reservationService';
import type { ReservationRecord } from '../../types/reservation';
import { StatusBadge } from '../reservation/StatusBadge';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@600;700&display=swap');

  .cal-wrap * { box-sizing: border-box; }

  .cal-wrap {
    font-family: 'DM Sans', sans-serif;
    display: grid;
    grid-template-columns: 1.5fr 380px;
    gap: 30px;
    align-items: start;
    color: #0f172a;
  }

  /* ── Left: calendar card — UNCHANGED ── */
  .cal-card {
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: linear-gradient(135deg, #0c3cea 0%, #16a6f9fe 55%, rgb(51, 95, 225) 100%);
  }

  .cal-month-label {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .cal-nav-btn {
    width: 34px; height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.12);
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, transform 0.15s;
    line-height: 1;
  }
  .cal-nav-btn:hover {
    background: rgba(255,255,255,0.28);
    transform: scale(1.1);
  }

  .cal-day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .cal-day-header {
    padding: 10px 4px;
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .cal-day-header.weekend { color: #a78bfa; }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .cal-cell-empty {
    min-height: 90px;
    border-bottom: 1px solid #f1f5f9;
    border-right: 1px solid #f1f5f9;
    background: #fafbfc;
  }

  .cal-cell {
    min-height: 90px;
    padding: 7px 6px 6px;
    border-bottom: 1px solid #f1f5f9;
    border-right: 1px solid #f1f5f9;
    cursor: pointer;
    background: #ffffff;
    transition: background 0.15s;
    position: relative;
  }
  .cal-cell:hover { background: #f0f4ff; }
  .cal-cell.is-today { background: #fefce8; }
  .cal-cell.is-selected { background: #eff6ff; outline: 2px solid #6387f1; outline-offset: -2px; }
  .cal-cell.is-selected.is-today { background: #ede9fe; }

  .cal-day-num {
    width: 26px; height: 26px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 5px;
  }
  .cal-day-num.today {
    background: #6366f1;
    color: #ffffff;
    font-weight: 700;
  }

  .cal-event-pill {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 5px;
    border-radius: 4px;
    margin-bottom: 2px;
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-left: 3px solid;
    cursor: pointer;
    transition: filter 0.15s;
  }
  .cal-event-pill:hover { filter: brightness(0.93); }

  .cal-more {
    font-size: 12px;
    color: #6366f1;
    font-weight: 600;
    padding-left: 2px;
    margin-top: 2px;
  }

  /* ── Right: side panel ── */
  .cal-panel {
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    position: sticky;
    top: 20px;
  }

  .cal-panel-head {
    padding: 18px 22px;
    background: linear-gradient(135deg, #4678e5 0%, #63c4f1 100%);
  }
  .cal-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 500;
    color: #ffffff;
    margin: 0 0 3px;
    letter-spacing: -0.01em;
  }
  .cal-panel-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.75);
    font-weight: 400;
    margin: 0;
  }

  /* ── Stats bar ── */
  .cal-stats-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid #f1f5f9;
  }
  .cal-stat {
    padding: 12px 10px;
    text-align: center;
    border-right: 1px solid #f1f5f9;
  }
  .cal-stat:last-child { border-right: none; }
  .cal-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .cal-stat-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #000001;
  }

  /* ── Panel body ── */
  .cal-panel-body {
    padding: 16px 18px;
    max-height: 520px;
    overflow-y: auto;
  }
  .cal-panel-body::-webkit-scrollbar { width: 4px; }
  .cal-panel-body::-webkit-scrollbar-track { background: transparent; }
  .cal-panel-body::-webkit-scrollbar-thumb { background: #fed7aa; border-radius: 4px; }

  .cal-empty-msg {
    text-align: center;
    color: #4d535a;
    font-size: 14px;
    padding: 36px 10px;
    line-height: 1.6;
  }
  .cal-empty-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.5; display: block; }

  /* ── Reservation cards in panel ── */
  .cal-res-card {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.15s;
  }
  .cal-res-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  .cal-res-card-accent { height: 4px; width: 100%; }
  .cal-res-card-body { padding: 12px 16px; background: #fafafa; }

  .cal-res-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 10px;
  }
  .cal-res-name {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    line-height: 1.3;
  }
  .cal-res-meta { display: flex; flex-direction: column; gap: 4px; }
  .cal-res-meta-row {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
    color: #3d434c;
  }
  .cal-res-meta-icon {
    width: 16px; height: 16px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
  }
  .cal-res-purpose {
    font-size: 13px;
    color: #4c5158;
    margin-top: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Legend ── */
  .cal-legend {
    padding: 14px 20px;
    border-top: 1px solid #f1f5f9;
    background: #fff7ed;
  }
  .cal-legend-title {
    font-size: 10px;
    font-weight: 700;
    color: #9a3412;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 10px;
  }
  .cal-legend-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
  }
  .cal-legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: #292d33;
    font-weight: 500;
  }
  .cal-legend-dot {
    width: 9px; height: 9px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  @media (max-width: 1024px) {
    .cal-wrap { grid-template-columns: 1fr 340px; }
  }
  @media (max-width: 900px) {
    .cal-wrap { grid-template-columns: 1fr; }
    .cal-panel { position: static; }
  }
`;

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:   { color: '#f59e0b', bg: '#fef3c725', label: 'Pending' },
  APPROVED:  { color: '#10b981', bg: '#d1fae525', label: 'Approved' },
  REJECTED:  { color: '#ef4444', bg: '#fee2e225', label: 'Rejected' },
  CANCELLED: { color: '#94a3b8', bg: '#f1f5f925', label: 'Cancelled' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* Helper function to format time with AM/PM */
function fmtTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export const ReservationCalendarView: React.FC = () => {
  const [viewDate, setViewDate]         = useState(new Date());
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading]           = useState(false);
  const [selected, setSelected]         = useState<string | null>(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate   = new Date(year, month + 1, 0).toISOString().split('T')[0];
    setLoading(true);
    reservationService.getCalendar(startDate, endDate)
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthName   = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date().toISOString().split('T')[0];

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const reservationsOnDay = (day: number) =>
    reservations.filter(r => r.reservationDate === getDateStr(day));

  const selectedDayReservations = selected
    ? reservations.filter(r => r.reservationDate === selected)
    : [];

  const counts = {
    PENDING:   reservations.filter(r => r.status === 'PENDING').length,
    APPROVED:  reservations.filter(r => r.status === 'APPROVED').length,
    REJECTED:  reservations.filter(r => r.status === 'REJECTED').length,
    CANCELLED: reservations.filter(r => r.status === 'CANCELLED').length,
  };

  const selectedDateLabel = selected
    ? new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <>
      <style>{css}</style>
      <div className="cal-wrap">

        {/* ════ LEFT: Calendar (unchanged) ════ */}
        <div className="cal-card">

          <div className="cal-header">
            <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
            <h3 className="cal-month-label">{monthName}</h3>
            <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
          </div>

          <div className="cal-day-headers">
            {DAYS.map((d, i) => (
              <div key={d} className={`cal-day-header${i === 0 || i === 6 ? ' weekend' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {loading && (
            <div style={{ padding: '24px' }}>
              <LoadingSpinner message="Loading calendar…" size="sm" />
            </div>
          )}

          {!loading && (
            <div className="cal-grid">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} className="cal-cell-empty" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr    = getDateStr(day);
                const dayRes     = reservationsOnDay(day);
                const isToday    = dateStr === today;
                const isSelected = selected === dateStr;
                const classes    = [
                  'cal-cell',
                  isToday    ? 'is-today'    : '',
                  isSelected ? 'is-selected' : '',
                ].filter(Boolean).join(' ');

                return (
                  <div
                    key={day}
                    className={classes}
                    onClick={() => setSelected(isSelected ? null : dateStr)}
                    role="button"
                    aria-label={`${dateStr}, ${dayRes.length} reservations`}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setSelected(isSelected ? null : dateStr)}
                  >
                    <div className={`cal-day-num${isToday ? ' today' : ''}`}>{day}</div>

                    {dayRes.slice(0, 3).map(r => {
                      const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.CANCELLED;
                      return (
                        <div
                          key={r.id}
                          className="cal-event-pill"
                          style={{ backgroundColor: cfg.bg, borderLeftColor: cfg.color }}
                          title={`${r.resourceName}: ${fmtTime(r.startTime)}-${fmtTime(r.endTime)}`}
                        >
                          <span style={{ color: cfg.color, fontWeight: 700, fontSize: 9 }}>
                            {fmtTime(r.startTime)}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.resourceName}
                          </span>
                        </div>
                      );
                    })}

                    {dayRes.length > 3 && (
                      <div className="cal-more">+{dayRes.length - 3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ════ RIGHT: Side panel (wider) ════ */}
        <div className="cal-panel">

          <div className="cal-panel-head">
            <p className="cal-panel-title">{selectedDateLabel ?? 'Select a date'}</p>
            <p className="cal-panel-sub">
              {selected
                ? `${selectedDayReservations.length} reservation${selectedDayReservations.length !== 1 ? 's' : ''}`
                : 'Click any day to see bookings'}
            </p>
          </div>

          {/* Stats */}
          <div className="cal-stats-bar">
            {(Object.entries(counts) as [string, number][]).map(([status, n]) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <div className="cal-stat" key={status}>
                  <div className="cal-stat-num" style={{ color: cfg.color }}>{n}</div>
                  <div className="cal-stat-label">{cfg.label}</div>
                </div>
              );
            })}
          </div>

          {/* List */}
          <div className="cal-panel-body">
            {!selected && (
              <div className="cal-empty-msg">
                <span className="cal-empty-icon">📅</span>
                <p style={{ margin: 0 }}>Pick a day on the calendar<br />to view its bookings</p>
              </div>
            )}

            {selected && selectedDayReservations.length === 0 && (
              <div className="cal-empty-msg">
                <span className="cal-empty-icon">🗓️</span>
                <p style={{ margin: 0 }}>No bookings<br />on this day</p>
              </div>
            )}

            {selectedDayReservations.map(r => {
              const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.CANCELLED;
              return (
                <div className="cal-res-card" key={r.id}>
                  <div className="cal-res-card-accent" style={{ background: cfg.color }} />
                  <div className="cal-res-card-body">
                    <div className="cal-res-top">
                      <p className="cal-res-name">{r.resourceName}</p>
                      <StatusBadge status={r.status} size="sm" />
                    </div>
                    <div className="cal-res-meta">
                      <div className="cal-res-meta-row">
                        <span className="cal-res-meta-icon" style={{ background: cfg.color + '20', color: cfg.color }}>⏱</span>
                        {fmtTime(r.startTime)} – {fmtTime(r.endTime)}
                      </div>
                      <div className="cal-res-meta-row">
                        <span className="cal-res-meta-icon" style={{ background: '#6366f120', color: '#6366f1' }}>👤</span>
                        {r.userName || r.userId}
                      </div>
                      {r.expectedAttendees && (
                        <div className="cal-res-meta-row">
                          <span className="cal-res-meta-icon" style={{ background: '#0ea5e920', color: '#0ea5e9' }}>👥</span>
                          {r.expectedAttendees} attendees
                        </div>
                      )}
                    </div>
                    {r.purpose && (
                      <div className="cal-res-purpose" title={r.purpose}>{r.purpose}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="cal-legend">
            <p className="cal-legend-title">Legend</p>
            <div className="cal-legend-grid">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                <div className="cal-legend-item" key={status}>
                  <span className="cal-legend-dot" style={{ background: cfg.color }} />
                  {cfg.label}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};