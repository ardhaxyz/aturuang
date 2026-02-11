import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { bookingAPI } from '../utils/api';
import { Booking } from '../types';

export function AdminPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingAPI.getAll({ status: 'pending' });
      if (response.success && response.data?.bookings) {
        setPendingBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch pending bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const response = await bookingAPI.approve(id, action);
      if (response.success) {
        // Remove from pending list
        setPendingBookings(prev => prev.filter(booking => booking.id !== id));
      }
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-gray-600">
          Review and approve pending room booking requests.
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">
              {pendingBookings.length}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Booking requests awaiting your review
            </p>
          </div>
          <AlertCircle className="h-12 w-12 text-yellow-500" />
        </div>
      </div>

      {/* Pending Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pending Booking Requests</h2>
          <p className="mt-1 text-sm text-gray-600">
            Approve or reject booking requests based on availability and policy.
          </p>
        </div>

        {pendingBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.title}</div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{booking.room?.name}</div>
                          <div className="text-xs text-gray-500">
                            Capacity: {booking.room?.capacity}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.bookerName}</div>
                      <div className="text-sm text-gray-500">{booking.bookerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(booking.id, 'approve')}
                          disabled={processingId === booking.id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {processingId === booking.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleApprove(booking.id, 'reject')}
                          disabled={processingId === booking.id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          {processingId === booking.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">
              No pending booking requests at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Approval Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Approve when:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Room is available at requested time</li>
              <li>• Booking complies with company policies</li>
              <li>• Requestor has provided sufficient information</li>
              <li>• No scheduling conflicts exist</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Reject when:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Time slot is already booked</li>
              <li>• Booking violates company policies</li>
              <li>• Insufficient notice given</li>
              <li>• Requestor has history of no-shows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
