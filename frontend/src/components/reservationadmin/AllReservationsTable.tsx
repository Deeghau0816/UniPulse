import React, { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../../services/reservationService';
import type { ReservationRecord, ReservationStatus, ResourceType } from '../../types/reservation';
import { StatusBadge } from '../reservation/StatusBadge'; 
import { RejectModal } from './RejectModal';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useToast } from '../shared/Toast';

interface AllReservationsTableProps {
  adminName?: string;
}

/* ─── Inline styles ─────────────────────────────────────────────────────── */
const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@600;700&display=swap');
`;

const css = `
  ${fonts}

  .brk-page * { box-sizing: border-box; }

  .brk-page {
    font-family: 'DM Sans', sans-serif;
    color: #0f172a;
  }

  /* ── Filter bar ── */
  .brk-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    padding: 14px 18px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    margin-bottom: 28px;
  }

  .brk-filters select,
  .brk-filters input[type="date"] {
    padding: 8px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #334155;
    background: #ffffff;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .brk-filters select:hover,
  .brk-filters input[type="date"]:hover {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }

  .brk-clear-btn {
    padding: 8px 16px;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    color: #ef4444;
    background: #fff;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .brk-clear-btn:hover { background: #fef2f2; }

  .brk-count {
    margin-left: auto;
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
  }

  /* ── Grid ── */
  .brk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }

  /* ── Card ── */
  .brk-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .brk-card:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,0.09);
    transform: translateY(-2px);
  }
  .brk-card.status-PENDING  { border-top: 3px solid #f59e0b; background: #fffdf5; }
  .brk-card.status-APPROVED { border-top: 3px solid #10b981; }
  .brk-card.status-REJECTED { border-top: 3px solid #ef4444; }
  .brk-card.status-CANCELLED{ border-top: 3px solid #94a3b8; }

  /* ── Card header ── */
  .brk-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 10px;
    border-bottom: 1px solid #f1f5f9;
  }
  .brk-id {
    font-family: 'Arial', sans-serif;
    font-weight: 700;
    font-size: 12px;
    color: #000000;
    letter-spacing: -0.02em;
  }

  /* ── Status pill ── */
  .brk-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .brk-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .pill-PENDING  { background: #fef3c7; color: #92400e; }
  .pill-PENDING .brk-dot  { background: #f59e0b; }
  .pill-APPROVED { background: #d1fae5; color: #065f46; }
  .pill-APPROVED .brk-dot { background: #10b981; }
  .pill-REJECTED { background: #fee2e2; color: #991b1b; }
  .pill-REJECTED .brk-dot { background: #ef4444; }
  .pill-CANCELLED{ background: #f1f5f9; color: #475569; }
  .pill-CANCELLED .brk-dot{ background: #94a3b8; }

  /* ── User row ── */
  .brk-user-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px 12px;
    border-bottom: 1px solid #f1f5f9;
  }
  .brk-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #818cf8, #6366f1);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-family: 'Syne', sans-serif;
  }
  .brk-user-name {
    font-size: 16px;
    font-weight: 600;
    color: #000000;
    margin: 0 0 2px;
    line-height: 1.3;
  }
  .brk-user-id {
    font-size: 13px;
    color: #656667;
    margin: 0;
    letter-spacing: 0.02em;
  }

  /* ── Details grid ── */
  .brk-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 20px;
    padding: 14px 18px;
    flex: 1;
  }
  .brk-detail-full { grid-column: 1 / -1; }
  .brk-label {
    font-size: 13px;
    font-weight: 600;
    color: #676767;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 3px;
  }
  .brk-value {
    font-size: 14px;
    color: #000000;
    font-weight: 500;
    line-height: 1.45;
    word-break: break-word;
  }
  .brk-value.muted { color: #94a3b8; font-style: italic; font-weight: 400; }

  /* ── Resource chip ── */
  .brk-chip {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 7px;
    border-radius: 5px;
    background: #f1f5f9;
    color: #64748b;
    margin-top: 3px;
  }

  /* ── Admin reason ── */
  .brk-reason {
    font-size: 12px;
    color: #ef4444;
    background: #fee2e2;
    padding: 3px 7px;
    border-radius: 5px;
    margin-top: 4px;
    display: inline-block;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Actions footer ── */
  .brk-actions {
    display: flex;
    gap: 8px;
    padding: 12px 18px 16px;
    border-top: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }
  .brk-btn {
    flex: 1;
    min-width: 80px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.18s ease;
    text-align: center;
    letter-spacing: 0.02em;
  }
  .brk-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-approve {
    background: #d1ffea; color: #059669; border-color: #a7f3d0;
  }
  .btn-approve:hover:not(:disabled) {
    background: #059669; color: #fff; border-color: #059669;
    box-shadow: 0 4px 14px rgba(5,150,105,0.3);
    transform: translateY(-1px);
  }

  .btn-reject {
    background: #ffe1e1; color: #dc2626; border-color: #fecaca;
  }
  .btn-reject:hover:not(:disabled) {
    background: #dc2626; color: #fff; border-color: #dc2626;
    box-shadow: 0 4px 14px rgba(220,38,38,0.3);
    transform: translateY(-1px);
  }

  .btn-cancel {
    background: #d0e8ff; color: #338fa9; border-color: #e2e8f0;
  }
  .btn-cancel:hover:not(:disabled) {
    background: #338fa9; color: #fff; border-color: #338fa9;
    box-shadow: 0 4px 14px rgba(51,143,169,0.3);
    transform: translateY(-1px);
  }

  .btn-delete {
    background: #ffe4e4; color: #dc2626; border-color: #fecaca;
  }
  .btn-delete:hover:not(:disabled) {
    background: #dc2626; color: #fff; border-color: #dc2626;
    box-shadow: 0 4px 14px rgba(220,38,38,0.3);
    transform: translateY(-1px);
  }

  .brk-by {
    font-size: 13px;
    color: #5f5f5f;
    align-self: center;
    margin-left: 2px;
  }

  /* ── Empty ── */
  .brk-empty {
    text-align: center;
    padding: 60px 20px;
    color: #94a3b8;
    font-size: 15px;
  }

`;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function initials(name: string) {
  return name
    .split(' ')
    .map(w => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function fmtDate(raw: string) {
  return new Date(raw).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function fmtType(t?: string) {
  return (t || '').replace(/_/g, ' ');
}

/* ─── Sub-component: single booking card ─────────────────────────────── */
interface CardProps {
  r: ReservationRecord;
  processing: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onCancel: (id: number) => void;
  onDelete: (id: number) => void;
}

const BookingCard: React.FC<CardProps> = ({
  r, processing, onApprove, onReject, onCancel, onDelete,
}) => {
  const busy = processing === r.id;

  return (
    <div className={`brk-card status-${r.status}`}>
      {/* Header */}
      <div className="brk-card-head">
        <span className="brk-id">#{r.id}</span>
        <StatusBadge status={r.status} size="sm" />
      </div>

      {/* User */}
      <div className="brk-user-row">
        <div className="brk-avatar">{initials(r.userName || r.userId || '')}</div>
        <div>
          <p className="brk-user-name">{r.userName || r.userId}</p>
          <p className="brk-user-id">{r.userId}</p>
        </div>
      </div>

      {/* Details */}
      <div className="brk-details">
        {/* Resource */}
        <div>
          <p className="brk-label">Resource</p>
          <p className="brk-value" style={{ marginBottom: 0 }}>{r.resourceName}</p>
          <span className="brk-chip">{fmtType(r.resourceType)}</span>
        </div>

        {/* Date & Time */}
        <div>
          <p className="brk-label">Date &amp; Time</p>
          <p className="brk-value" style={{ marginBottom: 0 }}>{fmtDate(r.reservationDate)}</p>
          <p className="brk-value" style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            {fmtTime(r.startTime)} - {fmtTime(r.endTime)}
          </p>
        </div>

        {/* Attendees */}
        <div>
          <p className="brk-label">Attendees</p>
          <p className={`brk-value${r.expectedAttendees ? '' : ' muted'}`}>
            {r.expectedAttendees || '—'}
          </p>
        </div>

        {/* Special Requirements */}
        <div>
          <p className="brk-label">Special Requirements</p>
          <p className={`brk-value${r.specialNotes ? '' : ' muted'}`}>
            {r.specialNotes || '—'}
          </p>
        </div>

        {/* Purpose – full width */}
        <div className="brk-detail-full">
          <p className="brk-label">Purpose</p>
          <p className={`brk-value${r.purpose ? '' : ' muted'}`}>{r.purpose || '—'}</p>
        </div>

        {/* Admin reason if present */}
        {r.adminReason && (
          <div className="brk-detail-full">
            <p className="brk-label">Admin Note</p>
            <span className="brk-reason" title={r.adminReason}>{r.adminReason}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="brk-actions">
        {r.status === 'PENDING' && (
          <>
            <button
              className="brk-btn btn-approve"
              disabled={busy}
              onClick={() => onApprove(r.id)}
            >
              {busy ? '…' : 'Approve'}
            </button>
            <button
              className="brk-btn btn-reject"
              disabled={busy}
              onClick={() => onReject(r.id)}
            >
              Reject
            </button>
          </>
        )}

        {r.status === 'APPROVED' && (
          <button
            className="brk-btn btn-cancel"
            onClick={() => onCancel(r.id)}
          >
            Cancel
          </button>
        )}

        {(r.status === 'REJECTED' || r.status === 'CANCELLED') && (
          <>
            <button
              className="brk-btn btn-delete"
              disabled={busy}
              onClick={() => onDelete(r.id)}
            >
              {busy ? '…' : 'Delete'}
            </button>
            <span className="brk-by">by {r.reviewedBy || 'Admin'}</span>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────────────── */
export const AllReservationsTable: React.FC<AllReservationsTableProps> = ({
  adminName = 'Admin',
}) => {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status: ReservationStatus | '';
    resourceType: ResourceType | '';
    date: string;
  }>({ status: '', resourceType: '', date: '' });
  const [modal, setModal] = useState<{
    open: boolean; id: number; action: 'REJECT' | 'CANCEL';
  } | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const { showToast, ToastRenderer } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reservationService.getAll({
        status: filters.status || undefined,
        resourceType: (filters.resourceType || undefined) as ResourceType | undefined,
        date: filters.date || undefined,
      });
      setReservations(data);
    } catch {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    setProcessing(id);
    try {
      await reservationService.updateStatus(id, { status: 'APPROVED', reviewedBy: adminName });
      showToast('Reservation approved', 'success');
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to approve', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this reservation? This cannot be undone.')) return;
    setProcessing(id);
    try {
      await reservationService.delete(id);
      showToast('Reservation deleted', 'success');
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleModalConfirm = async (reason: string) => {
    if (!modal) return;
    setProcessing(modal.id);
    try {
      await reservationService.updateStatus(modal.id, {
        status: modal.action === 'REJECT' ? 'REJECTED' : 'CANCELLED',
        reason,
        reviewedBy: adminName,
      });
      showToast(
        `Reservation ${modal.action === 'REJECT' ? 'rejected' : 'cancelled'}`,
        'warning',
      );
      setModal(null);
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const statusOptions: Array<ReservationStatus | ''> = [
    '', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED',
  ];
  const typeOptions: Array<ResourceType | ''> = [
    '', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT',
  ];

  const pending = reservations.filter(r => r.status === 'PENDING');
  const others  = reservations.filter(r => r.status !== 'PENDING');
  const sorted  = [...pending, ...others];

  return (
    <div className="brk-page">
      {/* Inject styles */}
      <style>{css}</style>

      {ToastRenderer}

      {modal && (
        <RejectModal
          isOpen={modal.open}
          onClose={() => setModal(null)}
          onConfirm={handleModalConfirm}
          title={modal.action === 'REJECT' ? 'Reject Reservation' : 'Cancel Reservation'}
          actionLabel={modal.action === 'REJECT' ? 'Reject' : 'Cancel Reservation'}
          submitting={processing === modal.id}
        />
      )}

      {/* ── Filters ── */}
      <div className="brk-filters">
        <select
          value={filters.status}
          onChange={e =>
            setFilters(prev => ({ ...prev, status: e.target.value as ReservationStatus | '' }))
          }
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt || 'All Statuses'}</option>
          ))}
        </select>

        <select
          value={filters.resourceType}
          onChange={e =>
            setFilters(prev => ({
              ...prev, resourceType: e.target.value as ResourceType | '',
            }))
          }
        >
          {typeOptions.map(opt => (
            <option key={opt} value={opt}>{opt ? fmtType(opt) : 'All Types'}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={e => setFilters(prev => ({ ...prev, date: e.target.value }))}
        />

        <button
          className="brk-clear-btn"
          onClick={() => setFilters({ status: '', resourceType: '', date: '' })}
        >
          Clear Filters
        </button>

        <span className="brk-count">{reservations.length} booking(s) found</span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingSpinner message="Loading all bookings..." />
      ) : sorted.length === 0 ? (
        <div className="brk-empty">No bookings match your filters.</div>
      ) : (
        <div className="brk-grid">
          {sorted.map(r => (
            <BookingCard
              key={r.id}
              r={r}
              processing={processing}
              onApprove={handleApprove}
              onReject={id => setModal({ open: true, id, action: 'REJECT' })}
              onCancel={id => setModal({ open: true, id, action: 'CANCEL' })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};