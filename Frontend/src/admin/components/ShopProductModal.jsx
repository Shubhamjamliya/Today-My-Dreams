import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import apiService from '../services/api';

const ShopProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    material: '',
    size: '',
    colour: '',
    category: '',
    subCategory: '',
    utility: '',
    care: '',
    price: '',
    regularPrice: '',
    stock: '',
    module: 'shop'
  });

  const [files, setFiles] = useState({
    mainImage: null,
    image1: null,
    image2: null,
    image3: null
  });

  const [previews, setPreviews] = useState({
    mainImage: '',
    image1: '',
    image2: '',
    image3: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    } else {
      // Reset form on close
      setFormData({
        name: '',
        material: '',
        size: '',
        colour: '',
        category: '',
        subCategory: '',
        utility: '',
        care: '',
        price: '',
        regularPrice: '',
        stock: '',
        module: 'shop'
      });
      setFiles({ mainImage: null, image1: null, image2: null, image3: null });
      setPreviews({ mainImage: '', image1: '', image2: '', image3: '' });
      setSubCategories([]);
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories({ module: 'shop' });
      setCategories(response.data.categories || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await apiService.getSubCategories(categoryId, { module: 'shop' });
      setSubCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'category') {
      setFormData(prev => ({ ...prev, subCategory: '' })); // Reset subcategory
      fetchSubCategories(value);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      await apiService.createProduct(submitData);
      onProductAdded();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please check all fields.');
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Shop Product</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub Category</label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    disabled={!formData.category}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Regular Price *</label>
                  <input
                    type="number"
                    name="regularPrice"
                    required
                    value={formData.regularPrice}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Material *</label>
                  <input
                    type="text"
                    name="material"
                    required
                    value={formData.material}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size *</label>
                  <input
                    type="text"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Colour *</label>
                  <input
                    type="text"
                    name="colour"
                    required
                    value={formData.colour}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Utility *</label>
                <textarea
                  name="utility"
                  required
                  rows={2}
                  value={formData.utility}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Care Instructions *</label>
                <textarea
                  name="care"
                  required
                  rows={2}
                  value={formData.care}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Image Uploads */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Main Image */}
                  <div className="relative">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      {previews.mainImage ? (
                        <img src={previews.mainImage} alt="Main" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <p className="text-xs text-gray-500 pt-1">Main Image *</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'mainImage')} />
                    </label>
                  </div>
                  {/* Additional Images */}
                  {['image1', 'image2', 'image3'].map((field, idx) => (
                    <div key={field} className="relative">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        {previews[field] ? (
                          <img src={previews[field]} alt={`Img ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <p className="text-xs text-gray-500 pt-1">Image {idx + 1}</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, field)} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-dark-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProductModal;
