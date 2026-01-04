import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import config from '../../config/config.js';
import { ProductSkeleton } from '../Loader/Skeleton';
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

// Cache for loved products data
let lovedProductsCache = null;
let lovedCacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function MostLoved() {
  const [products, setProducts] = useState([]);
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
        // Invalidate cache when city changes
        const cacheKey = `mostloved_${selectedCity || 'all'}`;

        // Check cache first (city-specific cache)
        if (lovedProductsCache &&
          lovedProductsCache.city === selectedCity &&
          lovedCacheTimestamp &&
          (Date.now() - lovedCacheTimestamp) < CACHE_DURATION) {
          setProducts(lovedProductsCache.data);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const urlParams = new URLSearchParams();
        if (selectedCity) {
          urlParams.append('city', selectedCity);
        }

        const res = await fetch(`${config.API_URLS.PRODUCTS}/section/mostloved?${urlParams.toString()}`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error('Failed to fetch most loved products');
        const data = await res.json();

        const productsData = Array.isArray(data) ? data : data.products || [];

        // Cache the data with city information
        lovedProductsCache = {
          city: selectedCity,
          data: productsData
        };
        lovedCacheTimestamp = Date.now();

        setProducts(productsData);
      } catch (err) {

        setError(err.message || 'Error fetching most loved products');
        // Set empty array to prevent crashes
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCity]);

  // Memoize displayed products to prevent unnecessary re-renders
  const displayedProducts = useMemo(() => {
    return isMobile ? products.slice(0, 4) : products;
  }, [products, isMobile]);

  // If there are no products, don't render the section
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-6 md:py-10 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8 lg:mb-10">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900 mb-3 md:mb-4">
              Most <span className="font-serif italic">Brought Decorative</span>
            </h2>
          </div>
          <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
            {[...Array(isMobile ? 4 : 8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 md:w-56 lg:w-64 snap-start">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    // Don't show error, just return null to not break the page
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
              Most <span className="font-serif italic">Brought Decorative</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6 max-w-2xl mx-auto">
              favorite Decorative that have Made the day even more memorable
            </p>
          </div>
        </motion.div>

        {/* Products Horizontal Scroll */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="flex-shrink-0 w-48 md:w-56 lg:w-64 snap-start"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Show "View More" button on mobile if there are more products */}
        {isMobile && products.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8 md:mt-12"
          >
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-[#FCD24C] to-[#FCD24C] hover:from-[#FCD24C] hover:to-[#FCD24C] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View More Products
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
} 