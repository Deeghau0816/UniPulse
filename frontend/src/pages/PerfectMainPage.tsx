import React, { useState } from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { EnhancedPerfectHeader } from '../components/layout/EnhancedPerfectHeader';
import { PerfectLanding } from '../components/landing/PerfectLanding';
import { EnhancedBookingForm } from '../components/booking/EnhancedBookingForm';
import { ModernBookingList } from '../components/booking/ModernBookingList';
import { BookingWorkflow } from '../components/booking/BookingWorkflow';
import { AdminBookingActions } from '../components/booking/AdminBookingActions';
import { ResourceBookingDashboard } from '../components/booking/ResourceBookingDashboard';
import type { Booking, BookingRequest, Resource } from '../types/booking';
import { bookingApi } from '../services/bookingApi';

type View = 'landing' | 'dashboard' | 'bookings' | 'create' | 'details' | 'resources';

interface PerfectMainPageProps {
  isAdmin?: boolean;
  userId?: string;
  userName?: string;
  userRole?: string;
}

export const PerfectMainPage: React.FC<PerfectMainPageProps> = ({ 
  isAdmin = false, 
  userId = 'user-123',
  userName = 'John Doe',
  userRole = 'Student'
}) => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateBooking = async (bookingData: BookingRequest) => {
    try {
      await bookingApi.createBooking(bookingData);
      setCurrentView('bookings');
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

  const handleBookingUpdate = () => {
    setRefreshKey(prev => prev + 1);
    if (selectedBooking) {
      bookingApi.getBookingById(selectedBooking.id).then(setSelectedBooking).catch(console.error);
    }
  };

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return (
          <PerfectLanding
            onGetStarted={handleGetStarted}
            onResourceSelect={handleResourceSelect}
          />
        );

      case 'dashboard':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
              <p className="text-xl text-gray-600">
                Welcome back, {userName}! Here's an overview of your booking activity.
              </p>
            </div>
            <ResourceBookingDashboard
              onResourceSelect={handleResourceSelect}
              onQuickBook={handleResourceSelect}
            />
          </div>
        );

      case 'resources':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">All Resources</h1>
              <p className="text-xl text-gray-600">
                Browse and book from our complete range of campus facilities.
              </p>
            </div>
            <ResourceBookingDashboard
              onResourceSelect={handleResourceSelect}
              onQuickBook={handleResourceSelect}
            />
          </div>
        );

      case 'create':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Booking</h1>
              <p className="text-xl text-gray-600">
                Fill in the details below to create a new booking request.
              </p>
            </div>
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
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <button
                onClick={() => setCurrentView('bookings')}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center"
              >
                ← Back to Bookings
              </button>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Details</h1>
              <p className="text-xl text-gray-600">
                Complete information about your booking request.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Information</h2>
                      <p className="text-gray-600">
                        Reference: #{selectedBooking.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    {isAdmin && (
                      <AdminBookingActions
                        booking={selectedBooking}
                        onUpdate={handleBookingUpdate}
                      />
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Details</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Name</span>
                            <span className="font-semibold text-gray-900">{selectedBooking.resource.name}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Type</span>
                            <span className="font-semibold text-gray-900">{selectedBooking.resource.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Location</span>
                            <span className="font-semibold text-gray-900">{selectedBooking.resource.location}</span>
                          </div>
                          {selectedBooking.resource.capacity && (
                            <div className="flex justify-between py-3 border-b border-gray-200">
                              <span className="text-gray-600 font-medium">Capacity</span>
                              <span className="font-semibold text-gray-900">{selectedBooking.resource.capacity} people</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Date</span>
                            <span className="font-semibold text-gray-900">
                              {new Date(selectedBooking.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Time</span>
                            <span className="font-semibold text-gray-900">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                          </div>
                          {selectedBooking.expectedAttendees && (
                            <div className="flex justify-between py-3 border-b border-gray-200">
                              <span className="text-gray-600 font-medium">Expected Attendees</span>
                              <span className="font-semibold text-gray-900">{selectedBooking.expectedAttendees}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Purpose</h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <p className="text-gray-700 leading-relaxed">{selectedBooking.purpose}</p>
                      </div>
                    </div>

                    {(selectedBooking as any).specialRequirements && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                          <p className="text-blue-700 leading-relaxed">{(selectedBooking as any).specialRequirements}</p>
                        </div>
                      </div>
                    )}

                    {selectedBooking.rejectionReason && (
                      <div>
                        <h3 className="text-lg font-semibold text-red-900 mb-4">Rejection Reason</h3>
                        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                          <p className="text-red-700 leading-relaxed">{selectedBooking.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <BookingWorkflow booking={selectedBooking} />
                
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    {!isAdmin && selectedBooking.status === 'APPROVED' && (
                      <button className="btn btn-secondary w-full text-left">
                        Cancel Booking
                      </button>
                    )}
                    <button className="btn btn-secondary w-full text-left">
                      Download Receipt
                    </button>
                    <button className="btn btn-secondary w-full text-left">
                      Add to Calendar
                    </button>
                    <button 
                      onClick={() => setCurrentView('bookings')}
                      className="btn btn-primary w-full"
                    >
                      View All Bookings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default: // bookings
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {isAdmin ? 'Booking Management' : 'My Bookings'}
              </h1>
              <p className="text-xl text-gray-600">
                {isAdmin 
                  ? 'Manage and review all booking requests across the campus.'
                  : 'View and manage your current and past booking requests.'
                }
              </p>
            </div>
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
      <EnhancedPerfectHeader
        currentView={currentView}
        onNavigate={(view: string) => setCurrentView(view as View)}
        userName={userName}
        userRole={userRole}
      />
      
      <main>
        {renderContent()}
      </main>

      {/* Perfect Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-xl text-white">UniPulse</h3>
                  <p className="text-sm text-gray-400">Smart Campus Hub</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transforming campus resource management with intelligent booking solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bookings</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Resources</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">User Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">System Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6">Contact</h4>
              <ul className="space-y-3">
                <li className="text-gray-400">support@unipulse.edu</li>
                <li className="text-gray-400">+1 (555) 123-4567</li>
                <li className="text-gray-400">Campus IT Department</li>
                <li className="text-gray-400">Room 123, Admin Building</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2026 Smart Campus Operations Hub. IT3030 - PAF Assignment.
              </p>
              <p className="text-gray-400 text-sm mt-4 md:mt-0">
                Member 2 Implementation - Perfect Alignment & Professional Design
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
