import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, ImagePlus, Video, AlertCircle, CheckCircle, Trash2, Pencil } from 'lucide-react';
import apiService from "../services/api";
import Loader from "../components/Loader";

const EditCategories = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  // State for the main category
  const [category, setCategory] = useState({
    _id: "",
    name: "",
    description: "",
    image: "",
    video: "",
    sortOrder: 0,
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
      apiService.getCategory(id)
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
    apiService.getSubCategories(id)
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
        await apiService.updateSubCategory(editingSubCategoryId, formData);
        showToast("Sub-category updated successfully!");
      } else {
        await apiService.createSubCategory(id, formData);
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
        await apiService.deleteSubCategory(subCategoryId);
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
          className={`relative border-2 border-dashed rounded-lg p-4 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : hasPreview ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          onDrop={(e) => handleDrop(e, fieldName)}
          onDragOver={(e) => handleDragOver(e, fieldName)}
          onDragLeave={(e) => handleDragLeave(e, fieldName)}
        >
          {hasPreview ? (
            <div className="relative">
              {isVideo ? (
                <video src={previewUrls[fieldName]} className="w-full h-48 object-cover rounded-lg" controls />
              ) : (
                <img src={previewUrls[fieldName]} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
              )}
              <button type="button" onClick={() => removeImage(fieldName)} className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 text-gray-400">{isVideo ? <Video className="w-12 h-12" /> : <ImagePlus className="w-12 h-12" />}</div>
              <div className="text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a {isVideo ? 'video' : 'image'}</span>
                  <input type="file" className="sr-only" accept={isVideo ? "video/*" : "image/*"} onChange={(e) => handleFileChange(e, fieldName)} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">{isVideo ? 'Video up to 50MB' : 'Image up to 10MB'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {isNew ? "Add New Category" : "Edit Category"}
            </h1>

            {toast.show && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${toast.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                }`}>
                {toast.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                <span>{toast.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={category.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                    <textarea name="description" value={category.description} onChange={handleChange} rows={4} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={category.sortOrder}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                    <p className="mt-1 text-sm text-gray-500">Lower numbers appear first. Default is 0.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFileInput('image', 'Category Image')}
                  {renderFileInput('video', 'Category Video')}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button type="button" onClick={() => navigate("/admin/categories")} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  {loading && <Loader size="tiny" inline text="" />}
                  <span>{isNew ? "Create Category" : "Update Category"}</span>
                </button>
              </div>
            </form>

            {!isNew && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sub-Categories</h2>

                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingSubCategoryId ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h3>
                  <form onSubmit={handleSubCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-700 text-sm">Name</label>
                      <input type="text" name="name" value={currentSubCategory.name} onChange={handleSubCategoryChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" required />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 text-sm">Description</label>
                      <textarea name="description" value={currentSubCategory.description} onChange={handleSubCategoryChange} rows={3} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" required />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 text-sm">Sub-Category Image</label>
                      <div
                        className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${subCategoryDragOver.image
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
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
                              className="mx-auto h-20 w-20 object-cover rounded-lg"
                            />
                            <div className="flex justify-center space-x-2">
                              <button
                                type="button"
                                onClick={() => removeSubCategoryFile('image')}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImagePlus className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <label htmlFor="subcategory-image-upload" className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-800">Click to upload</span> or drag and drop
                              </label>
                              <input
                                id="subcategory-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSubCategoryFileChange('image', e.target.files[0])}
                                className="hidden"
                              />
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      {editingSubCategoryId && (
                        <button type="button" onClick={handleCancelEdit} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                      )}
                      <button type="submit" disabled={subCategoryLoading} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center">
                        {subCategoryLoading && <Loader size="tiny" inline text="" />}
                        {editingSubCategoryId ? 'Update' : 'Add Sub-Category'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  {subCategories.length > 0 ? (
                    subCategories.map((sub) => (
                      <div key={sub._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          {sub.image && (
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="h-12 w-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{sub.name}</p>
                            <p className="text-sm text-gray-600">{sub.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => handleEditClick(sub)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteSubCategory(sub._id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No sub-categories found. Add one using the form above.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategories;