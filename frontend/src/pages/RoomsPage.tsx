import React, { useEffect, useState } from 'react';
import { Users, Monitor, Video, Volume2, Thermometer, Wifi } from 'lucide-react';
import { roomAPI } from '../utils/api';
import { Room } from '../types';

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
          setSelectedRoom(response.data.rooms[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'projector':
        return <Monitor className="h-4 w-4" />;
      case 'video conference':
        return <Video className="h-4 w-4" />;
      case 'sound system':
        return <Volume2 className="h-4 w-4" />;
      case 'ac':
        return <Thermometer className="h-4 w-4" />;
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Meeting Rooms</h1>
        <p className="mt-2 text-gray-600">
          Browse available meeting rooms with their capacities and facilities.
        </p>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`bg-white rounded-lg shadow overflow-hidden border-2 transition-all ${
              selectedRoom?.id === room.id ? 'border-primary-500' : 'border-transparent'
            }`}
            onClick={() => setSelectedRoom(room)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Capacity: {room.capacity} people</span>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {room.capacity <= 4 ? 'Small' : room.capacity <= 8 ? 'Medium' : 'Large'}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities:</h4>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {getFacilityIcon(facility)}
                      <span className="ml-1">{facility}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <p>Created: {new Date(room.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1">Last updated: {new Date(room.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Room Details */}
      {selectedRoom && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{selectedRoom.name} - Details</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {selectedRoom.capacity <= 4 ? 'Small Room' : selectedRoom.capacity <= 8 ? 'Medium Room' : 'Large Room'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Room Specifications</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Room ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedRoom.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedRoom.capacity} people</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(selectedRoom.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(selectedRoom.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Facilities</h3>
              <ul className="space-y-3">
                {selectedRoom.facilities.map((facility, index) => (
                  <li key={index} className="flex items-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600 mr-3">
                      {getFacilityIcon(facility)}
                    </span>
                    <span className="text-gray-900">{facility}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                To book this room, go to the "Book Room" page and select "{selectedRoom.name}" from the room dropdown.
                Bookings are subject to approval and availability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Rooms Message */}
      {rooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Contact administrator to add meeting rooms to the system.
          </p>
        </div>
      )}
    </div>
  );
}
