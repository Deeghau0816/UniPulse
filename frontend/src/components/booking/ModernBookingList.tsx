import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import type { Booking, BookingFilters, Resource } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

interface ModernBookingListProps {
  isAdmin?: boolean;
  userId?: string;
  onBookingSelect?: (booking: Booking) => void;
  onEditBooking?: (booking: Booking) => void;
}

const resourceTypeConfig = {
  LECTURE_HALL: { icon: AcademicCapIcon, color: 'blue', label: 'Lecture Hall' },
  LAB: { icon: BeakerIcon, color: 'green', label: 'Laboratory' },
  MEETING_ROOM: { icon: UserGroupIcon, color: 'purple', label: 'Meeting Room' },
  EQUIPMENT: { icon: ComputerDesktopIcon, color: 'orange', label: 'Equipment' }
};

const statusConfig = {
  PENDING: { 
    icon: PendingIcon, 
    color: 'yellow', 
    label: 'Pending',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  APPROVED: { 
    icon: CheckCircleIcon, 
    color: 'green', 
    label: 'Approved',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  REJECTED: { 
    icon: XCircleIcon, 
    color: 'red', 
    label: 'Rejected',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  },
  CANCELLED: { 
    icon: XMarkIcon, 
    color: 'gray', 
    label: 'Cancelled',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200'
  }
};

export const ModernBookingList: React.FC<ModernBookingListProps> = ({ 
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [isAdmin, userId]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters, searchTerm]);

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

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.resource.name.toLowerCase().includes(searchLower) ||
        booking.purpose.toLowerCase().includes(searchLower) ||
        booking.resource.location.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status: Booking['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getResourceBadge = (resource: Resource) => {
    const config = resourceTypeConfig[resource.type];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Booking Management' : 'My Bookings'}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
          </p>
        </div>
        
        {!isAdmin && (
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Create New Booking
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by resource, purpose, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            {(Object.values(filters).filter(v => v !== undefined && v !== '').length > 0 || searchTerm) && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(v => v !== undefined && v !== '').length + (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as Booking['status'] || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Laboratory</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {searchTerm || Object.values(filters).filter(v => v !== undefined && v !== '').length > 0
              ? 'Try adjusting your search or filters'
              : isAdmin 
                ? 'No bookings have been created yet'
                : 'Get started by creating your first booking request'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => onBookingSelect?.(booking)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {booking.resource.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getResourceBadge(booking.resource)}
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBooking?.(booking);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle approve
                        }}
                        className="p-2 text-green-600 hover:text-green-700 transition-colors"
                        title="Approve"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle reject
                        }}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        title="Reject"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {new Date(booking.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{booking.startTime} - {booking.endTime}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {booking.expectedAttendees || 'Not specified'} attendees
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {booking.resource.location}
                </div>
              </div>

              {/* Purpose */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-700 line-clamp-2">
                  <span className="font-medium">Purpose:</span> {booking.purpose}
                </p>
              </div>

              {/* Rejection Reason */}
              {booking.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Rejection Reason:</span> {booking.rejectionReason}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created: {new Date(booking.createdAt).toLocaleDateString()}
                </div>
                {booking.updatedAt !== booking.createdAt && (
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(booking.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
