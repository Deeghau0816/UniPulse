import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, ClockIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Resource, BookingRequest } from '../../types/booking';
import { bookingApi } from '../../services/bookingApi';

const bookingSchema = z.object({
  resourceId: z.string().min(1, 'Please select a resource'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters').max(500, 'Purpose must be less than 500 characters'),
  expectedAttendees: z.number().min(1, 'Expected attendees must be at least 1').optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (bookingData: BookingRequest) => void;
  onCancel: () => void;
  initialData?: Partial<BookingFormData>;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: initialData,
  });

  const selectedResourceId = watch('resourceId');
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

  const checkForConflicts = async () => {
    if (!selectedResourceId || !selectedDate || !startTime || !endTime) return;

    try {
      const conflicts = await bookingApi.checkConflicts({
        resourceId: selectedResourceId,
        date: selectedDate,
        startTime,
        endTime,
        purpose: '', // Not needed for conflict check
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
  }, [selectedResourceId, selectedDate, startTime, endTime]);

  const onFormSubmit = async (data: BookingFormData) => {
    try {
      if (conflicts.length > 0) {
        setError('root', { 
          message: 'Cannot create booking due to scheduling conflicts. Please choose a different time slot.' 
        });
        return;
      }

      await onSubmit(data);
    } catch (error) {
      setError('root', { message: 'Failed to create booking. Please try again.' });
    }
  };

  const selectedResource = resources.find(r => r.id === selectedResourceId);

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Request Booking</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Resource Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Resource
          </label>
          <select
            {...register('resourceId')}
            className="input-field"
            disabled={loading}
          >
            <option value="">Choose a resource...</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type}) - {resource.location}
                {resource.capacity && ` - Capacity: ${resource.capacity}`}
              </option>
            ))}
          </select>
          {errors.resourceId && (
            <p className="mt-1 text-sm text-red-600">{errors.resourceId.message}</p>
          )}
        </div>

        {/* Resource Details */}
        {selectedResource && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Resource Details</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Type:</strong> {selectedResource.type.replace('_', ' ')}</p>
              <p><strong>Location:</strong> {selectedResource.location}</p>
              {selectedResource.capacity && (
                <p><strong>Capacity:</strong> {selectedResource.capacity} people</p>
              )}
              <p><strong>Status:</strong> {selectedResource.status}</p>
            </div>
          </div>
        )}

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              {...register('date')}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="inline h-4 w-4 mr-1" />
              Start Time
            </label>
            <input
              type="time"
              {...register('startTime')}
              className="input-field"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="inline h-4 w-4 mr-1" />
              End Time
            </label>
            <input
              type="time"
              {...register('endTime')}
              className="input-field"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        {/* Expected Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserGroupIcon className="inline h-4 w-4 mr-1" />
            Expected Attendees (Optional)
          </label>
          <input
            type="number"
            {...register('expectedAttendees', { valueAsNumber: true })}
            min="1"
            max={selectedResource?.capacity || 999}
            className="input-field"
            placeholder="Number of attendees"
          />
          {errors.expectedAttendees && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedAttendees.message}</p>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Booking
          </label>
          <textarea
            {...register('purpose')}
            rows={3}
            className="input-field"
            placeholder="Describe the purpose of this booking..."
          />
          {errors.purpose && (
            <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
          )}
        </div>

        {/* Conflict Warnings */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">⚠️ Scheduling Conflicts</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {conflicts.map((conflict, index) => (
                <li key={index}>• {conflict}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{errors.root.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || conflicts.length > 0}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
