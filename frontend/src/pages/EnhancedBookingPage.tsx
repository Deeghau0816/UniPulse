import React, { useState } from 'react';
import { 
  PlusIcon, 
  HomeIcon,
  CalendarIcon,
  CogIcon,
  BellIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { EnhancedBookingForm } from '../components/booking/EnhancedBookingForm';
import { ModernBookingList } from '../components/booking/ModernBookingList';
import { BookingWorkflow } from '../components/booking/BookingWorkflow';
import { AdminBookingActions } from '../components/booking/AdminBookingActions';
import { ResourceBookingDashboard } from '../components/booking/ResourceBookingDashboard';
import type { Booking, BookingRequest, Resource } from '../types/booking';
import { bookingApi } from '../services/bookingApi';

type View = 'dashboard' | 'list' | 'create' | 'details';

interface EnhancedBookingPageProps {
  isAdmin?: boolean;
  userId?: string;
}

export const EnhancedBookingPage: React.FC<EnhancedBookingPageProps> = ({ 
  isAdmin = false, 
  userId 
}) => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateBooking = async (bookingData: BookingRequest) => {
    try {
      await bookingApi.createBooking(bookingData);
      setCurrentView('list');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  };

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setCurrentView('details');
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    setCurrentView('create');
  };

  const handleQuickBook = (resource: Resource) => {
    setSelectedResource(resource);
    setCurrentView('create');
  };

  const handleBookingUpdate = () => {
    setRefreshKey(prev => prev + 1);
    if (selectedBooking) {
      bookingApi.getBookingById(selectedBooking.id).then(setSelectedBooking).catch(console.error);
    }
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = [];
    
    if (currentView === 'dashboard') {
      breadcrumbs.push({ label: 'Dashboard', current: true });
    } else {
      breadcrumbs.push({ label: 'Dashboard', current: false });
      
      if (currentView === 'list') {
        breadcrumbs.push({ label: isAdmin ? 'All Bookings' : 'My Bookings', current: true });
      } else if (currentView === 'create') {
        breadcrumbs.push({ label: 'Create Booking', current: true });
      } else if (currentView === 'details') {
        breadcrumbs.push({ label: isAdmin ? 'All Bookings' : 'My Bookings', current: false });
        breadcrumbs.push({ label: 'Booking Details', current: true });
      }
    }

    return (
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <button
                onClick={() => {
                  if (crumb.label === 'Dashboard') setCurrentView('dashboard');
                  else if (crumb.label === 'All Bookings' || crumb.label === 'My Bookings') setCurrentView('list');
                }}
                className={`text-sm font-medium ${
                  crumb.current
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {crumb.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ResourceBookingDashboard
            onResourceSelect={handleResourceSelect}
            onQuickBook={handleQuickBook}
          />
        );

      case 'create':
        return (
          <div>
            {renderBreadcrumbs()}
            <EnhancedBookingForm
              resource={selectedResource || undefined}
              onSubmit={handleCreateBooking}
              onCancel={() => setCurrentView('dashboard')}
            />
          </div>
        );

      case 'details':
        if (!selectedBooking) return null;

        return (
          <div>
            {renderBreadcrumbs()}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h2>
                      <p className="text-gray-600">
                        Complete information about your booking request
                      </p>
                    </div>
                    {isAdmin && (
                      <AdminBookingActions
                        booking={selectedBooking}
                        onUpdate={handleBookingUpdate}
                      />
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Resource Information</h3>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Name:</span> {selectedBooking.resource.name}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Type:</span> {selectedBooking.resource.type.replace('_', ' ')}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Location:</span> {selectedBooking.resource.location}
                          </p>
                          {selectedBooking.resource.capacity && (
                            <p className="text-gray-700">
                              <span className="font-medium">Capacity:</span> {selectedBooking.resource.capacity} people
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Schedule Information</h3>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Date:</span> {new Date(selectedBooking.date).toLocaleDateString()}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Time:</span> {selectedBooking.startTime} - {selectedBooking.endTime}
                          </p>
                          {selectedBooking.expectedAttendees && (
                            <p className="text-gray-700">
                              <span className="font-medium">Expected Attendees:</span> {selectedBooking.expectedAttendees}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Purpose</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {selectedBooking.purpose}
                      </p>
                    </div>

                    {selectedBooking.rejectionReason && (
                      <div>
                        <h3 className="font-semibold text-red-900 mb-3">Rejection Reason</h3>
                        <p className="text-red-700 bg-red-50 p-4 rounded-lg">
                          {selectedBooking.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <BookingWorkflow booking={selectedBooking} />
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {!isAdmin && selectedBooking.status === 'APPROVED' && (
                      <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        Cancel Booking
                      </button>
                    )}
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      Download Receipt
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      Add to Calendar
                    </button>
                    <button 
                      onClick={() => setCurrentView('list')}
                      className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                    >
                      View All Bookings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            {renderBreadcrumbs()}
            <ModernBookingList
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
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  currentView === 'dashboard'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Dashboard
              </button>
              
              <button
                onClick={() => setCurrentView('list')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  currentView === 'list'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CalendarIcon className="w-5 h-5 mr-2" />
                My Bookings
              </button>

              {!isAdmin && (
                <button
                  onClick={() => {
                    setSelectedResource(null);
                    setCurrentView('create');
                  }}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'create'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  New Booking
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <BellIcon className="w-6 h-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <CogIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2026 Smart Campus Operations Hub. IT3030 - PAF Assignment.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Member 2 Implementation - Advanced Booking Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
