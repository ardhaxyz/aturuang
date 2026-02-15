import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, DoorOpen, CheckCircle, XCircle } from 'lucide-react';
import { organizationAPI } from '../utils/api';
import { Organization } from '../types';

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await organizationAPI.getAll();
      if (response.success && response.data) {
        setOrganizations(response.data.organizations);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingOrg) {
        const response = await organizationAPI.update(editingOrg.id, formData);
        if (response.success) {
          setIsModalOpen(false);
          setEditingOrg(null);
          fetchOrganizations();
        } else {
          setError(response.message || 'Failed to update organization');
        }
      } else {
        const response = await organizationAPI.create(formData);
        if (response.success) {
          setIsModalOpen(false);
          fetchOrganizations();
        } else {
          setError(response.message || 'Failed to create organization');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to deactivate "${org.name}"?`)) return;

    try {
      const response = await organizationAPI.delete(org.id);
      if (response.success) {
        fetchOrganizations();
      }
    } catch (err) {
      console.error('Failed to delete organization:', err);
    }
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormData({ name: org.name, description: org.description || '' });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingOrg(null);
    setFormData({ name: '', description: '' });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizations</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage organizations and their resources
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus size={20} className="mr-2" />
          Add Organization
        </button>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{org.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      org.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {org.isActive ? (
                        <><CheckCircle size={12} className="mr-1" /> Active</>
                      ) : (
                        <><XCircle size={12} className="mr-1" /> Inactive</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(org)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(org)}
                    className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {org.description && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {org.description}
                </p>
              )}

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <DoorOpen size={16} className="mr-1" />
                  {org._count?.rooms || 0} rooms
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  {org._count?.users || 0} users
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {organizations.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No organizations</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new organization.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {editingOrg ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
