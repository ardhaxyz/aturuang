import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Mail, AlertCircle } from 'lucide-react';
import { bookingAPI, roomAPI } from '../utils/api';
import { Room } from '../types';

export function BookPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    roomId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    title: '',
    bookerName: '',
    bookerEmail: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await roomAPI.getAll();
      if (response.success && response.data?.rooms) {
        setRooms(response.data.rooms);
        if (response.data.rooms.length > 0) {
          setFormData(prev => ({ ...prev, roomId: response.data!.rooms[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.roomId || !formData.title || !formData.bookerName) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.startTime >= formData.endTime) {
        throw new Error('End time must be after start time');
      }

      const response = await bookingAPI.create(formData);
      
      if (response.success) {
        setSuccess('Booking created successfully! It is now pending approval.');
        setFormData({
          roomId: rooms[0]?.id || '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          title: '',
          bookerName: '',
          bookerEmail: '',
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.conflict) {
        const conflict = err.response.data.conflict;
        setError(`Time slot conflict with existing booking: ${conflict.title} (${conflict.startTime}-${conflict.endTime})`);
      } else {
        setError(err.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book a Meeting Room</h1>
        <p className="mt-2 text-gray-600">
          Fill out the form below to book a meeting room. Your booking will be pending until approved by an admin.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Booking Form</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Room Selection */}
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
              <Users className="inline-block h-4 w-4 mr-1" />
              Select Room *
            </label>
            <select
              id="roomId"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.capacity}) - {room.facilities.join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                <Calendar className="inline-block h-4 w-4 mr-1" />
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                <Clock className="inline-block h-4 w-4 mr-1" />
                Start Time *
              </label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                <Clock className="inline-block h-4 w-4 mr-1" />
                End Time *
              </label>
              <select
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meeting Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Meeting Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Team Meeting, Client Presentation"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {/* Booker Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bookerName" className="block text-sm font-medium text-gray-700">
                Your Name *
              </label>
              <input
                type="text"
                id="bookerName"
                name="bookerName"
                value={formData.bookerName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="bookerEmail" className="block text-sm font-medium text-gray-700">
                <Mail className="inline-block h-4 w-4 mr-1" />
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="bookerEmail"
                name="bookerEmail"
                value={formData.bookerEmail}
                onChange={handleChange}
                placeholder="john@example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>

      {/* Booking Guidelines */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Booking Guidelines</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Bookings are subject to approval by an administrator</li>
          <li>• You will receive email notification when your booking is approved (if email provided)</li>
          <li>• Maximum booking duration is 4 hours</li>
          <li>• Bookings can be made up to 30 days in advance</li>
          <li>• Please cancel bookings you no longer need</li>
          <li>• Contact administrator for recurring bookings</li>
        </ul>
      </div>
    </div>
  );
}
