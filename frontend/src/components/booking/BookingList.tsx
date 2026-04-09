import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import type { Booking, BookingFilters, Resource } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

interface BookingListProps {
  isAdmin?: boolean;
  userId?: string;
  onBookingSelect?: (booking: Booking) => void;
  onEditBooking?: (booking: Booking) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ 
  isAdmin = false, 
  userId, 
  onBookingSelect, 
  onEditBooking 
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookingFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [isAdmin, userId]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let data: Booking[];
      
      if (isAdmin) {
        data = await bookingApi.getBookings();
      } else if (userId) {
        data = await bookingApi.getUserBookings(userId);
      } else {
        data = [];
      }
      
      setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    if (filters.resourceType) {
      filtered = filtered.filter(booking => booking.resource.type === filters.resourceType);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(booking => booking.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(booking => booking.date <= filters.dateTo!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.resource.name.toLowerCase().includes(searchLower) ||
        booking.purpose.toLowerCase().includes(searchLower) ||
        booking.resource.location.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'CANCELLED':
        return '🚫';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'All Bookings' : 'My Bookings'}
        </h2>
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            {Object.values(filters).filter(v => v !== undefined && v !== '').length > 0 && (
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(v => v !== undefined && v !== '').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as Booking['status'] || undefined })}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <select
                value={filters.resourceType || ''}
                onChange={(e) => setFilters({ ...filters, resourceType: e.target.value as Resource['type'] || undefined })}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({})}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {filters.search || filters.status || filters.resourceType || filters.dateFrom || filters.dateTo
              ? 'Try adjusting your filters'
              : 'Get started by creating your first booking request'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onBookingSelect?.(booking)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.resource.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)} {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>{booking.expectedAttendees || 'Not specified'} attendees</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-700">
                      <strong>Purpose:</strong> {booking.purpose}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Location:</strong> {booking.resource.location}
                    </p>
                    {booking.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        <strong>Rejection Reason:</strong> {booking.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Created: {new Date(booking.createdAt).toLocaleString()}
                    {booking.updatedAt !== booking.createdAt && (
                      <span className="ml-4">
                        Updated: {new Date(booking.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle approve
                        }}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle reject
                        }}
                        className="btn-danger text-sm px-3 py-1"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {!isAdmin && booking.status === 'APPROVED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle cancel
                      }}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBooking?.(booking);
                    }}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
