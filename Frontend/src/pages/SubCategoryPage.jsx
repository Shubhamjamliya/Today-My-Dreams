import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star, TrendingUp, Heart, Award, ShoppingBag } from 'lucide-react';
import { categoryAPI, subCategoryAPI } from '../services/api';
import config from '../config/config';
import Loader from '../components/Loader';
import SEO from '../components/SEO/SEO';
import { useCity } from '../context/CityContext';
import ProductCard from '../components/ProductCard/ProductCard';
import axios from 'axios';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1558403374-6581c3e3a4b9?auto=format&fit=crop&w=200&q=80';

// Component for displaying products within each category
const CategoryProductSection = ({ category, selectedCity }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductsForCategory = async () => {
      if (!category || !category.name) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const urlParams = new URLSearchParams();
        urlParams.append('category', category.name);
        urlParams.append('limit', '6'); // Show 6 products per category
        if (selectedCity) {
          urlParams.append('city', selectedCity);
        }
        
        const response = await axios.get(`${config.API_URLS.SHOP}?${urlParams.toString()}`);
        const data = response.data || [];
        const productsArray = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
        
        setProducts(productsArray);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsForCategory();
  }, [category, selectedCity]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg">
            <img
              src={category.image || FALLBACK_IMAGE_URL}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{category.name}</h2>
            <p className="text-sm text-slate-600">Explore our premium collection</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/shop', { state: { selectedCategory: { main: category.name } } })}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
        >
          <span className="text-sm font-semibold">View</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg aspect-square animate-pulse border border-gray-200"></div>
          ))
        ) : (
          products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
    </motion.div>
  );
};

const SubCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { selectedCity } = useCity();
  
  // Subcategory state management
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [subcategoriesError, setSubcategoriesError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getCategoriesWithSubCategories(selectedCity);
        setCategories(response.data);
      } catch (err) {
        setError("Sorry, we couldn't load the categories right now.");
        // Failed to fetch categories
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCity]);

  const handleCategoryClick = async (category) => {
    try {
      setSubcategoriesLoading(true);
      setSubcategoriesError(null);
      setSelectedCategory(category);

      // Fetch subcategories for the selected category
      const subCategoriesResponse = await subCategoryAPI.getSubCategories(category._id);
      const subCategories = subCategoriesResponse.data || [];

      if (subCategories.length > 0) {
        setSubcategories(subCategories);
        setShowSubcategories(true);
      } else {
        // If no subcategories, navigate directly to shop
        navigate(`/shop`, {
          state: {
            selectedCategory: { main: category.name, sub: null, item: null }
          }
        });
      }
    } catch (error) {
      // Error fetching subcategories
      setSubcategoriesError('Failed to load subcategories');
      // On error, navigate directly to shop
      navigate(`/shop`, {
        state: {
          selectedCategory: { main: category.name, sub: null, item: null }
        }
      });
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const handleBackToCategories = () => {
    setShowSubcategories(false);
    setSelectedCategory(null);
    setSubcategories([]);
    setSubcategoriesError(null);
  };

  const handleSubcategoryClick = (subcategory) => {
    navigate(`/shop`, {
      state: {
        selectedCategory: { 
          main: selectedCategory.name, 
          sub: subcategory.name, 
          item: null 
        }
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 20 } }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-start justify-center bg-gray-50">
        <Loader text="Loading Categories..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center text-red-600  p-4">
        {error}
      </div>
    );
  }

  // If showing subcategories, render subcategory view
  if (showSubcategories) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <div className="container mx-auto px-3 py-8">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={handleBackToCategories}
              className="flex items-center  hover:text-amber-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </button>
          </motion.div>

          {/* Subcategory Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-8"
          >
            <h1 className="text-xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {selectedCategory?.name} {' '}
              <span className="text-[#FCD24C] drop-shadow-md">
                Subcategories
              </span>
            </h1>
            <div className="mt-2 h-1 w-16 md:w-20 mx-auto bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-full"></div>
          </motion.div>

          {/* Subcategories Content */}
          {subcategoriesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader text="Loading Subcategories..." />
            </div>
          ) : subcategoriesError ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4 text-lg">{subcategoriesError}</p>
              <button
                onClick={() => handleCategoryClick(selectedCategory)}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : subcategories.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
            >
              {subcategories.map((subcategory) => (
                <motion.div
                  key={subcategory._id}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 cursor-pointer text-center"
                  onClick={() => handleSubcategoryClick(subcategory)}
                >
                  {/* Subcategory Card */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg shadow-amber-100 hover:shadow-xl hover:shadow-amber-200 transition-all duration-300">
                    <img
                      src={config.fixImageUrl(subcategory.image || subcategory.video || '')}
                      alt={subcategory.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.target.src = 'https://placehold.co/96x96/fffbeb/475569?text=' + encodeURIComponent(subcategory.name.charAt(0)); 
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  {/* Subcategory Name */}
                  <p className="text-lg sm:text-lg font-semibold text-slate-800 hover:text-amber-600 transition-colors line-clamp-2">
                    {subcategory.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-600 text-lg">No subcategories available</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Decoration Categories - Birthday, Wedding & Anniversary Supplies | Decoryy"
        description="Browse our comprehensive collection of decoration categories for birthdays, weddings, anniversaries, and celebrations. Find the perfect decoration materials for your special events."
        keywords="decoration categories, birthday decoration categories, wedding decor categories, anniversary celebration categories, party supplies categories, decoration materials by category, celebration supplies categories, event decoration categories"
        url="https://decoryy.com/subcategory"
        image="/categories-hero.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Decoration Categories",
          "description": "Browse decoration categories for birthdays, weddings, anniversaries and celebrations.",
          "url": "https://decoryy.com/subcategory",
          "mainEntity": {
            "@type": "ItemList",
            "name": "Decoration Categories",
            "description": "Comprehensive collection of decoration categories",
            "numberOfItems": categories.length
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://decoryy.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Categories",
                "item": "https://decoryy.com/subcategory"
              }
            ]
          }
        }}
      />
      
      {/* Premium Background with Gradient */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 font-sans">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Premium Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full mb-6">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Premium Categories</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Discover Amazing{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                Collections
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Explore our premium collection of decoration categories with featured products for every celebration
            </p>
            
            <div className="flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-full"></div>
            </div>
          </motion.div>

          {/* Categories Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
              Browse by Category
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category) => (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="relative">
                    {/* Premium Category Card */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-amber-200 shadow-lg shadow-amber-100 group-hover:shadow-xl group-hover:shadow-amber-200 transition-all duration-300 group-hover:border-amber-400">
                      <img
                        src={category.image || FALLBACK_IMAGE_URL}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      
                      {/* Category Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm md:text-base text-center drop-shadow-lg">
                          {category.name}
                        </p>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Featured Products by Category */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium products from each category
              </p>
            </div>
            
            {categories.map((category) => (
              <CategoryProductSection 
                key={category._id} 
                category={category} 
                selectedCity={selectedCity} 
              />
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SubCategoryPage;
