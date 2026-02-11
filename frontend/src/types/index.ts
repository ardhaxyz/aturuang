// Types untuk Meeting Room Dashboard

export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  createdAt: string;
  updatedAt: string;
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
  role: 'admin' | 'guest';
  username: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
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
