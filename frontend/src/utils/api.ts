import axios from 'axios';
import { ApiResponse, Booking, Room, User } from '../types';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: async (password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/api/auth', { password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/api/me');
    return response.data;
  },
};

export const roomAPI = {
  getAll: async () => {
    const response = await api.get<ApiResponse<{ rooms: Room[] }>>('/api/rooms');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ room: Room }>>(`/api/rooms/${id}`);
    return response.data;
  },
};

export const bookingAPI = {
  getAll: async (params?: {
    roomId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<{ bookings: Booking[] }>>('/api/bookings', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ booking: Booking }>>(`/api/bookings/${id}`);
    return response.data;
  },

  create: async (data: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    bookerName: string;
    bookerEmail?: string;
  }) => {
    const response = await api.post<ApiResponse<{ booking: Booking }>>('/api/bookings', data);
    return response.data;
  },

  approve: async (id: string, action: 'approve' | 'reject') => {
    const response = await api.patch<ApiResponse<{ booking: Booking }>>(`/api/bookings/${id}/approve`, { action });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/bookings/${id}`);
    return response.data;
  },
};

export default api;
