import React, { useState } from 'react';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { BookingForm } from '../components/booking/BookingForm';
import { BookingList } from '../components/booking/BookingList';
import { BookingWorkflow } from '../components/booking/BookingWorkflow';
import { AdminBookingActions } from '../components/booking/AdminBookingActions';
import type { Booking, BookingRequest } from '../types/booking';
import { bookingApi } from '../services/bookingApi';

type View = 'list' | 'create' | 'details';

interface BookingPageProps {
  isAdmin?: boolean;
  userId?: string;
}

export const BookingPage: React.FC<BookingPageProps> = ({ isAdmin = false, userId }) => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateBooking = async (bookingData: BookingRequest) => {
    try {
      await bookingApi.createBooking(bookingData);
      setCurrentView('list');
      setRefreshKey(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  };

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setCurrentView('details');
  };

  const handleBookingUpdate = () => {
    setRefreshKey(prev => prev + 1);
    if (selectedBooking) {
      // Refresh the selected booking details
      bookingApi.getBookingById(selectedBooking.id).then(setSelectedBooking).catch(console.error);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <div>
            <button
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Bookings
            </button>
            <BookingForm
              onSubmit={handleCreateBooking}
              onCancel={() => setCurrentView('list')}
            />
          </div>
        );

      case 'details':
        if (!selectedBooking) return null;

        return (
          <div>
            <button
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Bookings
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                    {isAdmin && (
                      <AdminBookingActions
                        booking={selectedBooking}
                        onUpdate={handleBookingUpdate}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedBooking.resource.name}</h3>
                      <p className="text-gray-600">{selectedBooking.resource.type.replace('_', ' ')}</p>
                      <p className="text-gray-600">{selectedBooking.resource.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <p className="text-gray-600">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Time:</span>
                        <p className="text-gray-600">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                      </div>
                    </div>

                    {selectedBooking.expectedAttendees && (
                      <div>
                        <span className="font-medium text-gray-700">Expected Attendees:</span>
                        <p className="text-gray-600">{selectedBooking.expectedAttendees}</p>
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-gray-700">Purpose:</span>
                      <p className="text-gray-600 mt-1">{selectedBooking.purpose}</p>
                    </div>

                    {selectedBooking.rejectionReason && (
                      <div>
                        <span className="font-medium text-gray-700">Rejection Reason:</span>
                        <p className="text-red-600 mt-1 bg-red-50 p-3 rounded">{selectedBooking.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Workflow Sidebar */}
              <div>
                <BookingWorkflow booking={selectedBooking} />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Booking Management' : 'My Bookings'}
              </h1>
              {!isAdmin && (
                <button
                  onClick={() => setCurrentView('create')}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  New Booking
                </button>
              )}
            </div>

            <BookingList
              key={refreshKey}
              isAdmin={isAdmin}
              userId={userId}
              onBookingSelect={handleBookingSelect}
              onEditBooking={handleBookingSelect}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};
