import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  UserGroupIcon, 
  ComputerDesktopIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import type { Resource } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

interface ResourceBookingDashboardProps {
  onResourceSelect: (resource: Resource) => void;
  onQuickBook: (resource: Resource) => void;
}

export const ResourceBookingDashboard: React.FC<ResourceBookingDashboardProps> = ({ 
  onResourceSelect, 
  onQuickBook 
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await bookingApi.getResources();
      setResources(data.filter(resource => resource.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const resourceCategories = [
    {
      id: 'all',
      name: 'All Resources',
      icon: SparklesIcon,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      description: 'Browse all available resources'
    },
    {
      id: 'LECTURE_HALL',
      name: 'Lecture Halls',
      icon: AcademicCapIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Large spaces for lectures and presentations'
    },
    {
      id: 'LAB',
      name: 'Laboratories',
      icon: BeakerIcon,
      color: 'bg-gradient-to-r from-green-500 to-teal-600',
      description: 'Equipped labs for practical sessions'
    },
    {
      id: 'MEETING_ROOM',
      name: 'Meeting Rooms',
      icon: UserGroupIcon,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      description: 'Conference rooms for meetings'
    },
    {
      id: 'EQUIPMENT',
      name: 'Equipment',
      icon: ComputerDesktopIcon,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      description: 'Technical equipment and devices'
    }
  ];

  const filteredResources = selectedFilter === 'all' 
    ? resources 
    : resources.filter(resource => resource.type === selectedFilter);

  const getResourceStats = (type: string) => {
    const typeResources = resources.filter(r => r.type === type);
    const totalCapacity = typeResources.reduce((sum, r) => sum + (r.capacity || 0), 0);
    return {
      count: typeResources.length,
      capacity: totalCapacity
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Smart Campus Booking System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Reserve lecture halls, laboratories, meeting rooms, and equipment for your academic needs. 
          Our modern booking system ensures seamless resource management.
        </p>
      </div>

      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {resourceCategories.map((category) => {
          const Icon = category.icon;
          const stats = getResourceStats(category.id);
          const isSelected = selectedFilter === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedFilter(category.id)}
              className={`
                relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105
                ${isSelected 
                  ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-2xl' 
                  : 'shadow-lg hover:shadow-xl'
                }
              `}
              style={{
                background: isSelected 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'white'
              }}
            >
              <div className={isSelected ? 'text-white' : 'text-gray-900'}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  isSelected ? 'bg-white bg-opacity-20' : category.color
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                <p className={`text-sm mb-3 ${isSelected ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                  {category.description}
                </p>
                <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                  {stats.count} {stats.count === 1 ? 'resource' : 'resources'} available
                  {category.id !== 'EQUIPMENT' && category.id !== 'all' && stats.capacity > 0 && (
                    <span className="block text-xs mt-1 opacity-75">
                      Total capacity: {stats.capacity} people
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Resources Grid */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedFilter === 'all' ? 'All Available Resources' : 
             resourceCategories.find(c => c.id === selectedFilter)?.name}
          </h2>
          <div className="text-sm text-gray-600">
            {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Resource Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {resource.name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mt-2">
                      {resource.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Resource Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{resource.location}</span>
                  </div>
                  
                  {resource.capacity && (
                    <div className="flex items-center text-gray-600">
                      <UserIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">Capacity: {resource.capacity} people</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">Available for booking</span>
                  </div>
                </div>

                {/* Availability Windows */}
                {resource.availabilityWindows && resource.availabilityWindows.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Hours:</h4>
                    <div className="space-y-1">
                      {resource.availabilityWindows.slice(0, 2).map((window, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {window}
                        </div>
                      ))}
                      {resource.availabilityWindows.length > 2 && (
                        <div className="text-xs text-blue-600">
                          +{resource.availabilityWindows.length - 2} more time slots
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onResourceSelect(resource)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => onQuickBook(resource)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Quick View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Bookings Today</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Booking Duration</p>
              <p className="text-2xl font-bold text-gray-900">2.5h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Utilization Rate</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
