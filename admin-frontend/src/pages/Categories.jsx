import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Grid, List, FolderOpen, Loader2, AlertCircle, GripVertical, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import apiService from "../services/api";

const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (imgPath.startsWith('http')) return imgPath;
  return `https://decoryy-xmqa.onrender.com/decoryy/data/${imgPath}`;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Fetch all categories from backend API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCategories();
      // Sort by sortOrder
      const sortedCategories = (response.data.categories || []).sort((a, b) =>
        (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Delete category by id
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setLoading(true);
        await apiService.deleteCategory(id);
        await fetchCategories();
      } catch (error) {
        console.error("Failed to delete category", error);
        setError("Failed to delete category. Please try again later.");
      }
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate active and inactive categories
  const activeCategories = filteredCategories.filter(category => category.isActive);
  const inactiveCategories = filteredCategories.filter(category => !category.isActive);

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedItem === null || draggedItem === index) return;

    // Reorder the array
    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];
    newCategories.splice(draggedItem, 1);
    newCategories.splice(index, 0, draggedCategory);

    setCategories(newCategories);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem !== null) {
      await saveCategoryOrder();
    }
    setDraggedItem(null);
  };

  // Move category up or down
  const moveCategory = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[newIndex];
    newCategories[newIndex] = temp;

    setCategories(newCategories);
    await saveCategoryOrder(newCategories);
  };

  // Save the new order to backend
  const saveCategoryOrder = async (updatedCategories = categories) => {
    setSavingOrder(true);
    try {
      // Update sortOrder for all categories based on their position
      const updates = updatedCategories.map((cat, index) => ({
        id: cat._id,
        sortOrder: index
      }));

      await apiService.updateCategoryOrder(updates);
    } catch (error) {
      console.error("Failed to save category order", error);
      setError("Failed to save order. Please try again.");
      // Reload categories to reset to previous state
      await fetchCategories();
    } finally {
      setSavingOrder(false);
    }
  };

  // Toggle category active status
  const handleToggleActive = async (categoryId, currentStatus) => {
    try {
      console.log('Toggling category:', categoryId, 'from', currentStatus, 'to', !currentStatus);
      const newStatus = !currentStatus;
      console.log('Sending to API:', { isActive: newStatus, type: typeof newStatus });
      const response = await apiService.updateCategory(categoryId, { isActive: newStatus });
      console.log('Update response:', response);

      // Update local state
      setCategories(prev =>
        prev.map(cat =>
          cat._id === categoryId
            ? { ...cat, isActive: newStatus }
            : cat
        )
      );
      console.log('Category status updated successfully');

      // Show success message
      const categoryName = categories.find(cat => cat._id === categoryId)?.name || 'Category';
      setError(null); // Clear any previous errors
      // You could add a success toast here if you have a toast system
    } catch (error) {
      console.error("Failed to toggle category status", error);
      setError("Failed to update category status. Please try again.");
    }
  };

  const CategoryCard = ({ category, index }) => (
    <div
      className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${category.isActive ? 'bg-white' : 'bg-gray-100 opacity-75'
        }`}
      draggable={category.isActive}
      onDragStart={category.isActive ? (e) => handleDragStart(e, index) : undefined}
      onDragOver={category.isActive ? (e) => handleDragOver(e, index) : undefined}
      onDragEnd={category.isActive ? handleDragEnd : undefined}
    >
      <div className="relative aspect-square">
        <div className="absolute top-2 left-2 z-10 bg-white/90 rounded-lg p-1 cursor-move">
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
        <div className="absolute top-2 right-2 z-10 bg-white/90 rounded-lg px-2 py-1 text-xs font-semibold text-gray-600">
          #{index + 1}
        </div>
        <div className="absolute bottom-2 right-2 z-30">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked for category:', category._id, 'isActive:', category.isActive);
              handleToggleActive(category._id, category.isActive);
            }}
            className={`p-2 rounded-full transition-all duration-200 ${category.isActive
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            title={category.isActive ? 'Category is active - click to disable' : 'Category is disabled - click to enable'}
          >
            {category.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
        {!category.isActive && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              DISABLED
            </div>
          </div>
        )}
        {category.video ? (
          <video
            src={category.video}
            className="w-full h-full object-cover"
            controls
            muted
            loop
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        ) : category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{category.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => moveCategory(index, 'up')}
              disabled={index === 0}
              className="text-gray-600 hover:text-blue-600 p-1 rounded hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveCategory(index, 'down')}
              disabled={index === categories.length - 1}
              className="text-gray-600 hover:text-blue-600 p-1 rounded hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/categories/edit/${category._id}`}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>
            <button
              onClick={() => handleDelete(category._id)}
              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your product categories {savingOrder && <span className="text-blue-600">(Saving order...)</span>}
            </p>
          </div>
          <Link
            to="/admin/categories/edit/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Link>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Categories Grid/List */}
        {!loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <div>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <strong>Tip:</strong> Drag cards to reorder, or use the arrow buttons. Changes save automatically.
                </div>

                {/* Active Categories Section */}
                {activeCategories.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-1 bg-green-500 rounded-full flex-1"></div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Active Categories ({activeCategories.length})
                      </h2>
                      <div className="h-1 bg-green-500 rounded-full flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {activeCategories.map((category, index) => (
                        <CategoryCard key={category._id} category={category} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Inactive Categories Section */}
                {inactiveCategories.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-1 bg-red-500 rounded-full flex-1"></div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        Disabled Categories ({inactiveCategories.length})
                      </h2>
                      <div className="h-1 bg-red-500 rounded-full flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {inactiveCategories.map((category, index) => (
                        <CategoryCard key={category._id} category={category} index={activeCategories.length + index} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Active Categories Table */}
                {activeCategories.length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-green-50 border-b border-green-200 px-6 py-3">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Active Categories ({activeCategories.length})
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeCategories.map((category, index) => (
                            <tr key={category._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                                  <button
                                    onClick={() => moveCategory(index, 'up')}
                                    disabled={index === 0}
                                    className="text-gray-600 hover:text-blue-600 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move up"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => moveCategory(index, 'down')}
                                    disabled={index === activeCategories.length - 1}
                                    className="text-gray-600 hover:text-blue-600 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move down"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {category.video ? (
                                      <video
                                        src={category.video}
                                        className="h-10 w-10 rounded-lg object-cover"
                                        controls
                                        muted
                                        loop
                                        preload="metadata"
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    ) : category.image ? (
                                      <img
                                        className="h-10 w-10 rounded-lg object-cover"
                                        src={category.image}
                                        alt={category.name}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 line-clamp-2">{category.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleToggleActive(category._id, category.isActive)}
                                    className="p-1 rounded-full transition-all duration-200 bg-green-500 hover:bg-green-600 text-white"
                                    title="Category is active - click to disable"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <Link
                                    to={`/admin/categories/edit/${category._id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(category._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Inactive Categories Table */}
                {inactiveCategories.length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        Disabled Categories ({inactiveCategories.length})
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inactiveCategories.map((category, index) => (
                            <tr key={category._id} className="hover:bg-gray-50 opacity-75">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-semibold text-gray-600">#{activeCategories.length + index + 1}</span>
                                  <div className="flex items-center space-x-1 opacity-50">
                                    <ArrowUp className="w-4 h-4 text-gray-400" />
                                    <ArrowDown className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {category.video ? (
                                      <video
                                        src={category.video}
                                        className="h-10 w-10 rounded-lg object-cover"
                                        controls
                                        muted
                                        loop
                                        preload="metadata"
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    ) : category.image ? (
                                      <img
                                        className="h-10 w-10 rounded-lg object-cover"
                                        src={category.image}
                                        alt={category.name}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 line-clamp-2">{category.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Disabled
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('List button clicked for category:', category._id, 'isActive:', category.isActive);
                                      handleToggleActive(category._id, category.isActive);
                                    }}
                                    className="p-1 rounded-full transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
                                    title="Category is disabled - click to enable"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <Link
                                    to={`/admin/categories/edit/${category._id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(category._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "Try adjusting your search term." : "Get started by adding a new category."}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Link
                      to="/admin/categories/edit/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Category
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Show message when no disabled categories */}
            {activeCategories.length > 0 && inactiveCategories.length === 0 && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">All categories are currently active!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  No categories are disabled. All categories and their products are visible to customers.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
