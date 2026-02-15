import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Settings, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { bookingAPI, organizationAPI, roomAPI } from '../utils/api';
import { Booking, Organization, Room } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboardPage() {
  const { isSuperadmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 10;
  
  // Filters
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedOrg, selectedRoom, currentPage]);

  useEffect(() => {
    // Reset room filter when org changes
    setSelectedRoom('all');
    setCurrentPage(1);
  }, [selectedOrg]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings
      const bookingsResponse = await bookingAPI.getAll({ limit: 1000 });
      if (bookingsResponse.success && bookingsResponse.data?.bookings) {
        const allBookings = bookingsResponse.data.bookings;
        setBookings(allBookings);
        setTotalBookings(allBookings.length);
      }

      // Fetch organizations (for superadmin)
      if (isSuperadmin) {
        const orgsResponse = await organizationAPI.getAll();
        if (orgsResponse.success && orgsResponse.data?.organizations) {
          setOrganizations(orgsResponse.data.organizations);
        }
      }

      // Fetch rooms
      const roomsResponse = await roomAPI.getAll();
      if (roomsResponse.success && roomsResponse.data?.rooms) {
        setRooms(roomsResponse.data.rooms);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by organization
    if (selectedOrg !== 'all') {
      filtered = filtered.filter(b => b.room?.organizationId === selectedOrg || 
        (selectedOrg === 'public' && b.room?.isPublic));
    }

    // Filter by room
    if (selectedRoom !== 'all') {
      filtered = filtered.filter(b => b.roomId === selectedRoom);
    }

    // Paginate
    const start = (currentPage - 1) * bookingsPerPage;
    const end = start + bookingsPerPage;
    setFilteredBookings(filtered.slice(start, end));
    setTotalBookings(filtered.length);
  };

  const handleApprove = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await bookingAPI.approve(id, action);
      if (response.success) {
        // Refresh bookings
        const bookingsResponse = await bookingAPI.getAll({ limit: 1000 });
        if (bookingsResponse.success && bookingsResponse.data?.bookings) {
          setBookings(bookingsResponse.data.bookings);
        }
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

  // Get available rooms based on selected organization
  const getAvailableRooms = () => {
    if (selectedOrg === 'all') {
      return rooms;
    }
    if (selectedOrg === 'public') {
      return rooms.filter(r => r.isPublic);
    }
    return rooms.filter(r => r.organizationId === selectedOrg || r.isPublic);
  };

  const totalPages = Math.ceil(totalBookings / bookingsPerPage);

  // Quick action cards - with dark theme support
  const quickActions = [
    ...(isSuperadmin ? [{
      title: 'Organizations',
      description: 'Manage organizations',
      icon: Building2,
      path: '/admin/organizations',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-200 dark:hover:bg-purple-900/50',
    }] : []),
    {
      title: 'Rooms',
      description: 'Manage meeting rooms',
      icon: Settings,
      path: '/admin/rooms',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-200 dark:hover:bg-blue-900/50',
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      icon: Users,
      path: '/admin/users',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-200 dark:hover:bg-green-900/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions - Top Section */}
      <div className={`grid gap-4 ${isSuperadmin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.path}
              className={`${action.bgColor} ${action.hoverColor} rounded-lg shadow p-4 transition-colors border border-transparent`}
            >
              <div className="flex items-center">
                <div className={`${action.iconColor}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filter Bookings</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Organization Filter - Only for superadmin */}
          {isSuperadmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Organization
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Organizations</option>
                <option value="public">Public Rooms Only</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Room Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => {
                setSelectedRoom(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Rooms</option>
              {getAvailableRooms().map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} {room.isPublic ? '(Public)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Bookings ({totalBookings})
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No bookings found
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {booking.room?.name} • {booking.date} • {booking.startTime} - {booking.endTime}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      By: {booking.bookerName}
                    </div>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(booking.id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(booking.id, 'reject')}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
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

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
