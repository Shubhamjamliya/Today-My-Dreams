import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import { TableSkeleton } from '../components/Skeleton';
import { Search, Plus, Edit2, Trash2, Package, Download, X, Check, Grid, Layers, Image as ImageIcon, Power, ChevronDown, ChevronRight, Link as LinkIcon, Copy } from 'lucide-react';
import config from '../config/config';

const API_URL = config.API_URLS.CITIES;
const PRODUCTS_API = config.API_URLS.PRODUCTS;
const CATEGORIES_API = config.API_URLS.CATEGORIES;
const HERO_CAROUSEL_API = config.API_URLS.HERO_CAROUSEL;

const Cities = () => {
    const [cities, setCities] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [allCarouselItems, setAllCarouselItems] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newCity, setNewCity] = useState({ name: '', state: 'Bihar', contactNumber: '+917739873442' });
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ name: '', state: '', contactNumber: '' });

    const [selectedCity, setSelectedCity] = useState(null);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const [activeTab, setActiveTab] = useState('products'); // products, categories, subcategories, carousel

    const [cityProducts, setCityProducts] = useState([]);
    const [cityCategories, setCityCategories] = useState([]);
    const [citySubCategories, setCitySubCategories] = useState([]);
    const [cityCarouselItems, setCityCarouselItems] = useState([]);

    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [importSourceCity, setImportSourceCity] = useState('');
    const [importType, setImportType] = useState('all'); // 'all', 'products', 'categories', 'subcategories', 'carousel'

    // State for collapsible category/subcategory view
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedSubCategories, setExpandedSubCategories] = useState({});

    // Edit product state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editProductData, setEditProductData] = useState({
        name: '',
        price: '',
        regularPrice: '',
        material: '',
        size: '',
        colour: '',
        utility: '',
        care: '',
        included: [],
        excluded: [],
        stock: '',
        inStock: true,
        codAvailable: true,
        isBestSeller: false,
        isTrending: false,
        isMostLoved: false
    });

    // Copied link state
    const [copiedCityId, setCopiedCityId] = useState(null);

    const fetchCities = async () => {
        setLoading(true);
        try {
            // Admin should see all cities including inactive ones
            const res = await axios.get(`${API_URL}?showAll=true`);
            setCities(res.data.cities || []);
        } catch {
            setError('Failed to fetch cities');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllData = async () => {
        try {
            const [productsRes, categoriesRes, carouselRes] = await Promise.all([
                axios.get(`${PRODUCTS_API}?limit=1000`),
                axios.get(CATEGORIES_API),
                axios.get(HERO_CAROUSEL_API)
            ]);

            // Products API returns an array directly or { products: [] }
            const products = Array.isArray(productsRes.data)
                ? productsRes.data
                : (productsRes.data?.products || []);
            setAllProducts(products);

            const categories = categoriesRes.data.categories || categoriesRes.data || [];
            setAllCategories(Array.isArray(categories) ? categories : []);

            // Extract subcategories from nested categories
            const subCats = [];
            if (Array.isArray(categories)) {
                categories.forEach(cat => {
                    if (cat.subCategories && Array.isArray(cat.subCategories)) {
                        subCats.push(...cat.subCategories);
                    }
                });
            }
            setAllSubCategories(subCats);

            // Carousel API returns an array directly or { items: [] }
            const carouselItems = Array.isArray(carouselRes.data)
                ? carouselRes.data
                : (carouselRes.data?.items || []);
            setAllCarouselItems(carouselItems);
        } catch (error) {
            console.error('Error fetching all data:', error);
            setError('Failed to fetch data');
        }
    };

    const fetchCityData = async (cityId) => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes, subCategoriesRes, carouselRes] = await Promise.all([
                axios.get(`${API_URL}/${cityId}/products`),
                axios.get(`${API_URL}/${cityId}/categories`),
                axios.get(`${API_URL}/${cityId}/subcategories`),
                axios.get(`${API_URL}/${cityId}/carousel`)
            ]);

            setCityProducts(productsRes.data.products || []);
            setCityCategories(categoriesRes.data.categories || []);
            setCitySubCategories(subCategoriesRes.data.subCategories || []);
            setCityCarouselItems(carouselRes.data.items || []);
        } catch {
            setError('Failed to fetch city data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
        fetchAllData();
    }, []);

    const handleAddCity = async (e) => {
        e.preventDefault();
        if (!newCity.name.trim()) return;
        setLoading(true);
        try {
            await axios.post(API_URL, newCity);
            setNewCity({ name: '', state: 'Bihar', contactNumber: '+917739873442' });
            fetchCities();
        } catch {
            setError('Failed to add city');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCity = async (id) => {
        if (!window.confirm('Delete this city? This will remove it from all products, categories, and content.')) return;
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchCities();
        } catch {
            setError('Failed to delete city');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCity = async (id) => {
        setEditId(id);
        const city = cities.find(c => c._id === id);
        setEditData({
            name: city?.name || '',
            state: city?.state || 'Bihar',
            contactNumber: city?.contactNumber || '+917739873442'
        });
    };

    const handleUpdateCity = async (e) => {
        e.preventDefault();
        if (!editData.name.trim()) return;
        setLoading(true);
        try {
            await axios.put(`${API_URL}/${editId}`, editData);
            setEditId(null);
            setEditData({ name: '', state: '', contactNumber: '' });
            fetchCities();
        } catch {
            setError('Failed to update city');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCityStatus = async (id) => {
        setLoading(true);
        try {
            const res = await axios.patch(`${API_URL}/${id}/toggle-status`);
            alert(res.data.message || 'City status updated');
            fetchCities();
        } catch {
            setError('Failed to toggle city status');
        } finally {
            setLoading(false);
        }
    };

    const handleManageContent = (city) => {
        setSelectedCity(city);
        fetchCityData(city._id);
        setShowManageModal(true);
        setActiveTab('products');
    };

    const handleImportContent = (city) => {
        setSelectedCity(city);
        setShowImportModal(true);
    };

    const handleAddItemsToCity = async () => {
        if (selectedItems.length === 0) {
            alert('Please select at least one item');
            return;
        }

        setLoading(true);
        try {
            let endpoint = '';
            let dataKey = '';

            switch (activeTab) {
                case 'products':
                    endpoint = `${API_URL}/${selectedCity._id}/products`;
                    dataKey = 'productIds';
                    break;
                case 'categories':
                    endpoint = `${API_URL}/${selectedCity._id}/categories`;
                    dataKey = 'categoryIds';
                    break;
                case 'subcategories':
                    endpoint = `${API_URL}/${selectedCity._id}/subcategories`;
                    dataKey = 'subCategoryIds';
                    break;
                case 'carousel':
                    endpoint = `${API_URL}/${selectedCity._id}/carousel`;
                    dataKey = 'itemIds';
                    break;
            }

            const response = await axios.post(endpoint, { [dataKey]: selectedItems });

            // Show detailed message for categories
            if (activeTab === 'categories' && response.data.subCategoriesAdded) {
                alert(`Categories added successfully!\n${response.data.categoriesAdded} categories + ${response.data.subCategoriesAdded} subcategories auto-imported`);
            } else {
                alert(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} added successfully!`);
            }

            setSelectedItems([]);
            fetchCityData(selectedCity._id);
            fetchCities();
        } catch {
            setError(`Failed to add ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItemFromCity = async (itemId) => {
        // Special warning for categories
        const confirmMessage = activeTab === 'categories'
            ? 'Remove this category from city? Note: Its subcategories will also be removed automatically.'
            : `Remove this ${activeTab.slice(0, -1)} from city?`;

        if (!window.confirm(confirmMessage)) return;

        setLoading(true);
        try {
            let endpoint = '';
            let dataKey = '';

            switch (activeTab) {
                case 'products':
                    endpoint = `${API_URL}/${selectedCity._id}/products`;
                    dataKey = 'productIds';
                    break;
                case 'categories':
                    endpoint = `${API_URL}/${selectedCity._id}/categories`;
                    dataKey = 'categoryIds';
                    break;
                case 'subcategories':
                    endpoint = `${API_URL}/${selectedCity._id}/subcategories`;
                    dataKey = 'subCategoryIds';
                    break;
                case 'carousel':
                    endpoint = `${API_URL}/${selectedCity._id}/carousel`;
                    dataKey = 'itemIds';
                    break;
            }

            const response = await axios.delete(endpoint, { data: { [dataKey]: [itemId] } });

            // Show feedback for category removal
            if (activeTab === 'categories' && response.data.subCategoriesRemoved) {
                alert(`Category removed! (${response.data.subCategoriesRemoved} subcategories also removed)`);
            }

            fetchCityData(selectedCity._id);
            fetchCities();
        } catch {
            setError(`Failed to remove ${activeTab.slice(0, -1)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!importSourceCity) {
            alert('Please select a source city');
            return;
        }

        setLoading(true);
        try {
            let endpoint = '';
            let successMessage = '';

            if (importType === 'all') {
                endpoint = `${API_URL}/${selectedCity._id}/import-all`;
                const res = await axios.post(endpoint, { sourceCityId: importSourceCity });
                successMessage = `Successfully imported:\n• ${res.data.counts.products} products\n• ${res.data.counts.categories} categories\n• ${res.data.counts.subCategories} subcategories\n• ${res.data.counts.carouselItems} carousel items`;
            } else {
                endpoint = `${API_URL}/${selectedCity._id}/import`;
                const res = await axios.post(endpoint, { sourceCityId: importSourceCity });
                successMessage = `Successfully imported ${res.data.count} products!`;
            }

            alert(successMessage);
            setShowImportModal(false);
            setImportSourceCity('');
            setImportType('all');
            fetchCities();
        } catch {
            setError('Failed to import content');
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        const items = getFilteredItems();
        setSelectedItems(items.map(item => item._id));
    };

    const handleDeselectAll = () => {
        setSelectedItems([]);
    };

    const getCurrentItems = () => {
        switch (activeTab) {
            case 'products': return cityProducts;
            case 'categories': return cityCategories;

            case 'carousel': return cityCarouselItems;
            default: return [];
        }
    };

    const getAllItems = () => {
        switch (activeTab) {
            case 'products': return allProducts;
            case 'categories': return allCategories;
            case 'subcategories': return allSubCategories;
            case 'carousel': return allCarouselItems;
            default: return [];
        }
    };

    const getFilteredItems = () => {
        const currentItems = getCurrentItems();
        const allItems = getAllItems();

        return allItems.filter(item => {
            const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const notInCity = !currentItems.some(ci => ci._id === item._id);
            return matchesSearch && notInCity;
        });
    };

    const getItemDisplayInfo = (item) => {
        switch (activeTab) {
            case 'products':
                return {
                    image: item.image,
                    title: item.name,
                    subtitle: item.category?.name,
                    price: `₹${item.price}`
                };
            case 'categories':
                return {
                    image: item.image || item.video,
                    title: item.name,
                    subtitle: item.description,
                    price: null
                };
            case 'subcategories':
                return {
                    image: item.image || item.video,
                    title: item.name,
                    subtitle: item.parentCategory?.name,
                    price: null
                };
            case 'carousel':
                return {
                    image: item.image,
                    title: item.title,
                    subtitle: item.isMobile ? 'Mobile' : 'Desktop',
                    price: null
                };
            default:
                return { image: '', title: '', subtitle: '', price: null };
        }
    };

    const filteredItems = getFilteredItems();

    // Generate city link
    const getCityLink = (cityName) => {
        // Using the frontend URL (replace with your actual frontend URL)
        const frontendUrl = 'https://todaymydream.com'; // Update this if needed
        return `${frontendUrl}/?city=${encodeURIComponent(cityName)}`;
    };

    // Copy city link to clipboard
    const handleCopyLink = async (city) => {
        const link = getCityLink(city.name);
        try {
            await navigator.clipboard.writeText(link);
            setCopiedCityId(city._id);
            setTimeout(() => setCopiedCityId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = link;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopiedCityId(city._id);
            setTimeout(() => setCopiedCityId(null), 2000);
        }
    };

    // Open edit modal for a product
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setEditProductData({
            name: product.name || '',
            price: product.price || '',
            regularPrice: product.regularPrice || '',
            material: product.material || '',
            size: product.size || '',
            colour: product.colour || '',
            utility: product.utility || '',
            care: product.care || '',
            included: product.included || [],
            excluded: product.excluded || [],
            stock: product.stock || '',
            inStock: product.inStock !== undefined ? product.inStock : true,
            codAvailable: product.codAvailable !== undefined ? product.codAvailable : true,
            isBestSeller: product.isBestSeller || false,
            isTrending: product.isTrending || false,
            isMostLoved: product.isMostLoved || false
        });
        setShowEditModal(true);
    };

    // Save edited product (city-specific)
    const handleSaveProduct = async () => {
        if (!editingProduct || !selectedCity) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Create FormData object (backend expects multipart/form-data)
            const formData = new FormData();

            // Add all fields to FormData
            formData.append('name', editProductData.name);
            formData.append('price', editProductData.price);
            formData.append('regularPrice', editProductData.regularPrice);
            formData.append('material', editProductData.material);
            formData.append('size', editProductData.size);
            formData.append('colour', editProductData.colour);
            formData.append('utility', editProductData.utility);
            formData.append('care', editProductData.care);
            formData.append('stock', editProductData.stock);

            // Backend expects boolean values as strings 'true' or 'false'
            formData.append('inStock', editProductData.inStock.toString());
            formData.append('codAvailable', editProductData.codAvailable.toString());
            formData.append('isBestSeller', editProductData.isBestSeller.toString());
            formData.append('isTrending', editProductData.isTrending.toString());
            formData.append('isMostLoved', editProductData.isMostLoved.toString());

            // Keep category and subCategory from existing product
            if (editingProduct.category) {
                formData.append('category', editingProduct.category._id || editingProduct.category);
            }
            if (editingProduct.subCategory) {
                formData.append('subCategory', editingProduct.subCategory._id || editingProduct.subCategory);
            }

            // Use the new city-specific endpoint
            const response = await axios.put(
                `${API_URL}/${selectedCity._id}/products/${editingProduct._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Show different message based on whether a new product was created
            const message = response.data.isNewProduct
                ? 'Product cloned and updated for this city only. Other cities remain unchanged.'
                : 'Product updated for this city!';

            alert(message);
            setShowEditModal(false);
            setEditingProduct(null);

            // Refresh city data to show updated product
            if (selectedCity) {
                fetchCityData(selectedCity._id);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            console.error('Error response:', error.response?.data);
            setError('Failed to update product');
            alert(`Failed to update product: ${error.response?.data?.error || error.response?.data?.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    // Close edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
        setEditProductData({
            name: '',
            price: '',
            regularPrice: '',
            material: '',
            size: '',
            colour: '',
            utility: '',
            care: '',
            included: [],
            excluded: [],
            stock: '',
            inStock: true,
            codAvailable: true,
            isBestSeller: false,
            isTrending: false,
            isMostLoved: false
        });
    };

    // Group products by category and subcategory
    const groupProductsByCategory = () => {
        const grouped = {};

        cityProducts.forEach(product => {
            const categoryId = product.category?._id || product.category || 'uncategorized';
            const categoryName = product.category?.name || 'Uncategorized';
            const subCategoryId = product.subCategory?._id || product.subCategory || 'none';
            const subCategoryName = product.subCategory?.name || 'No Subcategory';

            if (!grouped[categoryId]) {
                grouped[categoryId] = {
                    name: categoryName,
                    id: categoryId,
                    subCategories: {}
                };
            }

            if (!grouped[categoryId].subCategories[subCategoryId]) {
                grouped[categoryId].subCategories[subCategoryId] = {
                    name: subCategoryName,
                    id: subCategoryId,
                    products: []
                };
            }

            grouped[categoryId].subCategories[subCategoryId].products.push(product);
        });

        return grouped;
    };

    // Toggle category expansion
    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Toggle subcategory expansion
    const toggleSubCategory = (subCategoryId) => {
        setExpandedSubCategories(prev => ({
            ...prev,
            [subCategoryId]: !prev[subCategoryId]
        }));
    };

    // Expand all categories and subcategories
    const expandAll = () => {
        const grouped = groupProductsByCategory();
        const catExpanded = {};
        const subCatExpanded = {};

        Object.keys(grouped).forEach(catId => {
            catExpanded[catId] = true;
            Object.keys(grouped[catId].subCategories).forEach(subCatId => {
                subCatExpanded[subCatId] = true;
            });
        });

        setExpandedCategories(catExpanded);
        setExpandedSubCategories(subCatExpanded);
    };

    // Collapse all categories and subcategories
    const collapseAll = () => {
        setExpandedCategories({});
        setExpandedSubCategories({});
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Header Skeleton during initial load */}
            {loading && cities.length === 0 ? (
                <div className="animate-pulse space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
                        <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
                    </div>
                    <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-200"></div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <TableSkeleton rows={8} cols={7} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                            <Package className="text-blue-600" size={32} />
                            Manage Cities & Content
                        </h1>

                        {/* Add City Form */}
                        <form onSubmit={handleAddCity} className="mb-8 p-4 bg-blue-50 rounded-lg">
                            <h2 className="text-lg font-semibold mb-3 text-gray-700">Add New City</h2>
                            <div className="flex flex-col md:flex-row gap-3">
                                <input
                                    type="text"
                                    value={newCity.name}
                                    onChange={e => setNewCity({ ...newCity, name: e.target.value })}
                                    placeholder="City name"
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={newCity.state}
                                    onChange={e => setNewCity({ ...newCity, state: e.target.value })}
                                    placeholder="State"
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={newCity.contactNumber}
                                    onChange={e => setNewCity({ ...newCity, contactNumber: e.target.value })}
                                    placeholder="Contact Number"
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    disabled={loading}
                                >
                                    <Plus size={20} /> Add City
                                </button>
                            </div>
                        </form>

                        {loading && <div className="animate-pulse mb-6"><TableSkeleton rows={5} cols={7} /></div>}
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

                        {/* Cities Table */}
                        {!loading && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">City Name</th>
                                            <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">State</th>
                                            <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Number</th>
                                            <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Products</th>
                                            <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">City Link</th>
                                            <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cities.map(city => (
                                            <tr key={city._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="border-b border-gray-200 px-4 py-3">
                                                    {editId === city._id ? (
                                                        <input
                                                            type="text"
                                                            value={editData.name}
                                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                                            className="border rounded px-2 py-1 w-full"
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-800">{city.name}</span>
                                                    )}
                                                </td>
                                                <td className="border-b border-gray-200 px-4 py-3">
                                                    {editId === city._id ? (
                                                        <input
                                                            type="text"
                                                            value={editData.state}
                                                            onChange={e => setEditData({ ...editData, state: e.target.value })}
                                                            className="border rounded px-2 py-1 w-full"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-600">{city.state}</span>
                                                    )}
                                                </td>
                                                <td className="border-b border-gray-200 px-4 py-3">
                                                    {editId === city._id ? (
                                                        <input
                                                            type="text"
                                                            value={editData.contactNumber}
                                                            onChange={e => setEditData({ ...editData, contactNumber: e.target.value })}
                                                            className="border rounded px-2 py-1 w-full"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-600">{city.contactNumber || '+917739873442'}</span>
                                                    )}
                                                </td>
                                                <td className="border-b border-gray-200 px-4 py-3">
                                                    {city.isActive !== false ? (
                                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="border-b border-gray-200 px-4 py-3">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        {city.productCount || 0} products
                                                    </span>
                                                </td>
                                                <td className="border-b border-gray-200 px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-600 truncate" title={getCityLink(city.name)}>
                                                                <LinkIcon size={12} className="inline mr-1" />
                                                                {getCityLink(city.name)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopyLink(city)}
                                                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${copiedCityId === city._id
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                }`}
                                                            title={copiedCityId === city._id ? 'Copied!' : 'Copy link'}
                                                        >
                                                            {copiedCityId === city._id ? (
                                                                <>
                                                                    <Check size={12} />
                                                                    <span>Copied</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy size={12} />
                                                                    <span>Copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="border-b border-gray-200 px-4 py-3">
                                                    {editId === city._id ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleUpdateCity}
                                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                                            >
                                                                <Check size={16} /> Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditId(null)}
                                                                className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                                            >
                                                                <X size={16} /> Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => handleToggleCityStatus(city._id)}
                                                                className={`${city.isActive !== false ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors`}
                                                                title={city.isActive !== false ? 'Deactivate City' : 'Activate City'}
                                                            >
                                                                <Power size={14} /> {city.isActive !== false ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleManageContent(city)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                                            >
                                                                <Package size={14} /> Manage
                                                            </button>
                                                            <button
                                                                onClick={() => handleImportContent(city)}
                                                                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                                            >
                                                                <Download size={14} /> Import
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditCity(city._id)}
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                                            >
                                                                <Edit2 size={14} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCity(city._id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Manage Content Modal */}
                    {showManageModal && selectedCity && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Manage Content for {selectedCity.name}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowManageModal(false);
                                            setSelectedCity(null);
                                            setSelectedItems([]);
                                            setSearchQuery('');
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="border-b border-gray-200 px-6">
                                    <div className="flex gap-4 overflow-x-auto">
                                        <button
                                            onClick={() => { setActiveTab('products'); setSelectedItems([]); setSearchQuery(''); }}
                                            className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'products'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <Package size={16} className="inline mr-2" />
                                            Products ({cityProducts.length})
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab('categories'); setSelectedItems([]); setSearchQuery(''); }}
                                            className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'categories'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <Grid size={16} className="inline mr-2" />
                                            Categories ({cityCategories.length})
                                        </button>


                                        <button
                                            onClick={() => { setActiveTab('carousel'); setSelectedItems([]); setSearchQuery(''); }}
                                            className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'carousel'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <ImageIcon size={16} className="inline mr-2" />
                                            Carousel ({cityCarouselItems.length})
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1">
                                    {/* Current Items */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-lg font-semibold text-gray-700">
                                                Current {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({getCurrentItems().length})
                                            </h3>
                                            {activeTab === 'products' && getCurrentItems().length > 0 && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={expandAll}
                                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors"
                                                    >
                                                        Expand All
                                                    </button>
                                                    <button
                                                        onClick={collapseAll}
                                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                                                    >
                                                        Collapse All
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {getCurrentItems().length === 0 ? (
                                            <p className="text-gray-500">No {activeTab} assigned to this city yet.</p>
                                        ) : activeTab === 'products' ? (
                                            // Grouped products view by category and subcategory
                                            <div className="space-y-3">
                                                {Object.entries(groupProductsByCategory()).map(([categoryId, categoryData]) => (
                                                    <div key={categoryId} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        {/* Category Header */}
                                                        <div
                                                            onClick={() => toggleCategory(categoryId)}
                                                            className="bg-blue-50 hover:bg-blue-100 px-4 py-3 cursor-pointer flex items-center justify-between transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {expandedCategories[categoryId] ? (
                                                                    <ChevronDown size={20} className="text-blue-600" />
                                                                ) : (
                                                                    <ChevronRight size={20} className="text-blue-600" />
                                                                )}
                                                                <Grid size={18} className="text-blue-600" />
                                                                <span className="font-semibold text-gray-800">{categoryData.name}</span>
                                                            </div>
                                                            <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                                                {Object.values(categoryData.subCategories).reduce((sum, subCat) => sum + subCat.products.length, 0)} products
                                                            </span>
                                                        </div>

                                                        {/* Subcategories */}
                                                        {expandedCategories[categoryId] && (
                                                            <div className="bg-white">
                                                                {Object.entries(categoryData.subCategories).map(([subCategoryId, subCategoryData]) => (
                                                                    <div key={subCategoryId} className="border-t border-gray-200">
                                                                        {/* Subcategory Header */}
                                                                        <div
                                                                            onClick={() => toggleSubCategory(subCategoryId)}
                                                                            className="bg-gray-50 hover:bg-gray-100 px-4 py-2 pl-10 cursor-pointer flex items-center justify-between transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                {expandedSubCategories[subCategoryId] ? (
                                                                                    <ChevronDown size={18} className="text-gray-600" />
                                                                                ) : (
                                                                                    <ChevronRight size={18} className="text-gray-600" />
                                                                                )}
                                                                                <Layers size={16} className="text-gray-600" />
                                                                                <span className="font-medium text-gray-700">{subCategoryData.name}</span>
                                                                            </div>
                                                                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                                                {subCategoryData.products.length} products
                                                                            </span>
                                                                        </div>

                                                                        {/* Products in Subcategory */}
                                                                        {expandedSubCategories[subCategoryId] && (
                                                                            <div className="p-4 pl-12 bg-white">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                    {subCategoryData.products.map(product => (
                                                                                        <div key={product._id} className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                                                                                            <img
                                                                                                src={product.image}
                                                                                                alt={product.name}
                                                                                                className="w-16 h-16 object-cover rounded"
                                                                                                onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                                                                                            />
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="font-medium text-sm text-gray-800 truncate">{product.name}</p>
                                                                                                <p className="text-sm font-semibold text-blue-600">₹{product.price}</p>
                                                                                                <p className="text-xs text-gray-500">Stock: {product.stock || 0}</p>
                                                                                            </div>
                                                                                            <div className="flex flex-col gap-2">
                                                                                                <button
                                                                                                    onClick={() => handleEditProduct(product)}
                                                                                                    className="text-blue-500 hover:text-blue-700"
                                                                                                    title="Edit Product"
                                                                                                >
                                                                                                    <Edit2 size={18} />
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleRemoveItemFromCity(product._id)}
                                                                                                    className="text-red-500 hover:text-red-700"
                                                                                                    title="Remove from City"
                                                                                                >
                                                                                                    <Trash2 size={18} />
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // Original grid view for other tabs (categories, carousel, etc.)
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {getCurrentItems().map(item => {
                                                    const displayInfo = getItemDisplayInfo(item);
                                                    return (
                                                        <div key={item._id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                                                            <img
                                                                src={displayInfo.image}
                                                                alt={displayInfo.title}
                                                                className="w-16 h-16 object-cover rounded"
                                                                onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm text-gray-800">{displayInfo.title}</p>
                                                                <p className="text-xs text-gray-500">{displayInfo.subtitle}</p>
                                                                {displayInfo.price && <p className="text-sm font-semibold text-blue-600">{displayInfo.price}</p>}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleRemoveItemFromCity(item._id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                    title="Remove from City"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <hr className="my-6" />

                                    {/* Add Items */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-700">
                                            Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                        </h3>
                                        <div className="mb-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder={`Search ${activeTab}...`}
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            {/* Info note for categories tab */}
                                            {activeTab === 'categories' && (
                                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-xs text-blue-800">
                                                        <strong>ℹ️ Auto-Import:</strong> When you add categories, their subcategories will be automatically imported to this city.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-4 flex flex-wrap items-center gap-3">
                                            {/* Bulk Selection Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSelectAll}
                                                    disabled={filteredItems.length === 0}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    <Check size={18} /> Select All ({filteredItems.length})
                                                </button>
                                                <button
                                                    onClick={handleDeselectAll}
                                                    disabled={selectedItems.length === 0}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    <X size={18} /> Deselect All
                                                </button>
                                            </div>

                                            {/* Add Items Button */}
                                            {selectedItems.length > 0 && (
                                                <button
                                                    onClick={handleAddItemsToCity}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                                >
                                                    <Plus size={20} /> Add {selectedItems.length} Selected Item(s)
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                            {filteredItems.map(item => {
                                                const displayInfo = getItemDisplayInfo(item);
                                                return (
                                                    <div
                                                        key={item._id}
                                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedItems.includes(item._id)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                            }`}
                                                        onClick={() => toggleItemSelection(item._id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={displayInfo.image}
                                                                alt={displayInfo.title}
                                                                className="w-16 h-16 object-cover rounded"
                                                                onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm text-gray-800">{displayInfo.title}</p>
                                                                <p className="text-xs text-gray-500">{displayInfo.subtitle}</p>
                                                                {displayInfo.price && <p className="text-sm font-semibold text-blue-600">{displayInfo.price}</p>}
                                                            </div>
                                                            {selectedItems.includes(item._id) && (
                                                                <Check className="text-blue-600" size={20} />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Import Modal */}
            {showImportModal && selectedCity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                Import Content to {selectedCity.name}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportSourceCity('');
                                    setImportType('all');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Source City
                            </label>
                            <select
                                value={importSourceCity}
                                onChange={e => setImportSourceCity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            >
                                <option value="">-- Select City --</option>
                                {cities
                                    .filter(c => c._id !== selectedCity._id)
                                    .map(city => (
                                        <option key={city._id} value={city._id}>
                                            {city.name} ({city.productCount || 0} products)
                                        </option>
                                    ))
                                }
                            </select>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Import Type
                            </label>
                            <select
                                value={importType}
                                onChange={e => setImportType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            >
                                <option value="all">All Content (Products, Categories, SubCategories, Carousel)</option>
                                <option value="products">Products Only</option>
                            </select>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> This will copy {importType === 'all' ? 'all content' : 'products'} from the selected city
                                    to {selectedCity.name}. Items already in {selectedCity.name} won't be duplicated.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleImport}
                                    disabled={!importSourceCity || loading}
                                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Download size={20} /> Import Content
                                </button>
                                <button
                                    onClick={() => {
                                        setShowImportModal(false);
                                        setImportSourceCity('');
                                        setImportType('all');
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && editingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Edit Product: {editingProduct.name}
                            </h2>
                            <button
                                onClick={handleCloseEditModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Product Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editProductData.name}
                                        onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={editProductData.price}
                                        onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Regular Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Regular Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={editProductData.regularPrice}
                                        onChange={(e) => setEditProductData({ ...editProductData, regularPrice: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Material */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Material *
                                    </label>
                                    <input
                                        type="text"
                                        value={editProductData.material}
                                        onChange={(e) => setEditProductData({ ...editProductData, material: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Size */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Size *
                                    </label>
                                    <input
                                        type="text"
                                        value={editProductData.size}
                                        onChange={(e) => setEditProductData({ ...editProductData, size: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Colour */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Colour *
                                    </label>
                                    <input
                                        type="text"
                                        value={editProductData.colour}
                                        onChange={(e) => setEditProductData({ ...editProductData, colour: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={editProductData.stock}
                                        onChange={(e) => setEditProductData({ ...editProductData, stock: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Utility */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Utility *
                                    </label>
                                    <textarea
                                        value={editProductData.utility}
                                        onChange={(e) => setEditProductData({ ...editProductData, utility: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        required
                                    />
                                </div>

                                {/* Care Instructions (Old Field) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Care Instructions (Old Field)
                                    </label>
                                    <textarea
                                        value={editProductData.care}
                                        onChange={(e) => setEditProductData({ ...editProductData, care: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">This field is kept for reference. Frontend displays Included/Excluded items below.</p>
                                </div>

                                {/* Included Items */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        What's Included ✓
                                    </label>
                                    <div className="space-y-2">
                                        {editProductData.included.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => {
                                                        const newIncluded = [...editProductData.included];
                                                        newIncluded[index] = e.target.value;
                                                        setEditProductData({ ...editProductData, included: newIncluded });
                                                    }}
                                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Free delivery"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newIncluded = editProductData.included.filter((_, i) => i !== index);
                                                        setEditProductData({ ...editProductData, included: newIncluded });
                                                    }}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setEditProductData({ ...editProductData, included: [...editProductData.included, ''] })}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            + Add Included Item
                                        </button>
                                    </div>
                                </div>

                                {/* Excluded Items */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        What's Excluded ✗
                                    </label>
                                    <div className="space-y-2">
                                        {editProductData.excluded.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => {
                                                        const newExcluded = [...editProductData.excluded];
                                                        newExcluded[index] = e.target.value;
                                                        setEditProductData({ ...editProductData, excluded: newExcluded });
                                                    }}
                                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Installation not included"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newExcluded = editProductData.excluded.filter((_, i) => i !== index);
                                                        setEditProductData({ ...editProductData, excluded: newExcluded });
                                                    }}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setEditProductData({ ...editProductData, excluded: [...editProductData.excluded, ''] })}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                        >
                                            + Add Excluded Item
                                        </button>
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editProductData.inStock}
                                            onChange={(e) => setEditProductData({ ...editProductData, inStock: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">In Stock</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editProductData.codAvailable}
                                            onChange={(e) => setEditProductData({ ...editProductData, codAvailable: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">COD Available</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editProductData.isBestSeller}
                                            onChange={(e) => setEditProductData({ ...editProductData, isBestSeller: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Best Seller</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editProductData.isTrending}
                                            onChange={(e) => setEditProductData({ ...editProductData, isTrending: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Trending</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editProductData.isMostLoved}
                                            onChange={(e) => setEditProductData({ ...editProductData, isMostLoved: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Most Loved</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={handleCloseEditModal}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cities;
