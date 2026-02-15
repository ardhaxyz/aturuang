// Types untuk Aturuang - Meeting Room Management System

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    rooms: number;
  };
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  imageUrl?: string;
  isPublic: boolean;
  isActive: boolean;
  organizationId?: string;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  bookerName: string;
  bookerEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  room?: Room;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'superadmin' | 'org_admin' | 'user';
  isActive: boolean;
  organizationId?: string;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface BookingFormData {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  bookerName: string;
  bookerEmail?: string;
}

export interface RoomFormData {
  name: string;
  capacity: number;
  facilities: string[];
  isPublic: boolean;
  organizationId?: string;
  image?: File;
}

export interface UserFormData {
  username: string;
  password: string;
  email?: string;
  role: 'superadmin' | 'org_admin' | 'user';
  organizationId?: string;
}

export interface OrganizationFormData {
  name: string;
  description?: string;
  logoUrl?: string;
}
