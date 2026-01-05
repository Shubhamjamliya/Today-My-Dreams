import React, { useEffect, useState } from 'react';
import config from '../config/config';
import { Check, X, Ban, MapPin, Layers, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null); // ID of vendor being edited
  const [assignmentForm, setAssignmentForm] = useState({ cityId: '', categoryIds: [] });
  const token = localStorage.getItem('admin_token');

  const fetchVendors = async () => {
    const res = await fetch(`${config.API_BASE_URL}/api/admin/vendors`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setVendors(data.vendors || []);
  };

  const fetchCities = async () => {
    const res = await fetch(`${config.API_BASE_URL}/api/cities?showAll=true`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCities(data.cities || []);
  };

  const fetchCategories = async () => {
    const res = await fetch(`${config.API_BASE_URL}/api/categories/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => {
    fetchVendors();
    fetchCities();
    fetchCategories();
  }, []);

  const act = async (id, action) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/admin/vendors/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Vendor ${action}ed successfully`);
        fetchVendors();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const startEdit = (vendor) => {
    setEditingAssignment(vendor._id);
    setAssignmentForm({
      cityId: vendor.cityId?._id || vendor.cityId || '',
      categoryIds: vendor.categoryIds?.map(c => c._id || c) || []
    });
  };

  const handleAssign = async (id) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/admin/vendors/${id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assignmentForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Assignment updated');
        setEditingAssignment(null);
        fetchVendors();
      } else {
        toast.error(data.message || 'Assignment failed');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const toggleCategory = (catId) => {
    setAssignmentForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter(id => id !== catId)
        : [...prev.categoryIds, catId]
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
        <div className="text-sm text-gray-500">Manage vendor approvals and service areas</div>
      </div>

      <div className="grid gap-6">
        {vendors.map(v => (
          <div key={v._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{v.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {v.status.toUpperCase()}
                  </span>
                  {v.isApproved ? (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">APPROVED</span>
                  ) : (
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">PENDING APPROVAL</span>
                  )}
                </div>
                <div className="text-gray-600 text-sm space-y-1">
                  <p>Email: <span className="text-gray-900">{v.email}</span></p>
                  <p>Phone: <span className="text-gray-900">{v.phone || 'N/A'}</span></p>
                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Requested Service</p>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="font-medium text-gray-700">{v.cityText || 'No city requested'}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Layers size={14} className="text-gray-400" />
                          <span className="font-medium text-gray-700">{v.categoryText || 'No categories requested'}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current Assignment</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">City: <span className="font-medium">{v.cityId?.name || 'Not Assigned'}</span></p>
                        <p className="text-gray-700">Categories: <span className="font-medium">
                          {v.categoryIds?.length > 0 ? v.categoryIds.map(c => c.name).join(', ') : 'None'}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                {!v.isApproved && (
                  <button onClick={() => act(v._id, 'approve')} className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Check size={18} /> Approve Vendor
                  </button>
                )}

                {editingAssignment === v._id ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Assign City</label>
                      <select
                        className="w-full p-2 text-sm border rounded-lg bg-white"
                        value={assignmentForm.cityId}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, cityId: e.target.value })}
                      >
                        <option value="">Select City</option>
                        {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Assign Categories</label>
                      <div className="max-h-32 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                        {categories.map(c => (
                          <label key={c._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={assignmentForm.categoryIds.includes(c._id)}
                              onChange={() => toggleCategory(c._id)}
                              className="rounded text-blue-600"
                            />
                            {c.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAssign(v._id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                        <Save size={14} /> Save
                      </button>
                      <button onClick={() => setEditingAssignment(null)} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => startEdit(v)} className="w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                    <MapPin size={18} /> {v.cityId ? 'Change Assignment' : 'Assign Area'}
                  </button>
                )}

                <div className="mt-auto flex gap-2">
                  {v.status !== 'blocked' ? (
                    <button onClick={() => act(v._id, 'block')} className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                      <Ban size={16} /> Block
                    </button>
                  ) : (
                    <button onClick={() => act(v._id, 'unblock')} className="flex-1 px-4 py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                      <Check size={16} /> Unblock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {!vendors.length && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No vendors registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;

