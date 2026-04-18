import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resourceService, type ResourceRequest } from '../services/resourceService';
import {
  Building2,
  ArrowLeft,
  Plus,
  Ticket,
  Bell,
  Wrench,
  ArrowRight,
  LayoutDashboard,
  Home,
} from 'lucide-react';

const AddResourcePage = () => {
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await resourceService.createResource(formData);
      setError(null);
      navigate(`/dashboard/resources/${response.id}`);
    } catch (err) {
      console.error('Failed to create resource:', err);
      setError('Failed to create resource. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link to="/" className="hover:text-slate-700 flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </Link>
              <span>/</span>
              <Link to="/dashboard/resources" className="hover:text-slate-700">Facilities Catalogue</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">Add Resource</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Add New Resource
                </h1>
                <p className="text-slate-600">
                  Create a new campus resource for students and staff to book.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/resources')}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Resource Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Resource Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Lecture Hall A"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  required
                >
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Laboratory</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleInputChange}
                  placeholder="Leave empty for equipment"
                  min="1"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Leave empty for equipment items</p>
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Building 3, Floor 2"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the resource, its features, and any special requirements..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
                  required
                />
              </div>

              {/* Availability Windows */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Availability Windows <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="availabilityWindows"
                  value={formData.availabilityWindows}
                  onChange={handleInputChange}
                  placeholder="e.g., Mon-Fri 8AM-10PM, Sat 9AM-5PM"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">Specify when this resource is available for booking</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>

              {/* Image URL */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/resource-image.jpg"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Add a photo URL to display the resource image in the customer view</p>
                
                {formData.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="px-4 py-2 bg-slate-50 text-xs text-slate-600 text-center">Image Preview</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard/resources')}
                className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {isSaving ? 'Creating...' : 'Create Resource'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddResourcePage;
