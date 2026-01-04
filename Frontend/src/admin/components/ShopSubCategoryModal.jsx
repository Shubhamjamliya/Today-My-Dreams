import React, { useState, useEffect } from 'react';
import { X, Upload, ImagePlus, Loader2, AlertCircle } from 'lucide-react';
import apiService from '../services/api';

const ShopSubCategoryModal = ({ isOpen, onClose, onSuccess, subCategoryToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: ''
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Reset or Populate form
      if (subCategoryToEdit) {
        setFormData({
          categoryId: subCategoryToEdit.parentCategory?._id || subCategoryToEdit.parentCategory || '',
          name: subCategoryToEdit.name || '',
          description: subCategoryToEdit.description || ''
        });
        setPreviewUrl(subCategoryToEdit.image || '');
        setFile(null); // Reset file input
      } else {
        setFormData({
          categoryId: '',
          name: '',
          description: ''
        });
        setFile(null);
        setPreviewUrl('');
      }
      setError(null);
    }
  }, [isOpen, subCategoryToEdit]);

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      // Fetch shop categories
      const response = await apiService.getCategories({ module: 'shop' });
      const cats = response.data.categories || response.data || [];
      setCategories(cats);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setError("Failed to load parent categories.");
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setError("Please select a parent category.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);

      // Usually valid to change parent category too if API supports it.
      // Assuming create needs it in URL but update might in body or not allowed.
      // Checking apiService for updateSubCategory: it takes ID and Data. And URL is /api/shop/subcategories/:id
      // Does backend allow moving categories? If so, we might need to send categoryId in body.
      // Let's safe-bet send it if API expects it. If not, it will be ignored.
      // Create usually uses categoryId in URL.

      data.append('parentCategory', formData.categoryId);

      if (file) {
        data.append('image', file);
      }

      if (subCategoryToEdit) {
        await apiService.updateSubCategory(subCategoryToEdit._id, data, { module: 'shop' });
      } else {
        await apiService.createSubCategory(formData.categoryId, data, { module: 'shop' });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving subcategory:", err);
      setError(err.response?.data?.message || "Failed to save subcategory");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {subCategoryToEdit ? 'Edit Sub-Category' : 'Add New Sub-Category'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Parent Category Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                {fetchingCategories ? (
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Loading categories...
                  </div>
                ) : (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Sneakers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Sub-category description..."
                ></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="h-32 object-cover rounded" />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

            </form>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || fetchingCategories}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (subCategoryToEdit ? 'Update Sub-Category' : 'Create Sub-Category')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSubCategoryModal;
