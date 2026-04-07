import React, { useState } from 'react';
import { CheckCircleIcon, XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

interface AdminBookingActionsProps {
  booking: Booking;
  onUpdate: () => void;
}

export const AdminBookingActions: React.FC<AdminBookingActionsProps> = ({ booking, onUpdate }) => {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this booking?')) return;

    try {
      setLoading('approve');
      await bookingApi.approveBooking(booking.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking. Please try again.');
    } finally {
      setLoading('approve');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      setLoading('reject');
      await bookingApi.rejectBooking(booking.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      onUpdate();
    } catch (error) {
      console.error('Failed to reject booking:', error);
      alert('Failed to reject booking. Please try again.');
    } finally {
      setLoading('reject');
    }
  };

  if (booking.status !== 'PENDING') {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading === 'approve'}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          <CheckCircleIcon className="h-4 w-4" />
          {loading === 'approve' ? 'Approving...' : 'Approve'}
        </button>
        
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading === 'reject'}
          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          <XMarkIcon className="h-4 w-4" />
          {loading === 'reject' ? 'Rejecting...' : 'Reject'}
        </button>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <ChatBubbleLeftIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Booking</h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Booking for: <strong>{booking.resource.name}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Date: <strong>{new Date(booking.date).toLocaleDateString()}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Time: <strong>{booking.startTime} - {booking.endTime}</strong>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="input-field"
                placeholder="Please explain why this booking is being rejected..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={loading === 'reject' || !rejectionReason.trim()}
                className="btn-danger flex-1 disabled:opacity-50"
              >
                {loading === 'reject' ? 'Rejecting...' : 'Reject Booking'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
