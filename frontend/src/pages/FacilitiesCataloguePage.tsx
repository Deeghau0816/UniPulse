import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resourceService, type ResourceType, type ResourceStatus } from '../services/resourceService';
import {
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
  BarChart3,
  Clock,
  TrendingUp,
  PieChart,
  Activity,
  Building2,
  Home,
  LayoutDashboard,
} from 'lucide-react';
import UnifiedNavbar from '../components/UnifiedNavbar';

// Resource Card Component
const ResourceCard = ({ resource, navigate, getTypeIcon, getTypeLabel, getTypeColor, formatDate }: any) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = resource.imageUrl 
    ? (resource.imageUrl.startsWith('http') ? resource.imageUrl : `http://localhost:8083${resource.imageUrl}`)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-blue-300 transition-all">
      {/* Card Header */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover"
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl);
            }}
            onError={() => {
              console.error('Image failed to load:', imageUrl);
              setImageError(true);
            }}
          />
        ) : null}
        {(!imageUrl || imageError) && (
          <div className="text-6xl">{getTypeIcon(resource.type)}</div>
        )}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
          resource.status === 'ACTIVE'
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
        </div>
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(resource.type)}`}>
          {getTypeLabel(resource.type)}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {resource.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
          <MapPin className="w-4 h-4" />
          {resource.location}
        </div>
        {resource.capacity && (
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <Users className="w-4 h-4" />
            Capacity: {resource.capacity} people
          </div>
        )}
        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
          {resource.description}
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Calendar className="w-4 h-4" />
          {resource.availabilityWindows}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Added {formatDate(resource.createdAt)}
          </span>
          <button
            onClick={() => navigate(`/dashboard/resources/${resource.id}`)}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  description: string;
  availabilityWindows: string;
  status: ResourceStatus;
  imageUrl?: string;
  createdAt: string;
};

type ResourceAnalytics = {
  period: string;
  totalReservations: number;
  totalResourcesUsed: number;
  uniqueUsers: number;
  averageReservationDuration: number;
  averageAttendeesPerReservation: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  reservationsByResourceType: Record<string, number>;
  reservationsByResourceName: Record<string, number>;
  usageByLocation: Record<string, number>;
  reservationsByUser: Record<string, number>;
  usersWithMultipleReservations: number;
  reservationsByDayOfWeek: Record<string, number>;
  reservationsByHour: Record<string, number>;
  peakUsageDay: string;
  peakUsageHour: string;
  mostPopularResource: string;
};

const FacilitiesCataloguePage = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ResourceType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ResourceStatus>('ALL');
  const [capacityFilter, setCapacityFilter] = useState<'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE'>('ALL');

  // Analytics state
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'month' | 'week' | 'today' | 'year' | 'all'>('month');
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const resourceResponses = await resourceService.getAllResources();
        
        const resources: Resource[] = resourceResponses.map(response => {
          console.log('Resource imageUrl:', response.imageUrl);
          return {
            id: response.id.toString(),
            name: response.name,
            type: response.type,
            capacity: response.capacity || undefined,
            location: response.location,
            description: response.description,
            availabilityWindows: response.availabilityWindows,
            status: response.status,
            imageUrl: response.imageUrl,
            createdAt: response.createdAt,
          };
        });
        
        setResources(resources);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
    fetchAnalytics();
  }, [analyticsPeriod]);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`http://localhost:8083/api/analytics/resources/${analyticsPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || resource.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || resource.status === statusFilter;

      let matchesCapacity = true;
      if (capacityFilter !== 'ALL' && resource.capacity) {
        if (capacityFilter === 'SMALL') matchesCapacity = resource.capacity <= 30;
        else if (capacityFilter === 'MEDIUM') matchesCapacity = resource.capacity > 30 && resource.capacity <= 100;
        else if (capacityFilter === 'LARGE') matchesCapacity = resource.capacity > 100;
      }

      return matchesSearch && matchesType && matchesStatus && matchesCapacity;
    });
  }, [resources, searchTerm, typeFilter, statusFilter, capacityFilter]);

  const clearFilters = (): void => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setCapacityFilter('ALL');
  };

  const getTypeIcon = (type: ResourceType): string => {
    switch (type) {
      case 'LECTURE_HALL': return '🏛️';
      case 'LAB': return '🔬';
      case 'MEETING_ROOM': return '🤝';
      case 'EQUIPMENT': return '📦';
      default: return '📍';
    }
  };

  const getTypeLabel = (type: ResourceType): string => {
    switch (type) {
      case 'LECTURE_HALL': return 'Lecture Hall';
      case 'LAB': return 'Lab';
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <UnifiedNavbar portal="admin" />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link to="/" className="hover:text-slate-700 flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">Facilities Catalogue</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                  Facilities & Assets Catalogue
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Browse and manage all bookable campus resources including lecture halls, labs, meeting rooms, and equipment.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    showAnalytics
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/30'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
                </button>
                <button
                  onClick={() => navigate('/dashboard/resources/new')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          {showAnalytics && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Resource Usage Analytics</h2>
                    <p className="text-sm text-slate-500">
                      {analytics?.period || 'Loading...'} • {analytics?.totalReservations || 0} total reservations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={analyticsPeriod}
                    onChange={(e) => setAnalyticsPeriod(e.target.value as typeof analyticsPeriod)}
                  >
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last 365 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Key Metrics Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Total Reservations</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{analytics.totalReservations}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {analytics.uniqueUsers} unique users
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">Resources Used</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{analytics.totalResourcesUsed}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        across all locations
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Avg Duration</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {analytics.averageReservationDuration.toFixed(1)}h
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        per reservation
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">Avg Attendees</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {analytics.averageAttendeesPerReservation.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        people per booking
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown & Peak Usage */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Status Breakdown */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-4 h-4" />
                        Reservation Status Breakdown
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Approved', value: analytics.approvedCount, color: 'bg-emerald-500' },
                          { label: 'Pending', value: analytics.pendingCount, color: 'bg-amber-500' },
                          { label: 'Rejected', value: analytics.rejectedCount, color: 'bg-red-500' },
                          { label: 'Cancelled', value: analytics.cancelledCount, color: 'bg-slate-500' },
                        ].map((item) => {
                          const total = analytics.totalReservations || 1;
                          const percentage = ((item.value / total) * 100).toFixed(1);
                          return (
                            <div key={item.label}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-700">{item.label}</span>
                                <span className="font-medium text-slate-900">
                                  {item.value} ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${item.color} transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Peak Usage Insights */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Peak Usage Insights
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">Peak Usage Day</div>
                            <div className="font-semibold text-slate-900">{analytics.peakUsageDay}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">Peak Usage Hour</div>
                            <div className="font-semibold text-slate-900">{analytics.peakUsageHour}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">Most Popular Resource</div>
                            <div className="font-semibold text-slate-900">{analytics.mostPopularResource}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">Repeat Users</div>
                            <div className="font-semibold text-slate-900">
                              {analytics.usersWithMultipleReservations} users with multiple reservations
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Usage by Type */}
                  {Object.keys(analytics.reservationsByResourceType).length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4">Reservations by Resource Type</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {Object.entries(analytics.reservationsByResourceType)
                          .sort(([,a], [,b]) => b - a)
                          .map(([type, count]) => (
                            <div key={type} className="bg-white rounded-lg p-3 border border-slate-200">
                              <div className="text-sm text-slate-500 capitalize">{type.replace(/_/g, ' ')}</div>
                              <div className="text-xl font-bold text-slate-900">{count}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Usage by Location */}
                  {Object.keys(analytics.usageByLocation).length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Usage by Location
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(analytics.usageByLocation)
                          .sort(([,a], [,b]) => b - a)
                          .map(([location, count]) => (
                            <div key={location} className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                              <span className="text-sm text-slate-700">{location}</span>
                              <span className="font-semibold text-slate-900">{count} bookings</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900">Filters</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'ALL' | ResourceType)}
              >
                <option value="ALL">All Types</option>
                <option value="LECTURE_HALL">Lecture Halls</option>
                <option value="LAB">Laboratories</option>
                <option value="MEETING_ROOM">Meeting Rooms</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ResourceStatus)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value as 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE')}
              >
                <option value="ALL">All Capacities</option>
                <option value="SMALL">Small (&le;30)</option>
                <option value="MEDIUM">Medium (31-100)</option>
                <option value="LARGE">Large (&gt;100)</option>
              </select>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Resources</h3>
              <p className="text-slate-600">{error}</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Resources Found</h3>
              <p className="text-slate-600">
                {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' || capacityFilter !== 'ALL'
                  ? 'Try adjusting your filters or search term.'
                  : 'No resources have been added yet. Click "Add Resource" to get started.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredResources.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{resources.length}</span> resources
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    navigate={navigate}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    getTypeColor={getTypeColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default FacilitiesCataloguePage;
