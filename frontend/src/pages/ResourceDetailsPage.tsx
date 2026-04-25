import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { resourceService, type ResourceRequest, type ResourceType, type ResourceStatus } from '../services/resourceService';
import { ArrowLeft, Edit, Save, X, Power, Trash2, MapPin, Users, Calendar, Clock, Home } from 'lucide-react';
import UnifiedNavbar from '../components/UnifiedNavbar';

const ResourceDetailsPage = () => {
  const navigate = useNavigate();
  const { resourceId } = useParams<{ resourceId: string }>();

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ResourceRequest>({
    name: '',
    type: 'LECTURE_HALL',
    capacity: undefined,
    location: '',
    description: '',
    availabilityWindows: '',
    status: 'ACTIVE',
    imageUrl: '',
  });

  useEffect(() => {
    const fetchResource = async () => {
      if (!resourceId) return;

      try {
        setLoading(true);
        const response = await resourceService.getResourceById(resourceId);
        
        setResource(response);
        setFormData({
          name: response.name,
          type: response.type,
          capacity: response.capacity || undefined,
          location: response.location,
          description: response.description,
          availabilityWindows: response.availabilityWindows,
          status: response.status,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch resource:', err);
        setError('Failed to load resource details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'capacity') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) || undefined : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!resourceId) return;

    try {
      setIsSaving(true);
      
      if (imageFile) {
        await resourceService.updateResourceWithImage(resourceId, formData, imageFile);
      } else {
        await resourceService.updateResource(resourceId, formData);
      }
      
      const updatedResponse = await resourceService.getResourceById(resourceId);
      setResource(updatedResponse);
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
      setError(null);
    } catch (err) {
      console.error('Failed to update resource:', err);
      setError('Failed to update resource. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!resourceId) return;

    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      await resourceService.deleteResource(resourceId);
      navigate('/dashboard/resources');
    } catch (err) {
      console.error('Failed to delete resource:', err);
      setError('Failed to delete resource. Please try again.');
    }
  };

  const handleStatusToggle = async () => {
    if (!resourceId || !resource) return;

    const newStatus: ResourceStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';

    try {
      await resourceService.updateResourceStatus(resourceId, newStatus);
      const updatedResponse = await resourceService.getResourceById(resourceId);
      setResource(updatedResponse);
      setFormData({
        ...formData,
        status: newStatus,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update resource status. Please try again.');
    }
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !resource) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <UnifiedNavbar portal="admin" />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link to="/" className="hover:text-slate-700 flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </Link>
              <span>/</span>
              <Link to="/dashboard/resources" className="hover:text-slate-700">Facilities Catalogue</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">{resource?.name || 'Resource Details'}</span>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Resource Details
                </h1>
                <p className="text-slate-600">
                  Manage and view resource information
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/dashboard/resources')}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleStatusToggle}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                        resource?.status === 'ACTIVE'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {resource?.status === 'ACTIVE' ? 'Mark Out of Service' : 'Mark Active'}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-xl hover:bg-red-200 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Resource Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{getTypeIcon(resource?.type)}</div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{resource?.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(resource?.type)}`}>
                        {getTypeLabel(resource?.type)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        resource?.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {resource?.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8">
              {isEditing ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Resource Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Resource Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="LAB">Laboratory</option>
                      <option value="MEETING_ROOM">Meeting Room</option>
                      <option value="EQUIPMENT">Equipment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity || ''}
                      onChange={handleInputChange}
                      placeholder="Leave empty for equipment"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Availability Windows</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="availabilityWindows"
                        value={formData.availabilityWindows}
                        onChange={handleInputChange}
                        placeholder="e.g., Mon-Fri 8AM-10PM, Sat 9AM-5PM"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Resource Image</label>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      {(imagePreview || resource?.imageUrl) && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200">
                          <img 
                            src={imagePreview || (resource?.imageUrl?.startsWith('http') ? resource.imageUrl : `http://localhost:8083${resource?.imageUrl}`)} 
                            alt="Preview" 
                            className="w-full h-48 object-cover" 
                          />
                          {imagePreview && (
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Info Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Location</p>
                        <p className="text-sm font-medium text-slate-900">{resource?.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <Users className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Capacity</p>
                        <p className="text-sm font-medium text-slate-900">{resource?.capacity || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Availability</p>
                        <p className="text-sm font-medium text-slate-900">{resource?.availabilityWindows}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <Clock className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Last Updated</p>
                        <p className="text-sm font-medium text-slate-900">{formatDate(resource?.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                    <p className="text-slate-600 leading-relaxed p-4 bg-slate-50 rounded-xl border-l-4 border-blue-500">
                      {resource?.description}
                    </p>
                  </div>

                  {/* Image */}
                  {resource?.imageUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Resource Image</h3>
                      <div className="rounded-xl overflow-hidden border border-slate-200">
                        <img 
                          src={resource.imageUrl.startsWith('http') ? resource.imageUrl : `http://localhost:8083${resource.imageUrl}`} 
                          alt={resource.name} 
                          className="w-full h-64 object-cover" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-500">Resource ID</span>
                        <span className="font-medium text-slate-900">#{resource?.id}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-500">Created</span>
                        <span className="font-medium text-slate-900">{formatDate(resource?.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourceDetailsPage;
