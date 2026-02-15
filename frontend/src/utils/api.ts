import axios from 'axios';
import { ApiResponse, Booking, Room, User, Organization } from '../types';

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
  login: async (username: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', { username, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.patch<ApiResponse<null>>('/api/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

export const organizationAPI = {
  getAll: async () => {
    const response = await api.get<ApiResponse<{ organizations: Organization[] }>>('/api/organizations');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ organization: Organization }>>(`/api/organizations/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; logoUrl?: string }) => {
    const response = await api.post<ApiResponse<{ organization: Organization }>>('/api/organizations', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; description?: string; logoUrl?: string; isActive?: boolean }) => {
    const response = await api.put<ApiResponse<{ organization: Organization }>>(`/api/organizations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/organizations/${id}`);
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await api.get<ApiResponse<{ totalRooms: number; totalUsers: number; totalBookings: number; pendingApprovals: number }>>(`/api/organizations/${id}/stats`);
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

  create: async (data: {
    name: string;
    capacity: number;
    facilities?: string[];
    isPublic?: boolean;
    organizationId?: string;
    imageUrl?: string;
  }) => {
    const response = await api.post<ApiResponse<{ room: Room }>>('/api/rooms', data);
    return response.data;
  },

  update: async (id: string, data: {
    name?: string;
    capacity?: number;
    facilities?: string[];
    isPublic?: boolean;
    isActive?: boolean;
    organizationId?: string;
    imageUrl?: string;
  }) => {
    const response = await api.put<ApiResponse<{ room: Room }>>(`/api/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/rooms/${id}`);
    return response.data;
  },

  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post<ApiResponse<{ imageUrl: string }>>(`/api/rooms/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/rooms/${id}/image`);
    return response.data;
  },
};

export const userAPI = {
  getAll: async () => {
    const response = await api.get<ApiResponse<{ users: User[] }>>('/api/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ user: User }>>(`/api/users/${id}`);
    return response.data;
  },

  create: async (data: {
    username: string;
    password: string;
    email?: string;
    role: string;
    organizationId?: string;
  }) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/api/users', data);
    return response.data;
  },

  update: async (id: string, data: {
    username?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    organizationId?: string;
  }) => {
    const response = await api.put<ApiResponse<{ user: User }>>(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/users/${id}`);
    return response.data;
  },

  resetPassword: async (id: string, newPassword: string) => {
    const response = await api.post<ApiResponse<null>>(`/api/users/${id}/reset-password`, { newPassword });
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

  revertToPending: async (id: string) => {
    const response = await api.patch<ApiResponse<{ booking: Booking }>>(`/api/bookings/${id}/pending`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/bookings/${id}`);
    return response.data;
  },
};

export const settingsAPI = {
  getAll: async () => {
    const response = await api.get<ApiResponse<{
      welcomeTitle: string;
      welcomeEmoji: string;
      welcomeSubtitle: string;
      welcomeDescription: string;
    }>>('/api/settings');
    return response.data;
  },

  update: async (data: {
    welcomeTitle: string;
    welcomeEmoji: string;
    welcomeSubtitle: string;
    welcomeDescription: string;
  }) => {
    const response = await api.put<ApiResponse<{
      welcomeTitle: string;
      welcomeEmoji: string;
      welcomeSubtitle: string;
      welcomeDescription: string;
    }>>('/api/settings', data);
    return response.data;
  },
};

export default api;
