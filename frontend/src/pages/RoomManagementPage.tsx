import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, DoorOpen, Users, Globe, Building2 } from 'lucide-react';
import { roomAPI, organizationAPI } from '../utils/api';
import { Room, Organization } from '../types';
import { useAuth } from '../contexts/AuthContext';

const FACILITY_OPTIONS = [
  'Projector',
  'Whiteboard',
  'AC',
  'Video Conference',
  'Sound System',
  'WiFi',
  'TV Screen',
  'Microphone',
];

export function RoomManagementPage() {
  const { user, isSuperadmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 4,
    facilities: [] as string[],
    isPublic: false,
    organizationId: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
    if (isSuperadmin) {
      fetchOrganizations();
    }
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await roomAPI.getAll();
      if (response.success && response.data) {
        setRooms(response.data.rooms);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizationAPI.getAll();
      if (response.success && response.data) {
        setOrganizations(response.data.organizations);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPG and PNG files are allowed');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let roomId: string;

      if (editingRoom) {
        // Update existing room
        const response = await roomAPI.update(editingRoom.id, formData);
        if (response.success) {
          roomId = editingRoom.id;
        } else {
          setError(response.message || 'Failed to update room');
          return;
        }
      } else {
        // Create new room
        const response = await roomAPI.create(formData);
        if (response.success && response.data) {
          roomId = response.data.room.id;
        } else {
          setError(response.message || 'Failed to create room');
          return;
        }
      }

      // Upload image if selected
      if (imageFile && roomId) {
        const uploadResponse = await roomAPI.uploadImage(roomId, imageFile);
        if (!uploadResponse.success) {
          console.error('Failed to upload image:', uploadResponse.message);
        }
      }

      setIsModalOpen(false);
      setEditingRoom(null);
      setImageFile(null);
      setImagePreview(null);
      fetchRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"?`)) return;

    try {
      const response = await roomAPI.delete(room.id);
      if (response.success) {
        fetchRooms();
      }
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      facilities: room.facilities || [],
      isPublic: room.isPublic,
      organizationId: room.organizationId || '',
    });
    setImagePreview(room.imageUrl || null);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      capacity: 4,
      facilities: [],
      isPublic: false,
      organizationId: isSuperadmin ? '' : (user?.organizationId || ''),
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Rooms</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Create and manage meeting rooms
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus size={20} className="mr-2" />
          Add Room
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Room Image */}
            <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
              {room.imageUrl ? (
                <img
                  src={room.imageUrl?.startsWith('http') ? room.imageUrl : `${import.meta.env.VITE_API_URL || ''}${room.imageUrl}`}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DoorOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  room.isPublic
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                }`}>
                  {room.isPublic ? <><Globe size={12} className="mr-1" /> Public</> : <><Building2 size={12} className="mr-1" /> {room.organization?.name || 'Organization'}</>}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{room.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users size={16} className="mr-1" />
                    Capacity: {room.capacity} people
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditModal(room)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Facilities */}
              <div className="mt-3 flex flex-wrap gap-1">
                {room.facilities?.map((facility) => (
                  <span
                    key={facility}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                  >
                    {facility}
                  </span>
                ))}
              </div>

              {/* Organization */}
              {room.organization && (
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Org: {room.organization.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rooms.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <DoorOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rooms</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new room.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingRoom ? 'Edit Room' : 'Create Room'}
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <DoorOpen className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <Upload size={16} className="mr-2" />
                        Choose File
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        JPG or PNG, max 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Meeting Room A"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Organization (Superadmin only) */}
                {isSuperadmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organization
                    </label>
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Public Room (No Organization)</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Public/Organization status is determined by organization selection above */}

                {/* Facilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facilities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FACILITY_OPTIONS.map((facility) => (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.facilities.includes(facility)
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 border border-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {facility}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    {editingRoom ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
