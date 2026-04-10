import React, { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../../services/reservationService';
import type { ReservationRecord, ReservationStatus } from '../../types/reservation';
import { StatusBadge } from './StatusBadge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useToast } from '../shared/Toast';

interface MyReservationsListProps {
  userId: string;
  refreshKey?: number;
  onUpdateClick?: (reservation: ReservationRecord) => void;
}

export const MyReservationsList: React.FC<MyReservationsListProps> = ({ userId, refreshKey = 0, onUpdateClick }) => {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationRecord | null>(null);
  const { showToast, ToastRenderer } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reservationService.getByUser(userId);
      setReservations(data);
    } catch {
      showToast('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setCancelling(id);
    try {
      await reservationService.cancelOwn(id, userId);
      showToast('Reservation cancelled successfully', 'success');
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const canUpdateReservation = (reservation: ReservationRecord): boolean => {
    // Can't update if already approved
    if (reservation.status === 'APPROVED') return false;
    
    // Can't update if rejected or cancelled
    if (reservation.status === 'REJECTED' || reservation.status === 'CANCELLED') return false;
    
    // Check if within 2 hours of submission
    const now = new Date();
    const createdAt = new Date(reservation.createdAt);
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const timeDiff = now.getTime() - createdAt.getTime();
    
    return timeDiff <= twoHoursInMs;
  };

  const filtered = filter === 'ALL' ? reservations : reservations.filter(r => r.status === filter);
  const filterOptions: Array<ReservationStatus | 'ALL'> = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  const formatTimeWithAMPM = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const filterColors: Record<string, { active: string; bg: string }> = {
    ALL:       { active: '#3B82F6', bg: '#EFF6FF' },
    PENDING:   { active: '#F59E0B', bg: '#FFFBEB' },
    APPROVED:  { active: '#10B981', bg: '#ECFDF5' },
    REJECTED:  { active: '#EF4444', bg: '#FEF2F2' },
    CANCELLED: { active: '#6B7280', bg: '#F9FAFB' },
  };

  if (loading) return <LoadingSpinner message="Loading your bookings..." />;

  return (
    <div>
      {ToastRenderer}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filterOptions.map(opt => {
          const isActive = filter === opt;
          const cfg = filterColors[opt];
          const count = opt === 'ALL' ? reservations.length : reservations.filter(r => r.status === opt).length;
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: `1px solid ${isActive ? cfg.active : '#E5E7EB'}`,
                backgroundColor: isActive ? cfg.bg : '#FFFFFF',
                color: isActive ? cfg.active : '#192744',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                position: 'relative',
                transform: 'perspective(1000px) rotateX(2deg) rotateY(-1deg)',
                boxShadow: `
                  0 8px 16px rgba(0, 0, 0, 0.08),
                  0 4px 8px rgba(0, 0, 0, 0.06),
                  0 2px 4px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.6),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transformStyle: 'preserve-3d',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(6px) scale(1.05)';
                e.currentTarget.style.boxShadow = `
                  0 12px 24px rgba(0, 0, 0, 0.12),
                  0 6px 12px rgba(0, 0, 0, 0.08),
                  0 3px 6px rgba(0, 0, 0, 0.06),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) rotateY(-1deg)';
                e.currentTarget.style.boxShadow = `
                  0 8px 16px rgba(0, 0, 0, 0.08),
                  0 4px 8px rgba(0, 0, 0, 0.06),
                  0 2px 4px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.6),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `;
              }}
            >
              {opt === 'ALL' ? 'All' : opt.charAt(0) + opt.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9CA3AF',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
          <h3 style={{ margin: '0 0 8px', color: '#374151', fontSize: '18px' }}>No Bookings Found</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {filter === 'ALL' ? "You haven't made any reservation requests yet." : `No ${filter.toLowerCase()} reservations.`}
          </p>
        </div>
      )}

      {/* Reservation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        {filtered.map(r => (
          <div
            key={r.id}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '18px 20px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
              e.currentTarget.style.border = '2px solid #3B82F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.border = '1px solid #E5E7EB';
            }}
            onClick={() => setSelectedReservation(r)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
              {/* Left Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111827', fontFamily: 'Georgia, serif' }}>
                    {r.resourceName}
                  </h4>
                  <StatusBadge status={r.status} />
                  <span style={{
                    fontSize: '12px',
                    color: '#212836',
                    backgroundColor: '#F3F4F6',
                    padding: '18px 8px',
                    borderRadius: '10px',
                  }}>
                    #{r.id}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '100px' }}>
                  <InfoChip icon="• Resource: " label={r.resourceLocation} />
                  <InfoChip icon="• Date: " label={new Date(r.reservationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} />
                  <InfoChip icon="• Time: " label={`${formatTimeWithAMPM(r.startTime)} – ${formatTimeWithAMPM(r.endTime)}`} />
                  {r.expectedAttendees && <InfoChip icon="• Attendees: " label={r.expectedAttendees.toString()} />}
                </div>
                {r.purpose && (
                  <p style={{ margin: '10px 0 0', fontSize: '16px', color: '#162339', lineHeight: 1.5, fontFamily: 'Arial, sans-serif' }}>
                    • Purpose: {r.purpose.length > 80 ? r.purpose.slice(0, 80) + '...' : r.purpose}
                  </p>
                )}
                {(r.status === 'REJECTED' || r.status === 'CANCELLED') && r.adminReason && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#FEF2F2',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#991B1B',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    Reason: {r.adminReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                {canUpdateReservation(r) && onUpdateClick && (
                  <button
                    onClick={() => onUpdateClick(r)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#EFF6FF',
                      color: '#3B82F6',
                      border: '1px solid #93C5FD',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Update
                  </button>
                )}
                {r.status === 'APPROVED' && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    disabled={cancelling === r.id}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FCA5A5',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEE2E2';
                      e.currentTarget.style.borderColor = '#F87171';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                      e.currentTarget.style.borderColor = '#FCA5A5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {cancelling === r.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
                <span style={{ fontSize: '14px', color: '#0b1525', textAlign: 'right' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedReservation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedReservation(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6B7280',
              }}
              onClick={() => setSelectedReservation(null)}
            >
              ×
            </button>
            
            <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
              {selectedReservation.resourceName}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Status:</strong> {selectedReservation.status}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Location:</strong> {selectedReservation.resourceLocation}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Date:</strong> {new Date(selectedReservation.reservationDate).toLocaleDateString()}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Time:</strong> {formatTimeWithAMPM(selectedReservation.startTime)} – {formatTimeWithAMPM(selectedReservation.endTime)}
            </div>
            
            {selectedReservation.expectedAttendees && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#374151' }}>Attendees:</strong> {selectedReservation.expectedAttendees}
              </div>
            )}
            
            {selectedReservation.purpose && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#374151' }}>Purpose:</strong> {selectedReservation.purpose}
              </div>
            )}
            
            {selectedReservation.specialNotes && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#374151' }}>Special Requirements:</strong> {selectedReservation.specialNotes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoChip: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '16px', color: '#162339', fontFamily: 'Arial, sans-serif' }}>
    <span>{icon}</span>
    <span>{label}</span>
  </span>
);
