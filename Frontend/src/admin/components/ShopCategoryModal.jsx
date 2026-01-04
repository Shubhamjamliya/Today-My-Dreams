import React, { useState, useEffect } from 'react';
import { X, Upload, ImagePlus, Video, Loader2 } from 'lucide-react';
import apiService from '../services/api';

const ShopCategoryModal = ({ isOpen, onClose, onSuccess, categoryToEdit = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    module: 'shop'
  });
  const [files, setFiles] = useState({
    image: null,
    video: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    image: '',
    video: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name || '',
          description: categoryToEdit.description || '',
          sortOrder: categoryToEdit.sortOrder || 0,
          module: 'shop'
        });
        setPreviewUrls({
          image: categoryToEdit.image || '',
          video: categoryToEdit.video || ''
        });
      } else {
        // Reset for new category
        setFormData({
          name: '',
          description: '',
          sortOrder: 0,
          module: 'shop'
        });
        setPreviewUrls({ image: '', video: '' });
        setFiles({ image: null, video: null });
      }
      setError(null);
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      const reader = new FileReader();
      reader.onload = () => setPreviewUrls(prev => ({ ...prev, [fieldName]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    setPreviewUrls(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('sortOrder', formData.sortOrder);
      data.append('module', 'shop');

      if (files.image) data.append('image', files.image);
      if (files.video) data.append('video', files.video);

      if (categoryToEdit) {
        await apiService.updateCategory(categoryToEdit._id, data);
      } else {
        await apiService.createCategory(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving shop category:", err);
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

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
                {categoryToEdit ? 'Edit Shop Category' : 'Add New Shop Category'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Traditional Wear"
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
                  placeholder="Category description..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {previewUrls.image ? (
                    <div className="relative">
                      <img src={previewUrls.image} alt="Preview" className="h-32 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeFile('image')}
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
                          <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Video (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {previewUrls.video ? (
                    <div className="relative">
                      <video src={previewUrls.video} className="h-32 object-cover rounded" controls />
                      <button
                        type="button"
                        onClick={() => removeFile('video')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">Video up to 50MB</p>
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
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (categoryToEdit ? 'Update' : 'Create')}
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

export default ShopCategoryModal;
