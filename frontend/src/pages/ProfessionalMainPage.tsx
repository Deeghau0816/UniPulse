import React, { useState } from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ProfessionalHeader } from '../components/layout/ProfessionalHeader';
import { ProfessionalLanding } from '../components/landing/ProfessionalLanding';
import { EnhancedBookingForm } from '../components/booking/EnhancedBookingForm';
import { ModernBookingList } from '../components/booking/ModernBookingList';
import { BookingWorkflow } from '../components/booking/BookingWorkflow';
import { AdminBookingActions } from '../components/booking/AdminBookingActions';
import { ResourceBookingDashboard } from '../components/booking/ResourceBookingDashboard';
import type { Booking, BookingRequest, Resource } from '../types/booking';
import { bookingApi } from '../services/bookingApi';

type View = 'landing' | 'dashboard' | 'bookings' | 'create' | 'details' | 'resources';

interface ProfessionalMainPageProps {
  isAdmin?: boolean;
  userId?: string;
  userName?: string;
  userRole?: string;
}

export const ProfessionalMainPage: React.FC<ProfessionalMainPageProps> = ({ 
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
          <ProfessionalLanding
            onGetStarted={handleGetStarted}
            onResourceSelect={handleResourceSelect}
          />
        );

      case 'dashboard':
        return (
          <div className="professional-container py-8">
            <div className="mb-8">
              <h1 className="heading-premium-2 mb-4">Dashboard</h1>
              <p className="text-premium">
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
          <div className="professional-container py-8">
            <div className="mb-8">
              <h1 className="heading-premium-2 mb-4">All Resources</h1>
              <p className="text-premium">
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
          <div className="professional-container py-8">
            <div className="mb-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="heading-premium-2 mb-4">Create Booking</h1>
              <p className="text-premium">
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
          <div className="professional-container py-8">
            <div className="mb-8">
              <button
                onClick={() => setCurrentView('bookings')}
                className="text-blue-600 hover:text-blue-700 font-medium mb-4"
              >
                ← Back to Bookings
              </button>
              <h1 className="heading-premium-2 mb-4">Booking Details</h1>
              <p className="text-premium">
                Complete information about your booking request.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="professional-card p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="heading-premium-3 mb-2">Booking Information</h2>
                      <p className="text-premium-small">
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

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Resource Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-premium-small">Name</span>
                            <span className="font-medium">{selectedBooking.resource.name}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-premium-small">Type</span>
                            <span className="font-medium">{selectedBooking.resource.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-premium-small">Location</span>
                            <span className="font-medium">{selectedBooking.resource.location}</span>
                          </div>
                          {selectedBooking.resource.capacity && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-premium-small">Capacity</span>
                              <span className="font-medium">{selectedBooking.resource.capacity} people</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-premium-small">Date</span>
                            <span className="font-medium">
                              {new Date(selectedBooking.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-premium-small">Time</span>
                            <span className="font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                          </div>
                          {selectedBooking.expectedAttendees && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-premium-small">Expected Attendees</span>
                              <span className="font-medium">{selectedBooking.expectedAttendees}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Purpose</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-premium">{selectedBooking.purpose}</p>
                      </div>
                    </div>

                    {(selectedBooking as any).specialRequirements && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Special Requirements</h3>
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-premium">{(selectedBooking as any).specialRequirements}</p>
                        </div>
                      </div>
                    )}

                    {selectedBooking.rejectionReason && (
                      <div>
                        <h3 className="font-semibold text-red-900 mb-3">Rejection Reason</h3>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <p className="text-red-700">{selectedBooking.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <BookingWorkflow booking={selectedBooking} />
                
                <div className="professional-card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {!isAdmin && selectedBooking.status === 'APPROVED' && (
                      <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium">
                        Cancel Booking
                      </button>
                    )}
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium">
                      Download Receipt
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium">
                      Add to Calendar
                    </button>
                    <button 
                      onClick={() => setCurrentView('bookings')}
                      className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors font-medium"
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
          <div className="professional-container py-8">
            <div className="mb-8">
              <h1 className="heading-premium-2 mb-4">
                {isAdmin ? 'Booking Management' : 'My Bookings'}
              </h1>
              <p className="text-premium">
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
      <ProfessionalHeader
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as View)}
        userName={userName}
        userRole={userRole}
      />
      
      <main>
        {renderContent()}
      </main>

      {/* Professional Footer */}
      <footer className="footer-premium">
        <div className="professional-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <div className="ml-2">
                  <h3 className="font-bold text-white">UniPulse</h3>
                  <p className="text-xs text-gray-400">Smart Campus Hub</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming campus resource management with intelligent booking solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Bookings</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Resources</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">User Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">System Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">support@unipulse.edu</li>
                <li className="text-gray-400 text-sm">+1 (555) 123-4567</li>
                <li className="text-gray-400 text-sm">Campus IT Department</li>
                <li className="text-gray-400 text-sm">Room 123, Admin Building</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2026 Smart Campus Operations Hub. IT3030 - PAF Assignment.
              </p>
              <p className="text-gray-400 text-sm mt-2 md:mt-0">
                Member 2 Implementation - Enterprise-Grade Booking Management System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
