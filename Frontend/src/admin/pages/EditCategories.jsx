import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Upload, X, ImagePlus, Video, AlertCircle, CheckCircle, Trash2, Pencil, Check } from 'lucide-react';
import apiService from "../services/api";
import Loader from "../components/Loader";

const EditCategories = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === "new";

  // Effect to handle initial state for new category from query params
  useEffect(() => {
    if (isNew) {
      const searchParams = new URLSearchParams(location.search);
      const moduleParam = searchParams.get('module');
      if (moduleParam) {
        setCategory(prev => ({ ...prev, module: moduleParam }));
      }
    }
  }, [isNew, location.search]);

  // State for the main category
  const [category, setCategory] = useState({
    _id: "",
    name: "",
    description: "",
    image: "",
    video: "",
    sortOrder: 0,
    module: "service",
  });

  // State for file uploads and previews
  const [files, setFiles] = useState({
    image: null,
    video: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    image: "",
    video: "",
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [dragOver, setDragOver] = useState({
    image: false,
    video: false,
  });

  // State for managing sub-categories
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState({ name: '', description: '', image: '' });
  const [editingSubCategoryId, setEditingSubCategoryId] = useState(null);

  // State for subcategory file uploads
  const [subCategoryFiles, setSubCategoryFiles] = useState({
    image: null,
  });

  const [subCategoryPreviewUrls, setSubCategoryPreviewUrls] = useState({
    image: "",
  });

  const [subCategoryDragOver, setSubCategoryDragOver] = useState({
    image: false,
  });

  // Effect to fetch category and sub-category data on load
  useEffect(() => {
    if (!isNew) {
      // Fetch main category details
      const queryParams = new URLSearchParams(location.search);
      const moduleParam = queryParams.get('module');
      apiService.getCategory(id, { module: moduleParam || category.module })
        .then((response) => {
          const cat = response.data.category || response.data;
          if (cat) {
            setCategory({
              _id: cat._id || cat.id,
              name: cat.name || '',
              description: cat.description || '',
              image: cat.image || '',
              video: cat.video || '',
              sortOrder: cat.sortOrder || 0,
              module: cat.module || 'service',
            });
            setPreviewUrls({ image: cat.image || '', video: cat.video || '' });
          } else {
            showToast("Category not found", "error");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch category", error);
          showToast("Error loading category", "error");
        });

      // Fetch associated sub-categories
      fetchSubCategories();
    }
  }, [id, isNew]);

  // Function to fetch sub-categories for the current category
  const fetchSubCategories = () => {
    if (isNew) return;
    setSubCategoryLoading(true);
    apiService.getSubCategories(id, { module: category.module })
      .then(response => {
        setSubCategories(response.data);
      })
      .catch(error => {
        console.error("Failed to fetch sub-categories", error);
        showToast("Could not load sub-categories", "error");
      })
      .finally(() => {
        setSubCategoryLoading(false);
      });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // --- Main Category Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFile = (file, fieldName) => {
    if (file) {
      let isValid = false;
      if (fieldName === 'image' && file.type.startsWith('image/')) isValid = true;
      if (fieldName === 'video' && file.type.startsWith('video/')) isValid = true;

      if (isValid) {
        setFiles(prev => ({ ...prev, [fieldName]: file }));
        const reader = new FileReader();
        reader.onload = () => setPreviewUrls(prev => ({ ...prev, [fieldName]: reader.result }));
        reader.readAsDataURL(file);
      } else {
        showToast(`Please upload a valid ${fieldName} file`, "error");
      }
    }
  };

  const handleFileChange = (e, fieldName) => handleFile(e.target.files?.[0], fieldName);
  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [fieldName]: false }));
    handleFile(e.dataTransfer.files[0], fieldName);
  };

  const handleDragOver = (e, fieldName) => { e.preventDefault(); setDragOver(prev => ({ ...prev, [fieldName]: true })); };
  const handleDragLeave = (e, fieldName) => { e.preventDefault(); setDragOver(prev => ({ ...prev, [fieldName]: false })); };

  const removeImage = (fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    setPreviewUrls(prev => ({ ...prev, [fieldName]: "" }));
    if (!isNew) {
      setCategory(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!category.name || !category.description) {
      showToast("Please fill all required fields", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', category.name);
    formData.append('description', category.description);
    formData.append('sortOrder', category.sortOrder || 0);
    formData.append('module', category.module || 'service');
    if (files.image) formData.append('image', files.image);
    if (files.video) formData.append('video', files.video);

    try {
      if (isNew) {
        await apiService.createCategory(formData);
        showToast("Category created successfully!");
      } else {
        await apiService.updateCategory(id, formData);
        showToast("Category updated successfully!");
      }
      navigate("/admin/categories");
    } catch (error) {
      console.error("Failed to save category", error);
      showToast(error.response?.data?.message || "Error saving category", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Sub-Category Handlers ---

  const handleSubCategoryChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubCategory(prev => ({ ...prev, [name]: value }));
  };

  // Subcategory file handling functions
  const handleSubCategoryFileChange = (fieldName, file) => {
    if (file) {
      setSubCategoryFiles(prev => ({ ...prev, [fieldName]: file }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSubCategoryPreviewUrls(prev => ({ ...prev, [fieldName]: previewUrl }));
    }
  };

  const handleSubCategoryDragOver = (e, fieldName) => {
    e.preventDefault();
    setSubCategoryDragOver(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleSubCategoryDragLeave = (e, fieldName) => {
    e.preventDefault();
    setSubCategoryDragOver(prev => ({ ...prev, [fieldName]: false }));
  };

  const handleSubCategoryDrop = (e, fieldName) => {
    e.preventDefault();
    setSubCategoryDragOver(prev => ({ ...prev, [fieldName]: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleSubCategoryFileChange(fieldName, files[0]);
    }
  };

  const removeSubCategoryFile = (fieldName) => {
    setSubCategoryFiles(prev => ({ ...prev, [fieldName]: null }));
    setSubCategoryPreviewUrls(prev => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    if (!currentSubCategory.name || !currentSubCategory.description) {
      showToast("Sub-category name and description are required", "error");
      return;
    }
    setSubCategoryLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', currentSubCategory.name);
      formData.append('description', currentSubCategory.description);

      // Add image file if available
      if (subCategoryFiles.image) {
        formData.append('image', subCategoryFiles.image);
      }

      if (editingSubCategoryId) {
        await apiService.updateSubCategory(editingSubCategoryId, formData, { module: category.module });
        showToast("Sub-category updated successfully!");
      } else {
        await apiService.createSubCategory(id, formData, { module: category.module });
        showToast("Sub-category added successfully!");
      }
      handleCancelEdit(); // Reset form
      fetchSubCategories(); // Refresh list
    } catch (error) {
      console.error("Failed to save sub-category", error);
      showToast(error.response?.data?.message || "Error saving sub-category", "error");
    } finally {
      setSubCategoryLoading(false);
    }
  };

  const handleEditClick = (subCategory) => {
    setEditingSubCategoryId(subCategory._id);
    setCurrentSubCategory({ name: subCategory.name, description: subCategory.description, image: subCategory.image });
    setSubCategoryPreviewUrls({ image: subCategory.image || "" });
  };

  const handleCancelEdit = () => {
    setEditingSubCategoryId(null);
    setCurrentSubCategory({ name: '', description: '', image: '' });
    setSubCategoryFiles({ image: null });
    setSubCategoryPreviewUrls({ image: "" });
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    if (window.confirm("Are you sure you want to delete this sub-category? This action cannot be undone.")) {
      try {
        await apiService.deleteSubCategory(subCategoryId, { module: category.module });
        showToast("Sub-category deleted successfully!");
        fetchSubCategories();
      } catch (error) {
        console.error("Failed to delete sub-category", error);
        showToast(error.response?.data?.message || "Error deleting sub-category", "error");
      }
    }
  };

  // --- Render Functions ---

  const renderFileInput = (fieldName, label) => {
    // ... This function remains the same as your original code
    // For brevity, it's collapsed here, but you should keep your full implementation.
    const hasPreview = previewUrls[fieldName] || files[fieldName];
    const isDragging = dragOver[fieldName];
    const isVideo = fieldName === 'video';
    return (
      <div className="col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : hasPreview ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          onDrop={(e) => handleDrop(e, fieldName)}
          onDragOver={(e) => handleDragOver(e, fieldName)}
          onDragLeave={(e) => handleDragLeave(e, fieldName)}
        >
          {hasPreview ? (
            <div className="relative group">
              {isVideo ? (
                <video src={previewUrls[fieldName]} className="w-full h-48 object-cover rounded-lg shadow-sm" controls />
              ) : (
                <img src={previewUrls[fieldName]} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
              )}
              <button
                type="button"
                onClick={() => removeImage(fieldName)}
                className="absolute top-2 right-2 p-2 bg-white text-red-600 rounded-full shadow-md hover:bg-gray-100 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <div className="mx-auto w-12 h-12 text-gray-400">{isVideo ? <Video className="w-12 h-12" /> : <ImagePlus className="w-12 h-12" />}</div>
              <div className="text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-custom-dark-blue hover:text-blue-500">
                  <span>Upload a {isVideo ? 'video' : 'image'}</span>
                  <input type="file" className="sr-only" accept={isVideo ? "video/*" : "image/*"} onChange={(e) => handleFileChange(e, fieldName)} />
                </label>
                <p className="pl-1 text-gray-500">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">{isVideo ? 'Video up to 50MB' : 'Image up to 10MB'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            {isNew ? "Add New Category" : "Edit Category"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isNew ? "Create a new category for your products or services." : `Editing category: ${category.name}`}
          </p>
        </div>
      </div>

      {toast.show && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 border animate-fadeIn ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
          }`}>
          {toast.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={category.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" required placeholder="e.g. Living Room Decor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={category.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" required placeholder="Describe the category..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={category.sortOrder}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first. Default is 0.</p>
              </div>
              {category.module === 'shop' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module <span className="text-red-500">*</span></label>
                  <select
                    name="module"
                    value={category.module}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="service" disabled>Service (Decoration)</option>
                    <option value="shop">Shop (Jewellery, Shoes, etc.)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Category Media</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFileInput('image', 'Category Image')}
            {renderFileInput('video', 'Category Video')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button type="button" onClick={() => navigate("/admin/categories")} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-custom-dark-blue text-white rounded-lg font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-dark-blue transition-colors flex items-center space-x-2 shadow-lg shadow-blue-500/30">
            {loading && <Loader size="tiny" inline text="" />}
            <span>{isNew ? "Create Category" : "Update Category"}</span>
          </button>
        </div>
      </form>

      {!isNew && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sub-Categories</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{subCategories.length} items</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">{editingSubCategoryId ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h3>
                </div>
                <form onSubmit={handleSubCategorySubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" name="name" value={currentSubCategory.name} onChange={handleSubCategoryChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm" required placeholder="Sub-category Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={currentSubCategory.description} onChange={handleSubCategoryChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm" required placeholder="Short description..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div
                      className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-all ${subCategoryDragOver.image
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                      onDragOver={(e) => handleSubCategoryDragOver(e, 'image')}
                      onDragLeave={(e) => handleSubCategoryDragLeave(e, 'image')}
                      onDrop={(e) => handleSubCategoryDrop(e, 'image')}
                    >
                      {subCategoryPreviewUrls.image ? (
                        <div className="space-y-2">
                          <img
                            src={subCategoryPreviewUrls.image}
                            alt="Preview"
                            className="mx-auto h-32 w-full object-cover rounded-lg shadow-sm"
                          />
                          <div className="flex justify-center pt-2">
                            <button
                              type="button"
                              onClick={() => removeSubCategoryFile('image')}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                            >
                              <X className="h-4 w-4 mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 py-2">
                          <ImagePlus className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="text-xs text-gray-600">
                            <label htmlFor="subcategory-image-upload" className="cursor-pointer">
                              <span className="text-custom-dark-blue hover:text-blue-500 font-medium">Upload</span> or drop
                            </label>
                            <input
                              id="subcategory-image-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSubCategoryFileChange('image', e.target.files[0])}
                              className="hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    {editingSubCategoryId && (
                      <button type="button" onClick={handleCancelEdit} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    )}
                    <button type="submit" disabled={subCategoryLoading} className="w-full px-4 py-2 text-sm font-medium text-white bg-custom-dark-blue rounded-lg hover:bg-opacity-90 flex items-center justify-center shadow-md">
                      {subCategoryLoading && <Loader size="tiny" inline text="" />}
                      {editingSubCategoryId ? 'Update' : 'Add Sub-Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {subCategories.length > 0 ? (
                  subCategories.map((sub) => (
                    <div key={sub._id} className="group flex items-start sm:items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start sm:items-center space-x-4">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {sub.image ? (
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImagePlus className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-custom-dark-blue transition-colors">{sub.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{sub.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button onClick={() => handleEditClick(sub)} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteSubCategory(sub._id)} className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <ImagePlus className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No sub-categories yet</h3>
                    <p className="text-sm text-gray-500 mt-1">Get started by creating a new sub-category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCategories;