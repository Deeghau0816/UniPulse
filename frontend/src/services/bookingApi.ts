import axios from 'axios';
import type { Booking, BookingRequest, BookingFilters, Resource, BookingConflict } from '../types/booking';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bookingApi = {
  // Get all available resources
  getResources: async (): Promise<Resource[]> => {
    const response = await api.get('/resources');
    return response.data;
  },

  // Get bookings with filters
  getBookings: async (filters?: BookingFilters): Promise<Booking[]> => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },

  // Create new booking request
  createBooking: async (bookingData: BookingRequest): Promise<Booking> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Check for booking conflicts
  checkConflicts: async (bookingData: BookingRequest): Promise<BookingConflict[]> => {
    const response = await api.post('/bookings/check-conflicts', bookingData);
    return response.data;
  },

  // Approve booking (Admin only)
  approveBooking: async (bookingId: string): Promise<Booking> => {
    const response = await api.patch(`/bookings/${bookingId}/approve`);
    return response.data;
  },

  // Reject booking (Admin only)
  rejectBooking: async (bookingId: string, reason: string): Promise<Booking> => {
    const response = await api.patch(`/bookings/${bookingId}/reject`, { reason });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId: string): Promise<Booking> => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },
};
