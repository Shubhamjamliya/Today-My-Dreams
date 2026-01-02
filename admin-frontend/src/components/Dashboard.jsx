import React, { useState, useEffect } from 'react';
import { Package, Users, Tag, DollarSign, TrendingUp, ShoppingCart, Star, Eye, LayoutGrid, ChevronDown, ChevronRight, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0,
    revenue: 0,
    sellers: 0,
    featured: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedSubCategories, setExpandedSubCategories] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategoryData();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, categoriesRes, featuredRes, sellersRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getOrders(),
        apiService.getCategories(),
        apiService.getFeaturedProducts(),
        apiService.getSellers()
      ]);

      console.log('Dashboard API Responses:', {
        productsRes: productsRes.data,
        ordersRes: ordersRes.data,
        categoriesRes: categoriesRes.data,
        featuredRes: featuredRes.data,
        sellersRes: sellersRes.data
      });

      // Extract data from responses, handling both array and object formats
      // /api/shop returns array directly
      const products = Array.isArray(productsRes.data) ? productsRes.data : 
                      (productsRes.data.products || []);
      
      // /api/orders returns { orders: [...] }
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data :
                    (ordersRes.data.orders || []);
      
      // /api/categories returns { categories: [...] }
      const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : 
                        (categoriesRes.data.categories || []);
      
      // /api/featured-products returns { products: [...] }
      const featured = Array.isArray(featuredRes.data) ? featuredRes.data :
                      (featuredRes.data.products || []);
      
      // /api/sellers returns { sellers: [...] }
      const sellers = Array.isArray(sellersRes.data) ? sellersRes.data :
                     (sellersRes.data.sellers || []);

      // Calculate totals
      const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

      console.log('Dashboard Stats Calculated:', {
        productsCount: products.length,
        ordersCount: orders.length,
        categoriesCount: categories.length,
        featuredCount: featured.length,
        sellersCount: sellers.length,
        totalRevenue
      });

      setStats({
        products: products.length,
        orders: orders.length,
        categories: categories.length,
        revenue: totalRevenue,
        sellers: sellers.length,
        featured: featured.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', error.response || error);
      // Set default values on error
      setStats({
        products: 0,
        orders: 0,
        categories: 0,
        revenue: 0,
        sellers: 0,
        featured: 0
      });
    }
  };

  const fetchCategoryData = async () => {
    setLoadingCategories(true);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        apiService.getCategories(),
        apiService.getProducts()
      ]);

      const categories = Array.isArray(categoriesRes.data) 
        ? categoriesRes.data 
        : (categoriesRes.data.categories || []);
      
      const products = Array.isArray(productsRes.data) 
        ? productsRes.data 
        : (productsRes.data.products || []);

      // Organize products by category and subcategory
      const categoryMap = new Map();

      for (const category of categories) {
        // Fetch subcategories for each category
        try {
          const subCategoriesRes = await apiService.getSubCategories(category._id);
          const subCategories = Array.isArray(subCategoriesRes.data)
            ? subCategoriesRes.data
            : (subCategoriesRes.data.subCategories || []);

          const subCategoryMap = new Map();

          // Group products by subcategory
          subCategories.forEach(subCat => {
            const subCatProducts = products.filter(p => 
              p.subCategory && p.subCategory._id === subCat._id
            );
            subCategoryMap.set(subCat._id, {
              ...subCat,
              products: subCatProducts,
              productCount: subCatProducts.length
            });
          });

          // Products without subcategory but in this category
          const categoryProducts = products.filter(p => 
            p.category && 
            (p.category._id === category._id || p.category === category._id) &&
            !p.subCategory
          );

          categoryMap.set(category._id, {
            ...category,
            subCategories: Array.from(subCategoryMap.values()),
            directProducts: categoryProducts,
            totalProducts: products.filter(p => 
              p.category && (p.category._id === category._id || p.category === category._id)
            ).length
          });
        } catch (error) {
          console.error(`Error fetching subcategories for ${category.name}:`, error);
          // If subcategories fail, still add the category with products
          const categoryProducts = products.filter(p => 
            p.category && (p.category._id === category._id || p.category === category._id)
          );
          
          categoryMap.set(category._id, {
            ...category,
            subCategories: [],
            directProducts: categoryProducts,
            totalProducts: categoryProducts.length
          });
        }
      }

      setCategoryData(Array.from(categoryMap.values()));
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryData([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleProductsView = (key) => {
    setExpandedProducts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSubCategoryProducts = (key) => {
    setExpandedSubCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.products,
      icon: <Package className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: stats.orders,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: <Tag className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Featured Products',
      value: stats.featured,
      icon: <Star className="w-6 h-6" />,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.revenue.toFixed(2)}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Total Venue',
      value: stats.sellers,
      icon: <Users className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your dashboard! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <LayoutGrid className="w-4 h-4" />
              <span>View by Category & Sub Category</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          {loadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading categories...</p>
              </div>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No categories found</p>
            </div>
          ) : (
            categoryData.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {expandedCategories[category._id] ? (
                          <ChevronDown className="w-6 h-6 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      {category.image && (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold text-blue-600">{category.totalProducts}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Subcategories</p>
                        <p className="text-2xl font-bold text-purple-600">{category.subCategories.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCategories[category._id] && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {/* Direct Products (without subcategory) */}
                    {category.directProducts.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          Direct Products ({category.directProducts.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {(expandedProducts[`direct-${category._id}`] 
                            ? category.directProducts 
                            : category.directProducts.slice(0, 10)
                          ).map((product) => (
                            <div key={product._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                              />
                              <h5 className="font-medium text-gray-800 text-sm mb-1 truncate">{product.name}</h5>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-600 font-bold text-sm">₹{product.price}</span>
                                {product.inStock ? (
                                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">In Stock</span>
                                ) : (
                                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                                )}
                              </div>
                              <button
                                onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit Product</span>
                              </button>
                            </div>
                          ))}
                        </div>
                        {category.directProducts.length > 10 && (
                          <div className="mt-4 text-center">
                            <button
                              onClick={() => toggleProductsView(`direct-${category._id}`)}
                              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                              {expandedProducts[`direct-${category._id}`] 
                                ? `Show Less` 
                                : `View More (${category.directProducts.length - 10} more)`
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subcategories */}
                    {category.subCategories.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-700 flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Subcategories
                        </h4>
                        {category.subCategories.map((subCategory) => (
                          <div key={subCategory._id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {subCategory.image && (
                                  <img 
                                    src={subCategory.image} 
                                    alt={subCategory.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  <h5 className="font-semibold text-gray-800">{subCategory.name}</h5>
                                  <p className="text-xs text-gray-500">{subCategory.description}</p>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                {subCategory.productCount} products
                              </span>
                            </div>
                            
                            {subCategory.products.length > 0 && (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
                                  {(expandedSubCategories[`sub-${subCategory._id}`]
                                    ? subCategory.products
                                    : subCategory.products.slice(0, 10)
                                  ).map((product) => (
                                    <div key={product._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                                      <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-28 object-cover rounded-lg mb-2"
                                      />
                                      <h6 className="font-medium text-gray-800 text-xs mb-1 truncate">{product.name}</h6>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-600 font-bold text-xs">₹{product.price}</span>
                                        {product.inStock ? (
                                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">In Stock</span>
                                        ) : (
                                          <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">Out</span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                        className="w-full flex items-center justify-center space-x-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium py-1.5 px-2 rounded-lg transition-colors duration-200"
                                      >
                                        <Edit className="w-3 h-3" />
                                        <span>Edit</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                {subCategory.products.length > 10 && (
                                  <div className="mt-3 text-center">
                                    <button
                                      onClick={() => toggleSubCategoryProducts(`sub-${subCategory._id}`)}
                                      className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                                    >
                                      {expandedSubCategories[`sub-${subCategory._id}`]
                                        ? `Show Less`
                                        : `View More (${subCategory.products.length - 10} more)`
                                      }
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {category.directProducts.length === 0 && category.subCategories.length === 0 && (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No products in this category yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 