import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  XMarkIcon,
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon as UserGroupIcon2,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { Resource, BookingRequest } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

const bookingSchema = z.object({
  resourceId: z.string().min(1, 'Please select a resource'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(500, 'Purpose must be less than 500 characters'),
  expectedAttendees: z.number().min(1, 'Expected attendees must be at least 1').optional(),
  specialRequirements: z.string().max(300, 'Special requirements must be less than 300 characters').optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface EnhancedBookingFormProps {
  resource?: Resource;
  onSubmit: (bookingData: BookingRequest) => void;
  onCancel: () => void;
  initialData?: Partial<BookingFormData>;
}

const resourceTypeConfig = {
  LECTURE_HALL: {
    icon: AcademicCapIcon,
    color: 'blue',
    label: 'Lecture Hall',
    description: 'Perfect for lectures, presentations, and large gatherings',
    features: ['Projector', 'Sound System', 'Microphones', 'Air Conditioning'],
    recommendedDuration: '2-3 hours'
  },
  LAB: {
    icon: BeakerIcon,
    color: 'green',
    label: 'Laboratory',
    description: 'Equipped for practical sessions and experiments',
    features: ['Lab Equipment', 'Safety Equipment', 'Computers', 'Specialized Tools'],
    recommendedDuration: '3-4 hours'
  },
  MEETING_ROOM: {
    icon: UserGroupIcon2,
    color: 'purple',
    label: 'Meeting Room',
    description: 'Ideal for meetings, discussions, and small presentations',
    features: ['Video Conference', 'Whiteboard', 'Coffee Machine', 'Comfortable Seating'],
    recommendedDuration: '1-2 hours'
  },
  EQUIPMENT: {
    icon: ComputerDesktopIcon,
    color: 'orange',
    label: 'Equipment',
    description: 'Technical equipment for specific needs',
    features: ['Technical Support', 'User Manual', 'Carrying Case', 'Accessories'],
    recommendedDuration: 'As needed'
  }
};

export const EnhancedBookingForm: React.FC<EnhancedBookingFormProps> = ({ 
  resource: preSelectedResource,
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(preSelectedResource || null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: initialData,
  });

  const watchedResourceId = watch('resourceId');
  const selectedDate = watch('date');
  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
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

    fetchResources();
  }, []);

  useEffect(() => {
    if (watchedResourceId) {
      const resource = resources.find(r => r.id === watchedResourceId);
      setSelectedResource(resource || null);
      
      // Set default attendees based on resource capacity
      if (resource?.capacity) {
        setValue('expectedAttendees', Math.min(10, resource.capacity));
      }
    }
  }, [watchedResourceId, resources, setValue]);

  const checkForConflicts = async () => {
    if (!selectedResource || !selectedDate || !startTime || !endTime) return;

    try {
      const conflicts = await bookingApi.checkConflicts({
        resourceId: selectedResource.id,
        date: selectedDate,
        startTime,
        endTime,
        purpose: '',
      });

      if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(conflict => 
          `Resource has ${conflict.conflictingBookings.length} conflicting booking(s) during this time`
        );
        setConflicts(conflictMessages);
      } else {
        setConflicts([]);
      }
    } catch (error) {
      console.error('Failed to check conflicts:', error);
    }
  };

  useEffect(() => {
    checkForConflicts();
  }, [selectedResource, selectedDate, startTime, endTime]);

  const onFormSubmit = async (data: BookingFormData) => {
    try {
      if (conflicts.length > 0) {
        setError('root', { 
          message: 'Cannot create booking due to scheduling conflicts. Please choose a different time slot.' 
        });
        return;
      }

      await onSubmit(data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError('root', { message: 'Failed to create booking. Please try again.' });
    }
  };

  const resourceConfig = selectedResource ? resourceTypeConfig[selectedResource.type] : null;
  const Icon = resourceConfig?.icon || AcademicCapIcon;

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800">Booking request submitted successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Resource Booking</h2>
              <p className="text-blue-100">
                Reserve campus resources for your academic and administrative needs
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-8">
          {/* Resource Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Select Resource
              </label>
              <select
                {...register('resourceId')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                disabled={!!preSelectedResource}
              >
                <option value="">Choose a resource...</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
              {errors.resourceId && (
                <p className="mt-2 text-sm text-red-600">{errors.resourceId.message}</p>
              )}
            </div>

            {/* Resource Info Card */}
            {selectedResource && resourceConfig && (
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start mb-4">
                  <div className={`w-12 h-12 bg-${resourceConfig.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${resourceConfig.color}-600`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{selectedResource.name}</h3>
                    <p className="text-sm text-gray-600">{resourceConfig.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {resourceConfig.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{selectedResource.location}</span>
                  </div>
                  
                  {selectedResource.capacity && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Capacity:</span>
                      <span className="ml-2">{selectedResource.capacity} people</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Recommended Duration:</span>
                    <span className="ml-2">{resourceConfig.recommendedDuration}</span>
                  </div>

                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700">Features:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resourceConfig.features.map((feature, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <CalendarIcon className="inline h-5 w-5 mr-2" />
                Date
              </label>
              <input
                type="date"
                {...register('date')}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {errors.date && (
                <p className="mt-2 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <ClockIcon className="inline h-5 w-5 mr-2" />
                Start Time
              </label>
              <input
                type="time"
                {...register('startTime')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {errors.startTime && (
                <p className="mt-2 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <ClockIcon className="inline h-5 w-5 mr-2" />
                End Time
              </label>
              <input
                type="time"
                {...register('endTime')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {errors.endTime && (
                <p className="mt-2 text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Attendees and Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <UserGroupIcon className="inline h-5 w-5 mr-2" />
                Expected Attendees
              </label>
              <input
                type="number"
                {...register('expectedAttendees', { valueAsNumber: true })}
                min="1"
                max={selectedResource?.capacity || 999}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Number of attendees"
              />
              {errors.expectedAttendees && (
                <p className="mt-2 text-sm text-red-600">{errors.expectedAttendees.message}</p>
              )}
              {selectedResource?.capacity && (
                <p className="mt-2 text-sm text-gray-500">
                  Maximum capacity: {selectedResource.capacity} people
                </p>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Special Requirements (Optional)
              </label>
              <input
                type="text"
                {...register('specialRequirements')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Any special equipment or arrangements needed"
              />
              {errors.specialRequirements && (
                <p className="mt-2 text-sm text-red-600">{errors.specialRequirements.message}</p>
              )}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Purpose of Booking
            </label>
            <textarea
              {...register('purpose')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Please describe the purpose of this booking in detail..."
            />
            {errors.purpose && (
              <p className="mt-2 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Scheduling Conflicts Detected</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {conflicts.map((conflict, index) => (
                      <li key={index}>• {conflict}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-red-600 mt-3">
                    Please choose a different time slot or resource to continue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          {selectedResource && conflicts.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Booking Information</h3>
                  <p className="text-sm text-blue-700">
                    Your booking request will be submitted for approval. You will receive a notification 
                    once it's reviewed by the administration. Please ensure all details are correct before submitting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Errors */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || conflicts.length > 0}
              className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
