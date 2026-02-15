import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { bookingAPI, roomAPI } from '../utils/api';
import { Booking, Room } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    bookedToday: 0,
    pendingApprovals: 0,
    activeNow: 0,
  });
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [_rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch rooms
      const roomsResponse = await roomAPI.getAll();
      if (roomsResponse.success && roomsResponse.data?.rooms) {
        setRooms(roomsResponse.data.rooms);
        setStats(prev => ({ ...prev, totalRooms: roomsResponse.data!.rooms.length }));
      }

      // Fetch today's bookings
      const bookingsResponse = await bookingAPI.getAll({
        startDate: today,
        endDate: today,
      });

      if (bookingsResponse.success && bookingsResponse.data?.bookings) {
        const bookings = bookingsResponse.data.bookings;
        setTodayBookings(bookings);

        const bookedToday = bookings.filter(b => b.status === 'approved').length;
        const pendingApprovals = bookings.filter(b => b.status === 'pending').length;
        
        // Check active bookings (current time within booking time)
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const activeNow = bookings.filter(booking => {
          if (booking.status !== 'approved') return false;
          
          const [startHour, startMin] = booking.startTime.split(':').map(Number);
          const [endHour, endMin] = booking.endTime.split(':').map(Number);
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;
          
          return currentTime >= startTime && currentTime <= endTime;
        }).length;

        setStats(prev => ({
          ...prev,
          bookedToday,
          pendingApprovals,
          activeNow,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to Aturuang. View today's schedule and quick stats.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rooms</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Booked Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.bookedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Now</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeNow}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
          <Link
            to="/book"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Book a Room
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/rooms"
            className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">View All Rooms</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">See room capacities and facilities</p>
          </Link>
          <Link
            to="/calendar"
            className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">Calendar View</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View bookings in calendar format</p>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">Admin Panel</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Approve pending bookings</p>
            </Link>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Today's Schedule</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="overflow-x-auto">
          {todayBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Meeting Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Booker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {todayBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {booking.room?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {booking.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {booking.bookerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No bookings today</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by booking a room for today.
              </p>
              <div className="mt-6">
                <Link
                  to="/book"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Book a Room
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
