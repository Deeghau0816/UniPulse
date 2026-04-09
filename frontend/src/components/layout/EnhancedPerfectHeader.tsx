import React, { useState, useEffect } from 'react';
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
  MagnifyingGlassIcon,
  SparklesIcon,
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface EnhancedPerfectHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userName?: string;
  userRole?: string;
}

export const EnhancedPerfectHeader: React.FC<EnhancedPerfectHeaderProps> = ({ 
  currentView, 
  onNavigate, 
  userName = 'John Doe',
  userRole = 'Student'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: HomeIcon, description: 'Overview and stats' },
    { name: 'Bookings', href: 'bookings', icon: CalendarIcon, description: 'Manage bookings' },
    { name: 'Resources', href: 'resources', icon: BuildingOfficeIcon, description: 'Browse resources' },
    { name: 'Settings', href: 'settings', icon: CogIcon, description: 'Account settings' },
  ];

  const notifications = [
    { 
      id: 1, 
      title: 'Booking Approved', 
      message: 'Your booking for Lecture Hall A has been approved', 
      time: '2 hours ago', 
      read: false,
      type: 'success',
      icon: CheckCircleIcon
    },
    { 
      id: 2, 
      title: 'New Resource Available', 
      message: 'Computer Lab 3 is now available for booking', 
      time: '5 hours ago', 
      read: false,
      type: 'info',
      icon: ComputerDesktopIcon
    },
    { 
      id: 3, 
      title: 'Maintenance Notice', 
      message: 'Meeting Room B will be under maintenance tomorrow', 
      time: '1 day ago', 
      read: true,
      type: 'warning',
      icon: BuildingOfficeIcon
    },
  ];

  const quickActions = [
    { name: 'Quick Booking', href: 'create', icon: CalendarIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'View Schedule', href: 'bookings', icon: CalendarIcon, color: 'from-green-500 to-green-600' },
    { name: 'Resources', href: 'resources', icon: BuildingOfficeIcon, color: 'from-purple-500 to-purple-600' },
  ];

  const resourceTypes = [
    { name: 'Lecture Halls', icon: AcademicCapIcon, count: 12, color: 'blue' },
    { name: 'Labs', icon: BeakerIcon, count: 8, color: 'green' },
    { name: 'Meeting Rooms', icon: UserGroupIcon, count: 15, color: 'purple' },
    { name: 'Equipment', icon: ComputerDesktopIcon, count: 24, color: 'orange' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Desktop Header */}
      <header className={`hidden lg:block sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center group cursor-pointer" onClick={() => onNavigate('landing')}>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <BuildingOfficeIcon className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">UniPulse</h1>
                  <p className="text-sm text-gray-500">Smart Campus Hub</p>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search resources, bookings, or help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:bg-white group-hover:border-gray-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden xl:flex items-center space-x-2 mr-6">
              {quickActions.slice(0, 2).map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => onNavigate(action.href)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all duration-200`}
                  >
                    <Icon className="w-4 h-4" />
                    {action.name}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => onNavigate(item.href)}
                    className={`relative group px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-3 ml-6">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <span className="text-sm text-blue-600 font-medium">{unreadCount} new</span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <div key={notification.id} className={`p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notification.type === 'success' ? 'bg-green-100' :
                                notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  notification.type === 'success' ? 'text-green-600' :
                                  notification.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
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

                {/* Enhanced Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <UserIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900 text-lg">{userName}</div>
                          <div className="text-sm text-gray-600">{userRole}</div>
                          <div className="text-xs text-blue-600 mt-1">Premium Member</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900">24</div>
                          <div className="text-xs text-gray-500">Bookings</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">8</div>
                          <div className="text-xs text-gray-500">This Month</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">4.9</div>
                          <div className="text-xs text-gray-500">Rating</div>
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
                      <button className="w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <SparklesIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Upgrade Plan</span>
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

        {/* Resource Quick Access Bar */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-6">
                <span className="text-sm font-medium text-gray-600">Quick Access:</span>
                {resourceTypes.map((type, index) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => onNavigate('resources')}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{type.count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium text-green-600">System Status:</span> All systems operational
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Header */}
      <header className={`lg:hidden sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center group cursor-pointer" onClick={() => onNavigate('landing')}>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
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
              {/* Quick Actions */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          onNavigate(action.href);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${action.color} text-white`}
                      >
                        <Icon className="w-4 h-4" />
                        {action.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              
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
                      <div className="flex-1">
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
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
                    <div className="text-xs text-blue-600">Premium Member</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center px-4 mb-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900">24</div>
                    <div className="text-xs text-gray-500">Bookings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">8</div>
                    <div className="text-xs text-gray-500">This Month</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">4.9</div>
                    <div className="text-xs text-gray-500">Rating</div>
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
