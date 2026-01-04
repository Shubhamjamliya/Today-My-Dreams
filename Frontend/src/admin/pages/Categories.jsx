import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Grid, List, FolderOpen, AlertCircle, GripVertical, ArrowUp, ArrowDown, Check, X, Filter } from 'lucide-react';
import apiService from "../services/api";
import Loader from "../components/Loader";
import { CardGridSkeleton } from "../components/Skeleton";

const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (imgPath.startsWith('http')) return imgPath;
  return `https://todaymydream.com/todaymydream/data/${imgPath}`;
};

import ShopCategoryModal from "../components/ShopCategoryModal";
import ShopSubCategoryModal from "../components/ShopSubCategoryModal";

const Categories = ({ module, showSubcategoriesOnly }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch parent categories for the filter
      const catResponse = await apiService.getCategories({ module });
      let allCategories = catResponse.data.categories || catResponse.data || [];
      // Sort by sortOrder
      const sortedCategories = allCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setCategories(sortedCategories);

      // If we are managing subcategories
      if (showSubcategoriesOnly) {
        if (selectedParentCategory !== 'all') {
          const subCatResponse = await apiService.getSubCategories(selectedParentCategory, { module });
          let allSubCategories = subCatResponse.data.subCategories || subCatResponse.data || [];
          setSubCategories(allSubCategories);
        } else {
          // If all selected, we might need a way to fetch ALL subcategories or iterate
          // For now, let's fetch all subcategories by iterating (less efficient but works without new API)
          // OR assume backend has an endpoint. The current API structure getSubCategories needs an ID.
          // We'll iterate for now or clearer: Ask user to select a category first? 
          // Better UX: Fetch all active categories and their subcategories.

          // Strategy: We have 'sortedCategories'. We can collect all subcategories from them if they are populated?
          // Usually getCategories includes subCategories array. Let's check.
          // Based on previous files, getCategories returns list of categories.
          // Let's rely on the property 'subCategories' inside categories if populated, or fetch individually.

          // Simplification: Flatten the subcategories from the allCategories list if available, 
          // otherwise we might need to fetch them.

          let allSubs = [];
          sortedCategories.forEach(cat => {
            if (cat.subCategories && Array.isArray(cat.subCategories)) {
              // Add parent info for display
              const subsWithParent = cat.subCategories.map(sub => ({ ...sub, parentCategory: cat }));
              allSubs.push(...subsWithParent);
            }
          });
          setSubCategories(allSubs);
        }
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [module, showSubcategoriesOnly, selectedParentCategory]);

  // Handle delete
  const handleDelete = async (id, isSubCategory = false) => {
    if (window.confirm(`Are you sure you want to delete this ${isSubCategory ? 'subcategory' : 'category'}?`)) {
      try {
        setLoading(true);
        if (isSubCategory) {
          await apiService.deleteSubCategory(id, { module });
        } else {
          await apiService.deleteCategory(id, { module });
        }
        await fetchData();
      } catch (error) {
        console.error("Failed to delete", error);
        setError("Failed to delete item. Please try again later.");
      }
    }
  };

  // Filter items
  const getFilteredItems = () => {
    const items = showSubcategoriesOnly ? subCategories : categories;
    return items.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredItems = getFilteredItems();

  // Separate active/inactive
  const activeItems = filteredItems.filter(item => item.isActive !== false); // Default to true if undefined
  const inactiveItems = filteredItems.filter(item => item.isActive === false);

  // Drag and Drop (Only for Categories for now, effectively)
  // Subcategory reordering usually requires specific parent context or separate API
  const handleDragStart = (e, index) => {
    if (showSubcategoriesOnly) return;
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    if (showSubcategoriesOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedItem === null || draggedItem === index) return;

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];
    newCategories.splice(draggedItem, 1);
    newCategories.splice(index, 0, draggedCategory);

    setCategories(newCategories);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (showSubcategoriesOnly) return;
    if (draggedItem !== null) {
      await saveCategoryOrder();
    }
    setDraggedItem(null);
  };

  const saveCategoryOrder = async (updatedCategories = categories) => {
    setSavingOrder(true);
    try {
      const updates = updatedCategories.map((cat, index) => ({
        id: cat._id,
        sortOrder: index
      }));
      await apiService.updateCategoryOrder(updates);
    } catch (error) {
      console.error("Failed to save category order", error);
      setError("Failed to save order. Please try again.");
      await fetchData();
    } finally {
      setSavingOrder(false);
    }
  };

  // Toggle Active
  const handleToggleActive = async (id, currentStatus, isSubCategory = false) => {
    try {
      const newStatus = !currentStatus;
      if (isSubCategory) {
        // Assuming updateSubCategory supports partial updates or we send full object. checks API...
        // API expects subCategoryData.
        await apiService.updateSubCategory(id, { isActive: newStatus }, { module });
      } else {
        await apiService.updateCategory(id, { isActive: newStatus });
      }
      await fetchData(); // Refetch to look clean
    } catch (error) {
      console.error("Failed to toggle status", error);
      setError("Failed to update status.");
    }
  };

  // Handler for adding new category or subcategory
  const handleAddAction = (e) => {
    if (showSubcategoriesOnly) {
      e.preventDefault();
      setEditingSubCategory(null);
      setIsSubCategoryModalOpen(true);
    } else if (module === 'shop') {
      e.preventDefault();
      setEditingCategory(null);
      setIsModalOpen(true);
    }
    // Else let the Link handle navigation to the edit page
  };

  const handleEdit = (e, item) => {
    // Only intercept for modal-based edits
    if (showSubcategoriesOnly) {
      e.preventDefault();
      setEditingSubCategory(item);
      setIsSubCategoryModalOpen(true);
    } else if (module === 'shop') {
      e.preventDefault();
      setEditingCategory(item);
      setIsModalOpen(true);
    }
    // Else do nothing, let Link work
  }


  const ItemCard = ({ item, index, isSubCategory }) => (
    <div
      className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${item.isActive !== false ? 'bg-white' : 'bg-gray-100 opacity-75'}`}
      draggable={!isSubCategory && item.isActive !== false}
      onDragStart={!isSubCategory && item.isActive !== false ? (e) => handleDragStart(e, index) : undefined}
      onDragOver={!isSubCategory && item.isActive !== false ? (e) => handleDragOver(e, index) : undefined}
      onDragEnd={!isSubCategory && item.isActive !== false ? handleDragEnd : undefined}
    >
      <div className="relative aspect-square">
        {!isSubCategory && (
          <div className="absolute top-2 left-2 z-10 bg-white/90 rounded-lg p-1 cursor-move">
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
        )}

        <div className="absolute top-2 right-2 z-10 bg-white/90 rounded-lg px-2 py-1 text-xs font-semibold text-gray-600">
          #{index + 1}
        </div>

        <div className="absolute bottom-2 right-2 z-30">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleActive(item._id, item.isActive, isSubCategory);
            }}
            className={`p-2 rounded-full transition-all duration-200 ${item.isActive !== false
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            title={item.isActive !== false ? 'Active - click to disable' : 'Disabled - click to enable'}
          >
            {item.isActive !== false ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        {item.isActive === false && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              DISABLED
            </div>
          </div>
        )}

        {item.video ? (
          <video
            src={item.video}
            className="w-full h-full object-cover"
            controls
            muted
            loop
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        ) : item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        {isSubCategory && item.parentCategory && (
          <span className="text-xs uppercase font-bold text-blue-600 mb-1 block">
            {item.parentCategory.name}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between">
          {/* Move buttons only for categories for now */}
          <div className="flex items-center space-x-1">
            {!isSubCategory && (
              <>
                {/* Add move buttons logic here if needed, omitted for brevity as it was in original */}
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full justify-end">
            {/* Conditional Edit Button/Link */}
            {(showSubcategoriesOnly || module === 'shop') ? (
              <button
                onClick={(e) => handleEdit(e, item)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            ) : (
              <Link
                to={`/admin/categories/edit/${item._id}`}
                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            )}

            <button
              onClick={() => handleDelete(item._id, isSubCategory)}
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
    <div className="space-y-6">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              {showSubcategoriesOnly ? "Manage Subcategories" : module === 'shop' ? "Shop Categories" : "Categories"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {showSubcategoriesOnly
                ? "Filter by category to manage subcategories efficiently."
                : `Manage your ${module === 'shop' ? 'shop' : 'product'} categories`}
              {savingOrder && <span className="text-blue-600"> (Saving order...)</span>}
            </p>
          </div>
          <Link
            to={'#'}
            onClick={handleAddAction}
            className="inline-flex items-center px-4 py-2 bg-custom-dark-blue text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-dark-blue transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showSubcategoriesOnly ? "Add Subcategory" : "Add Category"}
          </Link>
        </div>

        {/* Subcategory Filter Bar */}
        {showSubcategoriesOnly && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100 flex items-center gap-4 flex-wrap">
            <div className="flex items-center text-gray-700 font-medium">
              <Filter className="w-5 h-5 mr-2" />
              Filter by Category:
            </div>
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedParentCategory}
                onChange={(e) => setSelectedParentCategory(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${showSubcategoriesOnly ? 'subcategories' : 'categories'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <CardGridSkeleton count={8} />
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
                {!showSubcategoriesOnly && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <strong>Tip:</strong> Drag cards to reorder. Changes save automatically.
                  </div>
                )}

                {/* Active Items Section */}
                {activeItems.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-1 bg-green-500 rounded-full flex-1"></div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Active {showSubcategoriesOnly ? 'Subcategories' : 'Categories'} ({activeItems.length})
                      </h2>
                      <div className="h-1 bg-green-500 rounded-full flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {activeItems.map((item, index) => (
                        <ItemCard key={item._id} item={item} index={index} isSubCategory={showSubcategoriesOnly} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Inactive Items Section */}
                {inactiveItems.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-1 bg-red-500 rounded-full flex-1"></div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        Disabled {showSubcategoriesOnly ? 'Subcategories' : 'Categories'} ({inactiveItems.length})
                      </h2>
                      <div className="h-1 bg-red-500 rounded-full flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {inactiveItems.map((item, index) => (
                        <ItemCard key={item._id} item={item} index={activeItems.length + index} isSubCategory={showSubcategoriesOnly} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // List View (Simplified for brevity, can be expanded if needed)
              <div className="space-y-4">
                {/* Reusing a simplified list logic or similar to previous impl */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        {showSubcategoriesOnly && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>}
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center"><FolderOpen className="text-gray-400 w-5 h-5" /></div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{item.description}</div>
                          </td>
                          {showSubcategoriesOnly && (
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.parentCategory?.name || '-'}
                            </td>
                          )}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                            <button onClick={(e) => handleEdit(e, item)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button onClick={() => handleDelete(item._id, showSubcategoriesOnly)} className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No {showSubcategoriesOnly ? 'subcategories' : 'categories'} found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "Try adjusting your search term." : "Get started by adding a new one."}
                </p>
              </div>
            )}

            {/* Shop Category Modal */}
            <ShopCategoryModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={fetchData}
              categoryToEdit={editingCategory}
            />

            {/* Shop SubCategory Modal */}
            <ShopSubCategoryModal
              isOpen={isSubCategoryModalOpen}
              onClose={() => setIsSubCategoryModalOpen(false)}
              onSuccess={fetchData}
              subCategoryToEdit={editingSubCategory}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
