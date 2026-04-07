export interface Resource {
  id: string;
  name: string;
  type: 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
  capacity?: number;
  location: string;
  availabilityWindows: string[];
  status: 'ACTIVE' | 'OUT_OF_SERVICE';
}

export interface BookingRequest {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees?: number;
}

export interface Booking extends BookingRequest {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  resource: Resource;
}

export interface BookingFilters {
  status?: Booking['status'];
  resourceType?: Resource['type'];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface BookingConflict {
  resourceId: string;
  conflictingBookings: Booking[];
  requestedTimeSlot: {
    startTime: string;
    endTime: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TECHNICIAN';
}
