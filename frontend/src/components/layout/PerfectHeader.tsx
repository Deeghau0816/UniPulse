import React, { useState } from 'react';
import { 
  HomeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CogIcon,
  BellIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface PerfectHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userName?: string;
  userRole?: string;
}

export const PerfectHeader: React.FC<PerfectHeaderProps> = ({ 
  currentView, 
  onNavigate, 
  userName = 'John Doe',
  userRole = 'Student'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: HomeIcon },
    { name: 'Bookings', href: 'bookings', icon: CalendarIcon },
    { name: 'Resources', href: 'resources', icon: BuildingOfficeIcon },
    { name: 'Settings', href: 'settings', icon: CogIcon },
  ];

  const notifications = [
    { id: 1, title: 'Booking Approved', message: 'Your booking for Lecture Hall A has been approved', time: '2 hours ago', read: false },
    { id: 2, title: 'New Resource Available', message: 'Computer Lab 3 is now available for booking', time: '5 hours ago', read: false },
    { id: 3, title: 'Maintenance Notice', message: 'Meeting Room B will be under maintenance tomorrow', time: '1 day ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BuildingOfficeIcon className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">UniPulse</h1>
                  <p className="text-sm text-gray-500">Smart Campus Hub</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources, bookings, or help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => onNavigate(item.href)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      currentView === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4 ml-8">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200">
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="font-semibold text-gray-900">{userName}</div>
                    <div className="text-sm text-gray-500">{userRole}</div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <UserIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900 text-lg">{userName}</div>
                          <div className="text-sm text-gray-600">{userRole}</div>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Profile</span>
                      </button>
                      <button className="w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <CogIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Settings</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">UniPulse</h1>
                  <p className="text-xs text-gray-500">Smart Campus Hub</p>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-2">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="pb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-200">
              <nav className="py-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        onNavigate(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === item.href
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
              
              {/* Mobile Profile Section */}
              <div className="border-t border-gray-200 py-4">
                <div className="flex items-center px-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{userName}</div>
                    <div className="text-sm text-gray-500">{userRole}</div>
                  </div>
                </div>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <CogIcon className="w-4 h-4" />
                  Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
