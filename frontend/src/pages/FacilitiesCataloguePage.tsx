import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resourceService, type ResourceType, type ResourceStatus } from '../services/resourceService';
import {
  Building2,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
  Ticket,
  Bell,
  Wrench,
  LayoutDashboard,
  Home,
} from 'lucide-react';

type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  description: string;
  availabilityWindows: string;
  status: ResourceStatus;
  createdAt: string;
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

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const resourceResponses = await resourceService.getAllResources();
        
        const resources: Resource[] = resourceResponses.map(response => ({
          id: response.id.toString(),
          name: response.name,
          type: response.type,
          capacity: response.capacity || undefined,
          location: response.location,
          description: response.description,
          availabilityWindows: response.availabilityWindows,
          status: response.status,
          createdAt: response.createdAt,
        }));
        
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
  }, []);

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
    <div className="min-h-screen bg-slate-50">
      {/* Navbar - Same as HomePage */}
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
              <button
                onClick={() => navigate('/customer/resources')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Browse Resources
              </button>
              <button
                onClick={() => navigate('/dashboard/my-tickets')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                My Tickets
              </button>
              <button
                onClick={() => navigate('/dashboard/technician/tickets')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                Technician
              </button>
              <button
                onClick={() => navigate('/dashboard/notifications')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

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
                  onClick={() => navigate('/dashboard/resources/new')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
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
                  <div
                    key={resource.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300 transition-all"
                  >
                    {/* Card Header */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <div className="text-6xl">{getTypeIcon(resource.type)}</div>
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
                          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
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
