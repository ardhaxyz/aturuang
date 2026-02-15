import { useEffect, useState } from 'react';
import { Users, Monitor, Video, Volume2, Thermometer, Wifi, Globe, Lock, DoorOpen, Plus } from 'lucide-react';
import { roomAPI } from '../utils/api';
import { Room } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function RoomsPage() {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await roomAPI.getAll();
      if (response.success && response.data?.rooms) {
        setRooms(response.data.rooms);
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
        return <Monitor className="h-3 w-3" />;
      case 'video conference':
        return <Video className="h-3 w-3" />;
      case 'sound system':
        return <Volume2 className="h-3 w-3" />;
      case 'ac':
        return <Thermometer className="h-3 w-3" />;
      case 'wifi':
        return <Wifi className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const openRoomModal = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting Rooms</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Browse and book available meeting rooms
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/rooms"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus size={20} className="mr-2" />
            Manage Rooms
          </Link>
        )}
      </div>

      {/* Pinterest-style Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="break-inside-avoid mb-4 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openRoomModal(room)}
          >
            {/* Room Image */}
            <div className="relative">
              {room.imageUrl ? (
                <img
                  src={`${API_URL}${room.imageUrl}`}
                  alt={room.name}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <DoorOpen className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              
              {/* Overlay with capacity badge */}
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                  <Users className="h-3 w-3 mr-1" />
                  {room.capacity}
                </span>
              </div>

              {/* Public/Private badge */}
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                  room.isPublic 
                    ? 'bg-green-500/80 text-white' 
                    : 'bg-blue-500/80 text-white'
                }`}>
                  {room.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  {room.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{room.name}</h3>
              
              {/* Organization name if not public */}
              {!room.isPublic && room.organization && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {room.organization.name}
                </p>
              )}

              {/* Facilities pills */}
              <div className="mt-2 flex flex-wrap gap-1">
                {room.facilities.slice(0, 3).map((facility, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {getFacilityIcon(facility)}
                    <span className="ml-0.5">{facility}</span>
                  </span>
                ))}
                {room.facilities.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    +{room.facilities.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rooms.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <DoorOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rooms available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Contact administrator to add meeting rooms.
          </p>
        </div>
      )}

      {/* Room Detail Modal */}
      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Image */}
            <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
              {selectedRoom.imageUrl ? (
                <img
                  src={`${API_URL}${selectedRoom.imageUrl}`}
                  alt={selectedRoom.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DoorOpen className="h-24 w-24 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.name}</h2>
                  <div className="mt-2 flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                      {selectedRoom.capacity} people
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedRoom.isPublic 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {selectedRoom.isPublic ? <><Globe size={12} className="mr-1" /> Public</> : <><Lock size={12} className="mr-1" /> Private</>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organization */}
              {selectedRoom.organization && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Organization:</span> {selectedRoom.organization.name}
                </div>
              )}

              {/* Facilities */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    >
                      {getFacilityIcon(facility)}
                      <span className="ml-1">{facility}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/book"
                state={{ roomId: selectedRoom.id }}
                onClick={() => setIsModalOpen(false)}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Book This Room
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
