import axios, { AxiosError } from 'axios';
import type {
  CampusResource,
  ReservationRecord,
  ReservationRequest,
  ReservationStatusUpdate,
  ReservationSummary,
  UserNotification,
  ApiResponse,
  ResourceType,
  ReservationStatus,
} from '../types/reservation';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Auth token interceptor (for Module E OAuth2 integration)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as ApiResponse<null>)?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Resource Service ──────────────────────────────────────────────────────────

export const resourceService = {
  getAll: async (type?: ResourceType, location?: string): Promise<CampusResource[]> => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (location) params.location = location;
    const res = await apiClient.get<ApiResponse<CampusResource[]>>('/resources', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<CampusResource> => {
    const res = await apiClient.get<ApiResponse<CampusResource>>(`/resources/${id}`);
    return res.data.data;
  },

  create: async (resource: Partial<CampusResource>): Promise<CampusResource> => {
    const res = await apiClient.post<ApiResponse<CampusResource>>('/resources', resource);
    return res.data.data;
  },
};

// ─── Reservation Service ───────────────────────────────────────────────────────

export const reservationService = {
  /** POST /api/reservations – Create a new reservation */
  create: async (request: ReservationRequest): Promise<ReservationRecord> => {
    const res = await apiClient.post<ApiResponse<ReservationRecord>>('/reservations', request);
    return res.data.data;
  },

  /** PUT /api/reservations/:id – Update reservation details */
  update: async (id: number, request: ReservationRequest): Promise<ReservationRecord> => {
    const res = await apiClient.put<ApiResponse<ReservationRecord>>(`/reservations/${id}`, request);
    return res.data.data;
  },

  /** GET /api/reservations/user/:userId */
  getByUser: async (userId: string): Promise<ReservationRecord[]> => {
    const res = await apiClient.get<ApiResponse<ReservationRecord[]>>(`/reservations/user/${userId}`);
    return res.data.data;
  },

  /** GET /api/reservations/summary/:userId – Dashboard cards */
  getSummary: async (userId: string): Promise<ReservationSummary> => {
    const res = await apiClient.get<ApiResponse<ReservationSummary>>(`/reservations/summary/${userId}`);
    return res.data.data;
  },

  /** GET /api/reservations – Admin: all with optional filters */
  getAll: async (filters?: {
    status?: ReservationStatus;
    resourceType?: ResourceType;
    date?: string;
  }): Promise<ReservationRecord[]> => {
    const res = await apiClient.get<ApiResponse<ReservationRecord[]>>('/reservations', {
      params: filters,
    });
    return res.data.data;
  },

  /** GET /api/reservations/:id */
  getById: async (id: number): Promise<ReservationRecord> => {
    const res = await apiClient.get<ApiResponse<ReservationRecord>>(`/reservations/${id}`);
    return res.data.data;
  },

  /** PUT /api/reservations/:id/status – Admin update (Approve/Reject/Cancel) */
  updateStatus: async (id: number, update: ReservationStatusUpdate): Promise<ReservationRecord> => {
    const res = await apiClient.put<ApiResponse<ReservationRecord>>(
      `/reservations/${id}/status`, update
    );
    return res.data.data;
  },

  /** DELETE /api/reservations/:id/cancel?userId=... – User cancels own reservation */
  cancelOwn: async (id: number, userId: string): Promise<ReservationRecord> => {
    const res = await apiClient.delete<ApiResponse<ReservationRecord>>(
      `/reservations/${id}/cancel`, { params: { userId } }
    );
    return res.data.data;
  },

  /** DELETE /api/reservations/:id – Admin delete reservation */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/reservations/${id}`);
  },

  /** GET /api/reservations/calendar – Calendar view */
  getCalendar: async (startDate: string, endDate: string): Promise<ReservationRecord[]> => {
    const res = await apiClient.get<ApiResponse<ReservationRecord[]>>('/reservations/calendar', {
      params: { startDate, endDate },
    });
    return res.data.data;
  },
};

// ─── Notification Service ──────────────────────────────────────────────────────

export const notificationService = {
  getByUser: async (userId: string): Promise<UserNotification[]> => {
    const res = await apiClient.get<ApiResponse<UserNotification[]>>(`/notifications/user/${userId}`);
    return res.data.data;
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const res = await apiClient.get<ApiResponse<number>>(`/notifications/user/${userId}/unread-count`);
    return res.data.data;
  },

  markAllRead: async (userId: string): Promise<void> => {
    await apiClient.put(`/notifications/user/${userId}/mark-all-read`);
  },

  markOneRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  deleteNotification: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
