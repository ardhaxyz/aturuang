import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Settings, Calendar, ArrowRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { bookingAPI } from '../utils/api';
import { Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function AdminPage() {
  const navigate = useNavigate();
  const { isSuperadmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingAPI.getAll({ limit: 50 });
      if (response.success && response.data?.bookings) {
        const allBookings = response.data.bookings;
        setBookings(allBookings);
        setStats({
          total: allBookings.length,
          pending: allBookings.filter(b => b.status === 'pending').length,
          approved: allBookings.filter(b => b.status === 'approved').length,
          rejected: allBookings.filter(b => b.status === 'rejected').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await bookingAPI.approve(id, action);
      if (response.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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

  // Management cards data
  const managementCards = [
    ...(isSuperadmin ? [{
      title: 'Organizations',
      description: 'Manage organizations and their resources',
      icon: Building2,
      path: '/admin/organizations',
      color: 'bg-purple-500',
      count: null,
    }] : []),
    {
      title: 'Rooms',
      description: 'Manage meeting rooms and facilities',
      icon: Settings,
      path: '/admin/rooms',
      color: 'bg-blue-500',
      count: null,
    },
    {
      title: 'Users',
      description: 'Manage user accounts and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'bg-green-500',
      count: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your organization and approve bookings
        </p>
      </div>

      {/* Management Cards Grid */}
      <div className={`grid gap-6 ${isSuperadmin ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {managementCards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-lg ${card.color} flex items-center justify-center`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Section - Large Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Bookings</h2>
            </div>
            <div className="flex space-x-2 text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                {stats.pending} pending
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                {stats.approved} approved
              </span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p>No bookings found</p>
            </div>
          ) : (
            bookings.slice(0, 10).map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      {getStatusIcon(booking.status)}
                      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white truncate">
                        {booking.title}
                      </span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="truncate">{booking.room?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{booking.date}</span>
                      <span className="mx-2">•</span>
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      By: {booking.bookerName}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {booking.status === 'pending' && (
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(booking.id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(booking.id, 'reject')}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Link */}
        {!isLoading && bookings.length > 10 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
              View all bookings →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
