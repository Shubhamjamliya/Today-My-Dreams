import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { format } from 'date-fns';
import { Trash2, Edit, Plus, X, Check } from 'lucide-react';
import Loader from "../components/Loader";
import { TableSkeleton } from '../components/Skeleton';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    maxUses: '',
    minOrderAmount: '',
    expiryDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCoupons();
      setCoupons(response.data);
    } catch (error) {
      setError('Failed to fetch coupons');
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercentage: '',
      maxUses: '',
      minOrderAmount: '',
      expiryDate: '',
      isActive: true
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await apiService.updateCoupon(editingCoupon._id, formData);
      } else {
        await apiService.createCoupon(formData);
      }
      fetchCoupons();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save coupon');
      console.error('Error saving coupon:', error);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountValue,
      maxUses: coupon.usageLimit,
      minOrderAmount: coupon.minPurchase,
      expiryDate: format(new Date(coupon.endDate), 'yyyy-MM-dd'),
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await apiService.deleteCoupon(id);
      fetchCoupons();
    } catch (error) {
      setError('Failed to delete coupon');
      console.error('Error deleting coupon:', error);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse"></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <TableSkeleton rows={10} cols={7} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Coupon Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage discount coupons for your store.</p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-dark-blue ${showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-custom-dark-blue text-white hover:bg-opacity-90'}`}
        >
          {showForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {showForm ? 'Cancel' : 'Add New Coupon'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-lg border border-red-200">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors uppercase"
                  placeholder="e.g. SUMMER2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g. 20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Uses</label>
                <input
                  type="number"
                  name="maxUses"
                  value={formData.maxUses}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g. 100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g. 500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Set as Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Check className="w-5 h-5 mr-2" />
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    No coupons found. Click "Add New Coupon" to create one.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{coupon.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">{coupon.discountValue}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{coupon.usedCount || 0}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      {coupon.usageLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{coupon.minPurchase}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(coupon.endDate), 'dd MMM, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;