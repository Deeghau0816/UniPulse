// ================================================================
// Module B – Reservation Management Types
// No "booking" terminology used per assignment requirements
// ================================================================

export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';
export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface CampusResource {
  id: number;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  availabilityWindows?: string;
  status: ResourceStatus;
}

export interface ReservationRequest {
  resourceId: number;
  userId: string;
  userName?: string;
  reservationDate: string;   // yyyy-MM-dd
  startTime: string;          // HH:mm
  endTime: string;            // HH:mm
  expectedAttendees?: number;
  purpose: string;
  specialNotes?: string;
}

export interface ReservationRecord {
  id: number;
  userId: string;
  userName?: string;
  resourceId: number;
  resourceName: string;
  resourceType: string;
  resourceLocation: string;
  resourceCapacity?: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  expectedAttendees?: number;
  purpose: string;
  specialNotes?: string;
  status: ReservationStatus;
  adminReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationStatusUpdate {
  status: ReservationStatus;
  reason?: string;
  reviewedBy?: string;
}

export interface ReservationSummary {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
}

export interface UserNotification {
  id: number;
  userId: string;
  message: string;
  notificationType?: string;
  reservationId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
