import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resourceService, type ResourceResponse, type ResourceType } from '../services/resourceService';
import {
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Home,
} from 'lucide-react';
import UnifiedNavbar from '../components/UnifiedNavbar';

const CustomerFacilitiesPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCapacity, setFilterCapacity] = useState<string>('ALL');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (err) {
      setError('Failed to load resources. Please try again later.');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'ALL' || resource.type === filterType;
      const matchesStatus = filterStatus === 'ALL' || resource.status === filterStatus;

      let matchesCapacity = true;
      if (filterCapacity !== 'ALL' && resource.capacity) {
        if (filterCapacity === 'SMALL') matchesCapacity = resource.capacity <= 30;
        else if (filterCapacity === 'MEDIUM') matchesCapacity = resource.capacity > 30 && resource.capacity <= 100;
        else if (filterCapacity === 'LARGE') matchesCapacity = resource.capacity > 100;
      } else if (filterCapacity !== 'ALL' && !resource.capacity) {
        matchesCapacity = false;
      }

      return matchesSearch && matchesType && matchesStatus && matchesCapacity;
    });
  }, [resources, searchTerm, filterType, filterStatus, filterCapacity]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setFilterStatus('ALL');
    setFilterCapacity('ALL');
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

  const handleResourceClick = (resourceId: number) => {
    navigate(`/customer/resources/${resourceId}`);
  };

  const handleQuickBook = (e: React.MouseEvent, resourceId: number) => {
    e.stopPropagation();
    const resource = resources.find(r => r.id === resourceId);
    if (resource?.status !== 'ACTIVE') {
      alert('This resource is currently out of service and cannot be booked.');
      return;
    }
    navigate(`/customer/resources/${resourceId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <UnifiedNavbar portal="user" />

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
              <span className="text-slate-900 font-medium">Browse Resources</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Browse Campus Resources
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Explore and discover available lecture halls, laboratories, meeting rooms, and equipment across the campus.
            </p>
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="LECTURE_HALL">Lecture Halls</option>
                <option value="LAB">Laboratories</option>
                <option value="MEETING_ROOM">Meeting Rooms</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
              >
                <option value="ALL">All Capacities</option>
                <option value="SMALL">Small (&le;30)</option>
                <option value="MEDIUM">Medium (31-100)</option>
                <option value="LARGE">Large (&gt;100)</option>
              </select>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
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
                <Search className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Resources Found</h3>
              <p className="text-slate-600">
                {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL' || filterCapacity !== 'ALL'
                  ? 'Try adjusting your filters or search term.'
                  : 'There are no resources available at the moment.'}
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
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-slate-300 transition-all cursor-pointer"
                    onClick={() => handleResourceClick(resource.id)}
                  >
                    {/* Card Header */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      {resource.imageUrl ? (
                        <img
                          src={resource.imageUrl}
                          alt={resource.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl">{getResourceIcon(resource.type)}</div>
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
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
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
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Calendar className="w-4 h-4" />
                        {resource.availabilityWindows}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                          onClick={(e) => handleQuickBook(e, resource.id)}
                          disabled={resource.status !== 'ACTIVE'}
                          className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Book Now
                        </button>
                        <button className="px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">
                          Details
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

export default CustomerFacilitiesPage;
