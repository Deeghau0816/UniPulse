import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import type { Resource } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

interface PerfectLandingProps {
  onGetStarted: () => void;
  onResourceSelect: (resource: Resource) => void;
}

export const PerfectLanding: React.FC<PerfectLandingProps> = ({ 
  onGetStarted, 
  onResourceSelect 
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resourcesData = await bookingApi.getResources();
        setResources(resourcesData.filter(r => r.status === 'ACTIVE'));
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resourceCategories = [
    {
      id: 'all',
      name: 'All Resources',
      icon: SparklesIcon,
      color: 'from-blue-500 to-purple-600',
      description: 'Browse all available campus resources',
      count: resources.length
    },
    {
      id: 'LECTURE_HALL',
      name: 'Lecture Halls',
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-blue-600',
      description: 'Large spaces for lectures and presentations',
      count: resources.filter(r => r.type === 'LECTURE_HALL').length
    },
    {
      id: 'LAB',
      name: 'Laboratories',
      icon: BeakerIcon,
      color: 'from-green-500 to-green-600',
      description: 'Equipped labs for practical sessions',
      count: resources.filter(r => r.type === 'LAB').length
    },
    {
      id: 'MEETING_ROOM',
      name: 'Meeting Rooms',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-purple-600',
      description: 'Conference rooms for meetings',
      count: resources.filter(r => r.type === 'MEETING_ROOM').length
    },
    {
      id: 'EQUIPMENT',
      name: 'Equipment',
      icon: ComputerDesktopIcon,
      color: 'from-orange-500 to-orange-600',
      description: 'Technical equipment and devices',
      count: resources.filter(r => r.type === 'EQUIPMENT').length
    }
  ];

  const filteredResources = activeTab === 'all' 
    ? resources 
    : resources.filter(r => r.type === activeTab);

  const stats = [
    { label: 'Total Bookings', value: '1,247', icon: CalendarIcon, color: 'bg-blue-500' },
    { label: 'Active Users', value: '384', icon: UserIcon, color: 'bg-green-500' },
    { label: 'Resources', value: resources.length.toString(), icon: BuildingOfficeIcon, color: 'bg-purple-500' },
    { label: 'Avg Rating', value: '4.8', icon: StarIcon, color: 'bg-orange-500' }
  ];

  const features = [
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Intelligent booking system with conflict detection and real-time availability updates',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control and data encryption',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into resource utilization and booking patterns',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: ClockIcon,
      title: '24/7 Availability',
      description: 'Round-the-clock access to booking system with instant confirmations',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Team Collaboration',
      description: 'Collaborative booking with approval workflows and team management',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Campus Integration',
      description: 'Seamless integration with university systems and facilities management',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Professor of Computer Science',
      content: 'The booking system has completely transformed how we manage our laboratory sessions. It\'s intuitive, efficient, and saves us countless hours each week.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Student Union President',
      content: 'Finally, a booking system that actually works! The interface is clean, the process is seamless, and the support team is incredible.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Prof. David Williams',
      role: 'Department Head, Engineering',
      content: 'Professional-grade solution that meets all our facility management needs. Highly recommended for any educational institution.',
      rating: 5,
      avatar: 'DW'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-8">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Smart Campus Operations Hub
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Campus Resource Management
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Experience the future of university facility booking with our intelligent, 
              user-friendly platform designed for seamless resource management.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Get Started Now
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
              <button className="btn btn-outline text-lg px-8 py-4 flex items-center">
                <PlayIcon className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Resource Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Book from our comprehensive range of campus facilities designed to meet all your academic and administrative needs
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {resourceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === category.id
                      ? 'bg-gradient-to-r text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  } ${activeTab === category.id ? category.color : ''}`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {category.name}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === category.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.slice(0, 8).map((resource, index) => (
              <div key={resource.id} className="card group cursor-pointer" onClick={() => onResourceSelect(resource)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {resource.name}
                    </h3>
                    <span className="badge badge-primary text-xs">
                      {resource.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600 flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    {resource.location}
                  </div>
                  {resource.capacity && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      Capacity: {resource.capacity} people
                    </div>
                  )}
                </div>

                <button className="btn btn-primary w-full text-sm">
                  Book Now
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology and designed for the modern educational institution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="flex gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Trusted by students, faculty, and staff across the university
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-white/90 text-lg mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-white/70 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Campus Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join hundreds of students and faculty who are already enjoying seamless resource booking
          </p>
          
          <button
            onClick={onGetStarted}
            className="btn bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Get Started Today
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
};
