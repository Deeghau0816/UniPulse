import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resourceService, type ResourceResponse, type ResourceType } from '../services/resourceService';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Clock,
  Ticket,
  Bell,
  Wrench,
  ArrowRight,
  Home,
  X,
  CheckCircle,
} from 'lucide-react';

const CustomerResourceDetailsPage = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ResourceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingDuration, setBookingDuration] = useState<string>('1');
  const [bookingPurpose, setBookingPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    if (!resourceId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getResourceById(resourceId);
      setResource(data);
    } catch (err) {
      setError('Failed to load resource details. Please try again later.');
      console.error('Error loading resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'LECTURE_HALL': return '🏛️';
      case 'LAB': return '🔬';
      case 'MEETING_ROOM': return '🤝';
      case 'EQUIPMENT': return '📦';
      default: return '📍';
    }
  };

  const getTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'LECTURE_HALL': return 'Lecture Hall';
      case 'LAB': return 'Laboratory';
      case 'MEETING_ROOM': return 'Meeting Room';
      case 'EQUIPMENT': return 'Equipment';
      default: return type;
    }
  };

  const getTypeColor = (type: ResourceType) => {
    switch (type) {
      case 'LECTURE_HALL': return 'bg-blue-100 text-blue-700';
      case 'LAB': return 'bg-purple-100 text-purple-700';
      case 'MEETING_ROOM': return 'bg-emerald-100 text-emerald-700';
      case 'EQUIPMENT': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleBack = () => {
    navigate('/customer/resources');
  };

  const handleOpenBooking = () => {
    if (resource?.status !== 'ACTIVE') {
      alert('This resource is currently out of service and cannot be booked.');
      return;
    }
    navigate(`/reservations/user?resourceId=${resourceId}`);
  };

  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setBookingDate('');
    setBookingTime('');
    setBookingDuration('1');
    setBookingPurpose('');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !bookingPurpose) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      alert(`Booking request submitted successfully!\n\nResource: ${resource?.name}\nDate: ${bookingDate}\nTime: ${bookingTime}\nDuration: ${bookingDuration} hour(s)\nPurpose: ${bookingPurpose}\n\nYou will receive a confirmation email shortly.`);
      setIsSubmitting(false);
      handleCloseBooking();
    }, 1500);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error</h3>
          <p className="text-slate-600 mb-4">{error || 'Resource not found'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Smart Campus
              </span>
            </Link>
            
            <div className="hidden xl:flex items-center gap-6">
              <button onClick={() => navigate('/customer/resources')} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                <Building2 className="w-4 h-4" />
                Browse Resources
              </button>
              <button onClick={() => navigate('/dashboard/my-tickets')} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                <Ticket className="w-4 h-4" />
                My Tickets
              </button>
              <button onClick={() => navigate('/dashboard/technician/tickets')} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                <Wrench className="w-4 h-4" />
                Technician
              </button>
              <button onClick={() => navigate('/dashboard/notifications')} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                <Bell className="w-4 h-4" />
                Notifications
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </button>
              <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link to="/" className="hover:text-slate-700 flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </Link>
              <span>/</span>
              <Link to="/customer/resources" className="hover:text-slate-700">Browse Resources</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">{resource.name}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Resource Details
                </h1>
                <p className="text-slate-600">
                  View resource information and make a booking
                </p>
              </div>
              
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>

          {/* Resource Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{getResourceIcon(resource.type)}</div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{resource.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(resource.type)}`}>
                        {getTypeLabel(resource.type)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        resource.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {resource.status === 'ACTIVE' ? 'Available for Booking' : 'Out of Service'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8">
              {/* Image */}
              <div className="rounded-2xl overflow-hidden mb-8 border border-slate-200">
                {resource.imageUrl ? (
                  <img src={resource.imageUrl} alt={resource.name} className="w-full h-64 sm:h-80 object-cover" />
                ) : (
                  <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <span className="text-8xl">{getResourceIcon(resource.type)}</span>
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Location</p>
                    <p className="text-sm font-medium text-slate-900">{resource.location}</p>
                  </div>
                </div>
                {resource.capacity && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Users className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Capacity</p>
                      <p className="text-sm font-medium text-slate-900">{resource.capacity} people</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Availability</p>
                    <p className="text-sm font-medium text-slate-900">{resource.availabilityWindows}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Resource ID</p>
                    <p className="text-sm font-medium text-slate-900">#{resource.id}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">About this Resource</h3>
                <p className="text-slate-600 leading-relaxed p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                  {resource.description}
                </p>
              </div>

              {/* Booking Section */}
              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={handleOpenBooking}
                  disabled={resource.status !== 'ACTIVE'}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                    resource.status === 'ACTIVE'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {resource.status === 'ACTIVE' ? '📅 Book This Resource' : '❌ Currently Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Book {resource?.name}</h3>
                <button
                  onClick={handleCloseBooking}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Date *</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={getTodayDate()}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Start Time *</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Duration</label>
                <select
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="8">Full day (8 hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Purpose *</label>
                <textarea
                  placeholder="Describe the purpose of your booking..."
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseBooking}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerResourceDetailsPage;
