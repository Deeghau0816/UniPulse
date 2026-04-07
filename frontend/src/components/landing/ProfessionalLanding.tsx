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
  UserIcon
} from '@heroicons/react/24/outline';
import type { Resource } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

interface ProfessionalLandingProps {
  onGetStarted: () => void;
  onResourceSelect: (resource: Resource) => void;
}

export const ProfessionalLanding: React.FC<ProfessionalLandingProps> = ({ 
  onGetStarted, 
  onResourceSelect 
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeUsers: 0,
    availableResources: 0,
    avgRating: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resourcesData = await bookingApi.getResources();
        setResources(resourcesData.filter(r => r.status === 'ACTIVE').slice(0, 6));
        
        // Mock stats for demonstration
        setStats({
          totalBookings: 1247,
          activeUsers: 384,
          availableResources: resourcesData.filter(r => r.status === 'ACTIVE').length,
          avgRating: 4.8
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resourceCategories = [
    {
      icon: AcademicCapIcon,
      title: 'Lecture Halls',
      description: 'Spacious venues equipped with modern audiovisual technology',
      color: 'from-blue-500 to-blue-600',
      count: resources.filter(r => r.type === 'LECTURE_HALL').length
    },
    {
      icon: BeakerIcon,
      title: 'Laboratories',
      description: 'State-of-the-art facilities for research and experimentation',
      color: 'from-green-500 to-green-600',
      count: resources.filter(r => r.type === 'LAB').length
    },
    {
      icon: UserGroupIcon,
      title: 'Meeting Rooms',
      description: 'Professional spaces for collaboration and discussions',
      color: 'from-purple-500 to-purple-600',
      count: resources.filter(r => r.type === 'MEETING_ROOM').length
    },
    {
      icon: ComputerDesktopIcon,
      title: 'Equipment',
      description: 'Advanced technology and specialized equipment',
      color: 'from-orange-500 to-orange-600',
      count: resources.filter(r => r.type === 'EQUIPMENT').length
    }
  ];

  const features = [
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Intelligent booking system with conflict detection and real-time availability'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access and data protection'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into resource utilization and booking patterns'
    },
    {
      icon: ClockIcon,
      title: '24/7 Availability',
      description: 'Round-the-clock access to booking system with instant confirmations'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-User Support',
      description: 'Collaborative booking with approval workflows and team management'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Campus Integration',
      description: 'Seamless integration with university systems and facilities management'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Professor of Computer Science',
      content: 'The booking system has transformed how we manage our laboratory sessions. It\'s intuitive, efficient, and saves us countless hours.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Student Union President',
      content: 'Finally, a booking system that actually works! The interface is clean and the process is seamless.',
      rating: 5
    },
    {
      name: 'Prof. David Williams',
      role: 'Department Head, Engineering',
      content: 'Professional-grade solution that meets all our facility management needs. Highly recommended.',
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative professional-container py-20">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Smart Campus Operations Hub
            </div>
            
            <h1 className="heading-premium-1 mb-6">
              Transform Your Campus
              <br />
              Resource Management
            </h1>
            
            <p className="text-premium text-xl max-w-3xl mx-auto mb-10">
              Experience the future of university facility booking with our intelligent, 
              user-friendly platform designed for seamless resource management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="btn-premium btn-premium-primary"
              >
                Get Started Now
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button className="btn-premium btn-premium-secondary">
                View Demo
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
            <div className="stats-card-premium text-center animate-slide-in-left">
              <div className="stats-icon-premium bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalBookings.toLocaleString()}</div>
              <div className="text-premium-small">Total Bookings</div>
            </div>
            
            <div className="stats-card-premium text-center animate-slide-in-left" style={{animationDelay: '0.1s'}}>
              <div className="stats-icon-premium bg-gradient-to-r from-green-500 to-green-600 text-white">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.activeUsers.toLocaleString()}</div>
              <div className="text-premium-small">Active Users</div>
            </div>
            
            <div className="stats-card-premium text-center animate-slide-in-left" style={{animationDelay: '0.2s'}}>
              <div className="stats-icon-premium bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <BuildingOfficeIcon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.availableResources}</div>
              <div className="text-premium-small">Available Resources</div>
            </div>
            
            <div className="stats-card-premium text-center animate-slide-in-left" style={{animationDelay: '0.3s'}}>
              <div className="stats-icon-premium bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.avgRating}</div>
              <div className="text-premium-small">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 bg-white">
        <div className="professional-container">
          <div className="text-center mb-16">
            <h2 className="heading-premium-2 mb-4">Resource Categories</h2>
            <p className="text-premium text-lg max-w-2xl mx-auto">
              Book from our comprehensive range of campus facilities designed to meet all your academic and administrative needs
            </p>
          </div>

          <div className="grid-premium">
            {resourceCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="professional-card animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="heading-premium-3 mb-3">{category.title}</h3>
                  <p className="text-premium mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{category.count}</span>
                    <span className="text-premium-small">Available</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="professional-container">
          <div className="text-center mb-16">
            <h2 className="heading-premium-2 mb-4">Why Choose Our Platform</h2>
            <p className="text-premium text-lg max-w-2xl mx-auto">
              Built with cutting-edge technology and designed for the modern educational institution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-premium-small">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      {resources.length > 0 && (
        <section className="py-20 bg-white">
          <div className="professional-container">
            <div className="text-center mb-16">
              <h2 className="heading-premium-2 mb-4">Featured Resources</h2>
              <p className="text-premium text-lg max-w-2xl mx-auto">
                Discover our most popular facilities available for booking
              </p>
            </div>

            <div className="grid-premium">
              {resources.map((resource, index) => (
                <div key={resource.id} className="resource-card-premium animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900 mb-2">{resource.name}</h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {resource.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-premium-small">
                      <span className="font-medium">Location:</span> {resource.location}
                    </div>
                    {resource.capacity && (
                      <div className="text-premium-small">
                        <span className="font-medium">Capacity:</span> {resource.capacity} people
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onResourceSelect(resource)}
                    className="btn-premium btn-premium-primary w-full"
                  >
                    Book Now
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="professional-container">
          <div className="text-center mb-16">
            <h2 className="heading-premium-2 mb-4 text-white">What Our Users Say</h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Trusted by students, faculty, and staff across the university
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-white/90 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-white/70 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="professional-container text-center">
          <h2 className="heading-premium-2 mb-4 text-white">Ready to Transform Your Campus Experience?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of students and faculty who are already enjoying seamless resource booking
          </p>
          
          <button
            onClick={onGetStarted}
            className="btn-premium bg-white text-gray-900 hover:bg-gray-100"
          >
            Get Started Today
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
