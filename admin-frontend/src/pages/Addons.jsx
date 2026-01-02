import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Power, PowerOff, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import config from '../config/config';

const Addons = () => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/api/addons`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAddons(data.data);
      } else {
        toast.error('Failed to fetch add-ons');
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      toast.error('Failed to fetch add-ons');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/addons/${id}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchAddons();
      } else {
        toast.error(data.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/addons/${deleteModal.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Add-on deleted successfully');
        fetchAddons();
      } else {
        toast.error(data.message || 'Failed to delete add-on');
      }
    } catch (error) {
      console.error('Error deleting add-on:', error);
      toast.error('Failed to delete add-on');
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading add-ons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add-ons Management</h1>
            <p className="text-gray-600">Manage additional items customers can add to their orders</p>
          </div>
          <Link
            to="/admin/addons/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Add New Add-on
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
            <p className="text-sm text-blue-600 font-medium">Total Add-ons</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{addons.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
            <p className="text-sm text-green-600 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {addons.filter(a => a.isActive).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
            <p className="text-sm text-orange-600 font-medium">Inactive</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {addons.filter(a => !a.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Add-ons Grid */}
      {addons.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No add-ons yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first add-on</p>
          <Link
            to="/admin/addons/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Create Add-on
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addons.map((addon) => (
            <div
              key={addon._id}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 ${
                !addon.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {addon.image ? (
                  <img
                    src={config.fixImageUrl(addon.image)}
                    alt={addon.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x300/e2e8f0/475569?text=Add-on';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={64} className="text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {addon.isActive ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Power size={12} /> Active
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <PowerOff size={12} /> Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{addon.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">₹{addon.price}</p>
                </div>


                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/admin/addons/edit/${addon._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(addon._id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      addon.isActive
                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {addon.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                    {addon.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, id: addon._id })}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this add-on? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, id: null })}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addons;

