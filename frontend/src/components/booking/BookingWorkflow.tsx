import React from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Booking } from '../../types/booking';

interface BookingWorkflowProps {
  booking: Booking;
}

export const BookingWorkflow: React.FC<BookingWorkflowProps> = ({ booking }) => {
  const workflowSteps = [
    {
      key: 'PENDING',
      label: 'Pending',
      description: 'Booking request submitted',
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      key: 'APPROVED',
      label: 'Approved',
      description: 'Booking approved by admin',
      icon: CheckCircleIcon,
      color: 'green',
    },
    {
      key: 'REJECTED',
      label: 'Rejected',
      description: 'Booking rejected',
      icon: XCircleIcon,
      color: 'red',
    },
    {
      key: 'CANCELLED',
      label: 'Cancelled',
      description: 'Booking cancelled',
      icon: XMarkIcon,
      color: 'gray',
    },
  ];

  const getStepStatus = (stepKey: string) => {
    if (booking.status === stepKey) return 'current';
    if (stepKey === 'PENDING') return 'completed';
    if (stepKey === 'APPROVED' && booking.status === 'APPROVED') return 'completed';
    if (stepKey === 'REJECTED' && booking.status === 'REJECTED') return 'completed';
    if (stepKey === 'CANCELLED' && booking.status === 'CANCELLED') return 'completed';
    return 'upcoming';
  };

  const getStepColor = (stepKey: string) => {
    const status = getStepStatus(stepKey);
    const step = workflowSteps.find(s => s.key === stepKey);
    
    if (status === 'current') return step?.color || 'gray';
    if (status === 'completed') return 'green';
    return 'gray';
  };

  const isStepCompleted = (stepKey: string) => {
    return getStepStatus(stepKey) === 'completed';
  };

  const isStepCurrent = (stepKey: string) => {
    return getStepStatus(stepKey) === 'current';
  };

  // Filter steps based on current booking status
  const getVisibleSteps = () => {
    if (booking.status === 'REJECTED') {
      return workflowSteps.filter(step => step.key === 'PENDING' || step.key === 'REJECTED');
    }
    if (booking.status === 'CANCELLED') {
      return workflowSteps.filter(step => step.key === 'PENDING' || step.key === 'CANCELLED');
    }
    if (booking.status === 'APPROVED') {
      return workflowSteps.filter(step => step.key === 'PENDING' || step.key === 'APPROVED');
    }
    return workflowSteps.filter(step => step.key === 'PENDING');
  };

  const visibleSteps = getVisibleSteps();

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Status</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200 -z-10"></div>
        
        <div className="flex justify-between">
          {visibleSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = isStepCompleted(step.key);
            const isCurrent = isStepCurrent(step.key);
            const color = getStepColor(step.key);

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                      ? `bg-${color}-100 border-${color}-600` 
                      : isCurrent 
                        ? `bg-${color}-100 border-${color}-600 ring-4 ring-${color}-100` 
                        : 'bg-gray-100 border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-8 w-8 transition-all duration-300
                      ${isCompleted || isCurrent 
                        ? `text-${color}-600` 
                        : 'text-gray-400'
                      }
                    `}
                  />
                  
                  {/* Step Number */}
                  <div
                    className={`
                      absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isCompleted 
                        ? `bg-${color}-600 text-white` 
                        : 'bg-gray-300 text-gray-600'
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step Label */}
                <div className="mt-4 text-center">
                  <h4
                    className={`
                      font-medium text-sm
                      ${isCompleted || isCurrent 
                        ? 'text-gray-900' 
                        : 'text-gray-500'
                      }
                    `}
                  >
                    {step.label}
                  </h4>
                  <p
                    className={`
                      text-xs mt-1 max-w-32
                      ${isCompleted || isCurrent 
                        ? 'text-gray-600' 
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Status Badge */}
                {isCurrent && (
                  <div className={`mt-2 px-2 py-1 bg-${color}-100 text-${color}-800 text-xs rounded-full`}>
                    Current
                  </div>
                )}
                
                {isCompleted && step.key !== 'PENDING' && (
                  <div className="mt-2 text-green-600 text-xs font-medium">
                    ✓ Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Status Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium bg-${getStepColor(booking.status)}-100 text-${getStepColor(booking.status)}-800`}>
              {booking.status}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <span className="ml-2 text-gray-600">
              {new Date(booking.createdAt).toLocaleString()}
            </span>
          </div>

          {booking.updatedAt !== booking.createdAt && (
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <span className="ml-2 text-gray-600">
                {new Date(booking.updatedAt).toLocaleString()}
              </span>
            </div>
          )}

          {booking.rejectionReason && (
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Rejection Reason:</span>
              <p className="mt-1 text-red-600 bg-red-50 p-2 rounded">
                {booking.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
