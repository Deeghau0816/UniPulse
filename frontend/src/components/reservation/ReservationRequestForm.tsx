import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/reservationService';
import { resourceService } from '../../services/resourceService';
import type { ReservationRequest, ResourceType, ReservationRecord } from '../../types/reservation';
import type { ResourceResponse } from '../../services/resourceService';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useToast } from '../shared/Toast';

interface ReservationRequestFormProps {
  onSuccess?: () => void;
  userId: string;
  userName?: string;
  initialData?: ReservationRecord;
  isUpdate?: boolean;
  initialResourceId?: number;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  fontSize: '16px',
  color: '#424242',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxSizing: 'border-box',
  fontFamily: 'Roboto, sans-serif',
  transform: 'translateZ(0)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '16px',
  fontWeight: 600,
  color: '#161d2a',
  marginBottom: '6px',
  fontFamily: 'Arial, sans-serif',
};

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const errorStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#EF4444',
  marginTop: '4px',
};


const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#3B82F6';
  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
};

const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#D1D5DB';
  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  e.currentTarget.style.transform = 'translateZ(0)';
};

const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
};

const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = 'translateZ(0)';
  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
};

export const ReservationRequestForm: React.FC<ReservationRequestFormProps> = ({
  onSuccess,
  userId,
  userName,
  initialData,
  isUpdate = false,
  initialResourceId,
}) => {
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [filtered, setFiltered] = useState<ResourceResponse[]>([]);
  const [selectedType, setSelectedType] = useState<ResourceType | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const { showToast, ToastRenderer } = useToast();

  // Calculate remaining time for updates
  useEffect(() => {
    if (isUpdate && initialData) {
      const calculateRemainingTime = () => {
        const now = new Date();
        const createdAt = new Date(initialData.createdAt);
        const twoHoursInMs = 2 * 60 * 60 * 1000;
        const timeDiff = twoHoursInMs - (now.getTime() - createdAt.getTime());
        
        if (timeDiff <= 0) {
          setIsExpired(true);
          setRemainingTime('Expired');
        } else {
          const hours = Math.floor(timeDiff / (60 * 60 * 1000));
          const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
          const seconds = Math.floor((timeDiff % (60 * 1000)) / 1000);
          
          setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
          setIsExpired(false);
        }
      };

      calculateRemainingTime();
      const interval = setInterval(calculateRemainingTime, 1000);

      return () => clearInterval(interval);
    }
  }, [isUpdate, initialData]);

  const [form, setForm] = useState<Partial<ReservationRequest>>({
    userId,
    userName,
    reservationDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    specialNotes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictMessage, setConflictMessage] = useState('');

  useEffect(() => {
    resourceService.getAllResources()
      .then(setResources)
      .catch(() => showToast('Failed to load resources', 'error'))
      .finally(() => setLoadingResources(false));
  }, []);

  useEffect(() => {
    if (selectedType) {
      setFiltered(resources.filter(r => r.type === selectedType && r.status === 'ACTIVE'));
    } else {
      setFiltered(resources.filter(r => r.status === 'ACTIVE'));
    }
    setForm(prev => ({ ...prev, resourceId: undefined }));
  }, [selectedType, resources]);

  // Pre-fill form with initial data when provided
  useEffect(() => {
    if (initialData && isUpdate) {
      setForm({
        userId,
        userName,
        resourceId: initialData.resourceId,
        reservationDate: initialData.reservationDate,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        purpose: initialData.purpose,
        specialNotes: initialData.specialNotes || '',
        expectedAttendees: initialData.expectedAttendees,
      });

      // Set the resource type based on the initial resource
      const resource = resources.find(r => r.id === initialData.resourceId);
      if (resource) {
        setSelectedType(resource.type);
      }
    }
  }, [initialData, isUpdate, resources, userId, userName]);

  // Pre-select resource when initialResourceId is provided (for new bookings from browse page)
  useEffect(() => {
    if (initialResourceId && !isUpdate && resources.length > 0) {
      const resource = resources.find(r => r.id === initialResourceId);
      if (resource) {
        setSelectedType(resource.type);
        setForm(prev => ({ ...prev, resourceId: initialResourceId }));
      }
    }
  }, [initialResourceId, isUpdate, resources]);

  const resourceTypeLabels: Record<ResourceType, string> = {
    LECTURE_HALL: 'Lecture Hall',
    LAB: 'Laboratory',
    MEETING_ROOM: 'Meeting Room',
    EQUIPMENT: 'Equipment',
  };

  const today = new Date().toISOString().split('T')[0];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedType) errs.selectedType = 'Please select a resource type';
    if (!form.resourceId) errs.resourceId = 'Please select a resource';
    if (!form.reservationDate) errs.reservationDate = 'Date is required';
    else if (form.reservationDate < today) errs.reservationDate = 'Cannot select a past date';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    else if (form.startTime && form.endTime && form.endTime <= form.startTime)
      errs.endTime = 'End time must be after start time';
    
    // Time validation: must be between 7:00 AM and 8:00 PM
    const isValidTime = (time: string): boolean => {
      if (!time) return false;
      const [hours, minutes] = time.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const minMinutes = 7 * 60; // 7:00 AM = 420 minutes
      const maxMinutes = 20 * 60; // 8:00 PM = 1200 minutes
      return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
    };
    
    if (form.startTime && !isValidTime(form.startTime)) {
      errs.startTime = 'Time must be between 7:00 AM and 8:00 PM';
    }
    
    if (form.endTime && !isValidTime(form.endTime)) {
      errs.endTime = 'Time must be between 7:00 AM and 8:00 PM';
    }
    
    if (!form.expectedAttendees || form.expectedAttendees < 1)
      errs.expectedAttendees = 'Expected attendees is required';
    if (!form.purpose || form.purpose.trim().length < 10)
      errs.purpose = 'Purpose must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMessage('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isUpdate && initialData) {
        await reservationService.update(initialData.id, form as ReservationRequest);
        showToast('Reservation updated successfully!', 'success');
      } else {
        await reservationService.create(form as ReservationRequest);
        showToast('Reservation request submitted successfully!', 'success');
      }
      
      if (!isUpdate) {
        setForm({ userId, userName, reservationDate: '', startTime: '', endTime: '', purpose: '', specialNotes: '' });
        setSelectedType('');
      }
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit request';
      if (msg.toLowerCase().includes('conflict')) {
        setConflictMessage(msg);
        showToast('⚠️ Scheduling conflict detected!', 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingResources) return <LoadingSpinner message="Loading resources..." />;

  return (
    <div>
      {ToastRenderer}
      <form onSubmit={handleSubmit} style={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '40px',
  maxWidth: '900px',
  margin: '0 auto'
}}>
        {isUpdate && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: isExpired ? '#FEF2F2' : '#EFF6FF',
            border: `1px solid ${isExpired ? '#FCA5A5' : '#93C5FD'}`,
            borderRadius: '12px',
            color: isExpired ? '#991B1B' : '#1E40AF',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>Updating Booking #{initialData?.id}</span>
              {!isExpired && (
                <span style={{ 
                  backgroundColor: '#DBEAFE', 
                  color: '#1E40AF', 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'monospace'
                }}>
                  {remainingTime} remaining
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>
              {isExpired ? (
                <span> 
                  <span style={{ fontSize: '16px', marginRight: '6px' }}>×</span>
                  Update window has expired. You can only update bookings within 2 hours of submission.
                </span>
              ) : (
                <span>
                  <span style={{ fontSize: '16px', marginRight: '6px' }}>!</span>
                  You can update this booking within 2 hours of submission. After that, updates will be disabled.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Conflict Warning */}
        {conflictMessage && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #EF4444',
            borderLeft: '4px solid #EF4444',
            borderRadius: '8px',
            color: '#991B1B',
            fontSize: '14px',
          }}>
            ⚠️ <strong>Conflict Detected:</strong> {conflictMessage}
          </div>
        )}

        {/* Resource Type */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Resource Type <span style={{ color: '#EF4444' }}>*</span></label>
          <select
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value as ResourceType | '');
              // Clear resource type error when user makes a selection
              if (errors.selectedType) {
                setErrors(prev => ({ ...prev, selectedType: '' }));
              }
            }}
            style={{...inputStyle, opacity: (isUpdate && isExpired) ? 0.6 : 1}}
            disabled={isUpdate && isExpired}
            onFocus={!isExpired ? handleInputFocus : undefined}
            onBlur={!isExpired ? handleInputBlur : undefined}
          >
            <option value="">— All Types —</option>
            {(Object.keys(resourceTypeLabels) as ResourceType[]).map(type => (
              <option key={type} value={type}>{resourceTypeLabels[type]}</option>
            ))}
          </select>
          {errors.selectedType && <span style={errorStyle}>{errors.selectedType}</span>}
        </div>

        {/* Resource Selection */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Select Resource <span style={{ color: '#EF4444' }}>*</span></label>
          <select
            value={form.resourceId || ''}
            onChange={e => setForm(prev => ({ ...prev, resourceId: Number(e.target.value) || undefined }))}
            style={{ ...inputStyle, borderColor: errors.resourceId ? '#EF4444' : '#D1D5DB', opacity: (isUpdate && isExpired) ? 0.6 : 1 }}
            disabled={isUpdate && isExpired}
            onFocus={!isExpired ? handleInputFocus : undefined}
            onBlur={!isExpired ? handleInputBlur : undefined}
          >
            <option value="">Choose a resource...</option>
            {filtered.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} – {r.location}{r.capacity ? ` (Cap: ${r.capacity})` : ''}
              </option>
            ))}
          </select>
          {errors.resourceId && <span style={errorStyle}>{errors.resourceId}</span>}
        </div>

        {/* Date + Times Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Date <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="date"
              min={today}
              value={form.reservationDate || ''}
              onChange={e => setForm(prev => ({ ...prev, reservationDate: e.target.value }))}
              style={{ ...inputStyle, borderColor: errors.reservationDate ? '#EF4444' : '#D1D5DB', opacity: (isUpdate && isExpired) ? 0.6 : 1 }}
              disabled={isUpdate && isExpired}
              onFocus={!isExpired ? handleInputFocus : undefined}
              onBlur={!isExpired ? handleInputBlur : undefined}
            />
            {errors.reservationDate && <span style={errorStyle}>{errors.reservationDate}</span>}
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Start Time <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="time"
              min="07:00"
              max="20:00"
              value={form.startTime || ''}
              onChange={e => {
                const target = e.target as HTMLInputElement;
                setForm(prev => ({ ...prev, startTime: target.value }));
                // Clear browser validation error
                target.setCustomValidity('');
                // Clear our error when user changes the value
                if (errors.startTime) {
                  setErrors(prev => ({ ...prev, startTime: '' }));
                }
              }}
              onInvalid={e => {
                const target = e.target as HTMLInputElement;
                target.setCustomValidity('Time must be between 7:00 AM and 8:00 PM');
              }}
              style={{ ...inputStyle, borderColor: errors.startTime ? '#EF4444' : '#D1D5DB', opacity: (isUpdate && isExpired) ? 0.6 : 1 }}
              disabled={isUpdate && isExpired}
              onFocus={!isExpired ? handleInputFocus : undefined}
              onBlur={!isExpired ? handleInputBlur : undefined}
            />
            {errors.startTime && <span style={errorStyle}>{errors.startTime}</span>}
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>End Time <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="time"
              min="07:00"
              max="20:00"
              value={form.endTime || ''}
              onChange={e => {
                const target = e.target as HTMLInputElement;
                setForm(prev => ({ ...prev, endTime: target.value }));
                // Clear browser validation error
                target.setCustomValidity('');
                // Clear our error when user changes the value
                if (errors.endTime) {
                  setErrors(prev => ({ ...prev, endTime: '' }));
                }
              }}
              onInvalid={e => {
                const target = e.target as HTMLInputElement;
                target.setCustomValidity('Time must be between 7:00 AM and 8:00 PM');
              }}
              style={{ ...inputStyle, borderColor: errors.endTime ? '#EF4444' : '#D1D5DB', opacity: (isUpdate && isExpired) ? 0.6 : 1 }}
              disabled={isUpdate && isExpired}
              onFocus={!isExpired ? handleInputFocus : undefined}
              onBlur={!isExpired ? handleInputBlur : undefined}
            />
            {errors.endTime && <span style={errorStyle}>{errors.endTime}</span>}
          </div>
        </div>

        {/* Attendees + Special Requirements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Expected Attendees <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="number"
              min="1"
              placeholder="Number of attendees"
              value={form.expectedAttendees || ''}
              onChange={e => setForm(prev => ({
                ...prev,
                expectedAttendees: e.target.value ? Number(e.target.value) : undefined,
              }))}
              style={{ ...inputStyle, borderColor: errors.expectedAttendees ? '#EF4444' : '#D1D5DB', opacity: (isUpdate && isExpired) ? 0.6 : 1 }}
              disabled={isUpdate && isExpired}
              onFocus={!isExpired ? handleInputFocus : undefined}
              onBlur={!isExpired ? handleInputBlur : undefined}
            />
            {errors.expectedAttendees && <span style={errorStyle}>{errors.expectedAttendees}</span>}
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Special Requirements <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span></label>
            <input
              type="text"
              placeholder="Any special equipment or arrangements needed"
              value={form.specialNotes || ''}
              onChange={e => setForm(prev => ({ ...prev, specialNotes: e.target.value }))}
              style={{...inputStyle, opacity: (isUpdate && isExpired) ? 0.6 : 1}}
              disabled={isUpdate && isExpired}
              onFocus={!isExpired ? handleInputFocus : undefined}
              onBlur={!isExpired ? handleInputBlur : undefined}
            />
          </div>
        </div>

        {/* Purpose */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Purpose of Reservation <span style={{ color: '#EF4444' }}>*</span></label>
          <textarea
            placeholder="Please describe the purpose of this reservation in detail..."
            value={form.purpose || ''}
            onChange={e => setForm(prev => ({ ...prev, purpose: e.target.value }))}
            rows={4}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '100px',
              borderColor: errors.purpose ? '#EF4444' : '#D1D5DB',
              opacity: (isUpdate && isExpired) ? 0.6 : 1,
            }}
            disabled={isUpdate && isExpired}
            onFocus={!isExpired ? handleInputFocus : undefined}
            onBlur={!isExpired ? handleInputBlur : undefined}
          />
          {errors.purpose && <span style={errorStyle}>{errors.purpose}</span>}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '28px', paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={submitting || (isUpdate && isExpired)}
            style={{
              flex: 1,
              padding: '13px 24px',
              backgroundColor: (submitting || (isUpdate && isExpired)) ? '#fb923c' : '#ea580c',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: (submitting || (isUpdate && isExpired)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateZ(0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
          >
            {submitting ? 'Submitting...' : (isUpdate ? 'Update Booking Request' : 'Submit Booking Request')}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm({ userId, userName, reservationDate: '', startTime: '', endTime: '', purpose: '', specialNotes: '' });
              setSelectedType('');
              setErrors({});
              setConflictMessage('');
            }}
            style={{
              padding: '13px 20px',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateZ(0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
          >
            Clear All
          </button>
        </div>
      </form>
    </div>
  );
};
