import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Info } from 'lucide-react';
import { bookingAPI, roomAPI } from '../utils/api';
import { Booking, Room } from '../types';

export function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        roomAPI.getAll(),
        bookingAPI.getAll(),
      ]);

      if (roomsResponse.success && roomsResponse.data?.rooms) {
        setRooms(roomsResponse.data.rooms);
      }

      if (bookingsResponse.success && bookingsResponse.data?.bookings) {
        setBookings(bookingsResponse.data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-l-green-500';
      case 'pending':
        return 'border-l-yellow-500';
      case 'rejected':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatEvents = () => {
    const filteredBookings = bookings.filter(booking => {
      if (selectedRoom !== 'all' && booking.roomId !== selectedRoom) return false;
      if (selectedStatus !== 'all' && booking.status !== selectedStatus) return false;
      return true;
    });

    return filteredBookings.map(booking => {
      const date = new Date(booking.date);
      const [startHour, startMin] = booking.startTime.split(':').map(Number);
      const [endHour, endMin] = booking.endTime.split(':').map(Number);
      
      const startDate = new Date(date);
      startDate.setHours(startHour, startMin, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(endHour, endMin, 0, 0);

      return {
        id: booking.id,
        title: `${booking.title}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor: getStatusColor(booking.status),
        borderColor: getStatusColor(booking.status),
        extendedProps: {
          room: booking.room?.name,
          booker: booking.bookerName,
          status: booking.status,
          email: booking.bookerEmail,
        },
      };
    });
  };

  const handleEventClick = (info: any) => {
    const event = info.event;
    alert(
      `Booking Details:\n\n` +
      `Title: ${event.title}\n` +
      `Room: ${event.extendedProps.room}\n` +
      `Booker: ${event.extendedProps.booker}\n` +
      `Email: ${event.extendedProps.email || 'Not provided'}\n` +
      `Status: ${event.extendedProps.status}\n` +
      `Time: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}\n` +
      `Date: ${event.start.toLocaleDateString()}`
    );
  };

  const handleDateClick = (info: any) => {
    const dateStr = info.dateStr;
    window.location.href = `/book?date=${dateStr}`;
  };

  const changeView = (viewName: string) => {
    setCurrentView(viewName);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(viewName);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar View</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View all bookings in calendar format. Click on events for details, or click on a date to book that day.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Rooms</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh Calendar
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Approved</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Custom Mobile Toolbar */}
        <div className="flex md:hidden border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => changeView('dayGridMonth')}
            className={`flex-1 py-3 text-sm font-medium ${
              currentView === 'dayGridMonth'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => changeView('timeGridWeek')}
            className={`flex-1 py-3 text-sm font-medium ${
              currentView === 'timeGridWeek'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => changeView('timeGridDay')}
            className={`flex-1 py-3 text-sm font-medium ${
              currentView === 'timeGridDay'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Day
          </button>
        </div>

        <div className="p-4 md:p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '', // Hide default view switcher on mobile
            }}
            footerToolbar={{
              right: 'dayGridMonth,timeGridWeek,timeGridDay', // Show on desktop only via CSS
            }}
            events={formatEvents()}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short',
            }}
            titleFormat={{
              year: 'numeric',
              month: 'long',
            }}
            dayHeaderFormat={{
              weekday: 'short',
            }}
          />
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Bookings</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Click on a booking to view details in the calendar.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title & Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date & Time
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
              {bookings.slice(0, 10).map((booking) => (
                <tr 
                  key={booking.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => {
                    const date = new Date(booking.date);
                    if (calendarRef.current) {
                      const calendarApi = calendarRef.current.getApi();
                      calendarApi.gotoDate(date);
                    }
                  }}
                >
                  <td className="px-6 py-4">
                    <div className={`pl-3 border-l-4 ${getStatusBorder(booking.status)}`}>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.room?.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{booking.bookerName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{booking.bookerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'approved' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400 dark:text-blue-300 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Calendar Tips</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Click on any date to create a booking for that day</li>
              <li>• Click on events to view booking details</li>
              <li>• Use the filters above to show only specific rooms or statuses</li>
              <li>• Switch between month, week, and day views</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
