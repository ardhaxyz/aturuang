import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Mail, AlertCircle, X, CheckCircle } from 'lucide-react';
import { bookingAPI, roomAPI } from '../utils/api';
import { Room } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function BookPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperadmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.roomId || !formData.title || !formData.bookerName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }
    
    // Show confirmation modal
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
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

  // Group rooms by type
  // Public rooms: accessible by all users
  // Organization rooms: only accessible by users from that organization
  const publicRooms = rooms.filter(r => r.isPublic);

  // For regular users: only show their org's rooms
  // For admin/superadmin: show ALL organization rooms
  const orgRooms = rooms.filter(r => !r.isPublic && r.organizationId === user?.organizationId);
  const otherOrgRooms = (isAdmin || isSuperadmin)
    ? rooms.filter(r => !r.isPublic && r.organizationId !== user?.organizationId)
    : [];

  const renderRoomOption = (room: Room) => (
    <option key={room.id} value={room.id}>
      {room.name} (Capacity: {room.capacity})
      {room.isPublic ? ' - Public' : ` - ${room.organization?.name || 'Organization'}`}
    </option>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book a Meeting Room</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Fill out the form below to book a meeting room. Your booking will be pending until approved by an admin.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Booking Form</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-green-400 dark:text-green-300" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">{success}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Room Selection */}
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Users className="inline-block h-4 w-4 mr-1" />
              Select Room *
            </label>
            <select
              id="roomId"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Select a room</option>

              {/* Public Rooms - accessible by all */}
              {publicRooms.length > 0 && (
                <optgroup label="Public Rooms (All Users)">
                  {publicRooms.map(renderRoomOption)}
                </optgroup>
              )}

              {/* Organization Rooms */}
              {orgRooms.length > 0 && (
                <optgroup label={`${user?.organization?.name || 'Your Organization'}`}>
                  {orgRooms.map(renderRoomOption)}
                </optgroup>
              )}

              {/* Other Organization Rooms (admin only) */}
              {otherOrgRooms.length > 0 && (
                <optgroup label="Other Organization Rooms">
                  {otherOrgRooms.map(renderRoomOption)}
                </optgroup>
              )}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="inline-block h-4 w-4 mr-1" />
                Start Time *
              </label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="inline-block h-4 w-4 mr-1" />
                End Time *
              </label>
              <select
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {/* Booker Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bookerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="bookerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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

          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
              <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="mt-3 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Confirm Your Booking
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2 text-left">
                      <p><strong>Room:</strong> {rooms.find(r => r.id === formData.roomId)?.name}</p>
                      <p><strong>Date:</strong> {formData.date}</p>
                      <p><strong>Time:</strong> {formData.startTime} - {formData.endTime}</p>
                      <p><strong>Title:</strong> {formData.title}</p>
                      <p><strong>Booker:</strong> {formData.bookerName}</p>
                    </div>
                  </div>
                  <div className="items-center px-4 py-3 flex justify-center space-x-4">
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium rounded-md w-24 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary-600 text-white text-base font-medium rounded-md w-24 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : 'Confirm'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Booking Guidelines */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">Booking Guidelines</h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Public rooms are available to ALL users</li>
          <li>• Organization rooms are only available to your organization</li>
          <li>• Bookings are subject to approval by your organization admin</li>
          <li>• You can view your booking status in the Dashboard or Calendar</li>
          <li>• Please cancel bookings you no longer need</li>
          <li>• Contact your organization admin for any issues</li>
        </ul>
      </div>
    </div>
  );
}
