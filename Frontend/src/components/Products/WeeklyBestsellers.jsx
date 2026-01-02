import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import config from '../../config/config.js';
import Loader from '../Loader';
import ProductCard from '../ProductCard/ProductCard.jsx';
import { useCity } from '../../context/CityContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function WeeklyBestsellers() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { selectedCity } = useCity();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const urlParams = new URLSearchParams();
        if (selectedCity) {
          urlParams.append('city', selectedCity);
        }
        
        const res = await fetch(`${config.API_URLS.SHOP}/section/bestsellers?${urlParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch bestseller products: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
      
        
        // Handle different response structures
        let productsArray = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else {
          console.warn('Unexpected API response structure:', data);
          productsArray = [];
        }
        
        // Filter out any invalid products
        productsArray = productsArray.filter(product => 
          product && 
          (product._id || product.id) && 
          product.name && 
          typeof product.price === 'number'
        );
        
        setProducts(productsArray);
      } catch (err) {
        // Error fetching bestseller products
        setError(err.message || 'Error fetching bestseller products');
        setProducts([]); // Set empty array on error to prevent crashes
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCity]);

  const categories = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return ['All'];
    }
    
    // Extract category names safely
    const productCategories = products
      .map(p => {
        if (!p || !p.category) return null;
        // Handle both string and object category formats
        return typeof p.category === 'string' ? p.category : p.category.name;
      })
      .filter(Boolean);
    
    const uniqueCategories = [...new Set(productCategories)];
    return ['All', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }
    
    let filtered = selectedCategory === 'All' 
      ? products 
      : products.filter(product => {
          if (!product || !product.category) return false;
          const categoryName = typeof product.category === 'string' 
            ? product.category 
            : product.category.name;
          return categoryName === selectedCategory;
        });
    
    // Limit products on mobile devices
    if (isMobile) {
      filtered = filtered.slice(0, 4);
    }
    
    return filtered;
  }, [selectedCategory, products, isMobile]);

  const handleCategoryChange = (category) => {
    // Using a timeout to give a smoother feel when changing categories
    setLoading(true);
    setSelectedCategory(category);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  // If loading is finished and there are still no products (e.g., fetch failed), render nothing.
  if (!loading && products.length === 0) {
    return null;
  }
  
  // Don't render the component if there's an error
  if (error) {
    // Bestsellers Error
    return null;
  }

  // Additional safety check
  if (!Array.isArray(products)) {
    // Products is not an array
    return null;
  }
  
  return (
    <section className="py-6 md:py-10 lg:py-12">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-8 lg:mb-10"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900 mb-3 md:mb-4">
              Choose By <span className="font-serif italic">Category</span>
            </h2>
           
            {/* FIX: Corrected Tailwind CSS gradient syntax. It was invalid. */}
            <div className="w-16 md:w-20 h-0.5 bg-[#FCD24C] mx-auto mt-2"></div>
          </div>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex justify-center mb-6 md:mb-8"
          >
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[#FCD24C] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Products Horizontal Scroll or Loader */}
        {loading ? (
             <div className="flex items-center justify-center py-8 md:py-16">
                <Loader size="large" text="Loading products..." />
             </div>
        ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="relative"
            >
              <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
                {filteredProducts.map((product, index) => {
                  // Additional safety check for each product
                  if (!product || (!product._id && !product.id)) {
                    console.warn('Invalid product at index', index, ':', product);
                    return null;
                  }
                  
                  const productKey = product._id || product.id || `product-${index}`;
                  return (
                    <motion.div 
                      key={productKey} 
                      variants={itemVariants}
                      className="flex-shrink-0 w-48 md:w-56 lg:w-64 snap-start"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
        )}
        
        {/* "View More" button */}
        {isMobile && products.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-6 md:mt-8"
          >
            <div className="max-w-md mx-auto">
            
              <Link 
                to="/shop" 
                // FIX: Added 'group' class to make the hover animation on the SVG work
                className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#FCD24C] to-[#FCD24C] text-white rounded-xl font-semibold  transition-all duration-300 text-sm shadow-lg hover:shadow-xl"
              >
                View More Products
                <svg 
                  className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}