import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config/config.js';
import { CategorySkeleton } from '../Loader/Skeleton';
import { categories as staticCategories } from '../../data/categories.js';
import { Sparkles } from 'lucide-react'; // Added for a premium header icon
import BirthdaySubcategories from '../BirthdaySubcategories';
import { useCity } from '../../context/CityContext';
import OptimizedImage from '../OptimizedImage';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger for a snappier feel
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 }, // Smaller initial movement
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring', // Spring animation for a natural feel
      stiffness: 120,
      damping: 18,
    },
  },
};

// Static category images mapping - Ensure these paths are correct or updated to hosted URLs
const categoryImages = {
  "Ballon decor": "/images/categories/ballon-decor.jpg", // Example path
  "Anniversary decor": "/images/categories/anniversary-decor.jpg", // Corrected typo: "Aniversary" -> "Anniversary"
  "Wedding decor": "/images/categories/wedding-decor.jpg", // Corrected typo: "Dwedding" -> "Wedding"
  "Organise party": "/images/categories/organise-party.jpg", // Corrected typo: "organise" -> "Organise"
  "Birthday decor": "/images/categories/birthday-decor.jpg", // Added an example
  "Baby shower decor": "/images/categories/baby-shower-decor.jpg", // Added an example
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBirthdaySubcategories, setShowBirthdaySubcategories] = useState(false);
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [selectedCity]);

  const handleCategoryClick = (categoryName) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  const handleBackToCategories = () => {
    setShowBirthdaySubcategories(false);
  };

  const fetchCategories = async () => {
    try {
      const urlParams = new URLSearchParams();
      if (selectedCity) {
        urlParams.append('city', selectedCity);
      }
      const response = await axios.get(`${config.API_URLS.CATEGORIES}?${urlParams.toString()}`);
      const apiCategories = response.data.categories || [];

      const processedCategories = apiCategories.map(category => ({
        id: category._id || category.id,
        name: category.name,
        description: category.description,
        // Prioritize category.image, then category.video, then local static map, then a default
        image: config.fixImageUrl(
          category.image ||
          category.video ||
          categoryImages[category.name] ||
          '/images/categories/default.jpg'
        ),
        isVideo: !!category.video,
        sortOrder: category.sortOrder || 0
      }));

      // Show all categories, no limit
      const finalCategories = processedCategories
        .sort((a, b) => a.sortOrder - b.sortOrder);

      setCategories(finalCategories);
      setLoading(false);
    } catch (error) {
      // Error fetching categories
      setError('Failed to load categories. Displaying default.');

      const fallbackCategories = staticCategories
        .map(category => ({
          id: category.name.toLowerCase().replace(/\s+/g, '-'),
          name: category.name,
          image: categoryImages[category.name] || '/images/categories/default.jpg',
          isVideo: false
        }));

      setCategories(fallbackCategories);
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <section className="py-6 sm:py-12 md:py-16 font-sans">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && categories.length === 0) { // Only show error if no categories could be loaded at all
    return (
      <section className="py-6 sm:py-12 md:py-16 font-sans">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-semibold text-lg">{error}</p>
              <p className="text-sm mt-1">Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If showing birthday subcategories, render that component
  if (showBirthdaySubcategories) {
    return (
      <section className="py-6 sm:py-12 md:py-16 font-sans">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={handleBackToCategories}
              className="flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Categories
            </button>
          </motion.div>
          <BirthdaySubcategories />
        </div>
      </section>
    );
  }

  return (
    // CHANGE: Amber theme background
    <section className="py-6 sm:py-12 md:py-16 font-sans">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">

        {/* Header Section - Custom Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#4A1D54] mb-2 tracking-wide">
              Make Every Occasion Extra Special
            </h2>
            {/* Optional subtitle if needed, or just spacers */}
          </div>
        </motion.div>

        {/* Categories Grid - Rounded Peach Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {categories.map((category, index) => (
            <div
              key={category.id || index}
              onClick={() => handleCategoryClick(category.name)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <motion.div
                variants={itemVariants}
                className="w-full"
              >
                {/* Image Container - Peach Background & Rounded */}
                <div
                  className="w-full aspect-square bg-[#FFF5E6] rounded-[2.5rem] p-4 sm:p-6 
                             flex items-center justify-center relative overflow-hidden 
                             transition-transform duration-500 group-hover:-translate-y-2"
                >
                  {/* Doodles Background (Simulated with opacity if available, else just solid color) */}

                  {category.isVideo ? (
                    <video
                      src={config.fixImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-2xl shadow-sm"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x400/fffbeb/475569?text=' + encodeURIComponent(category.name.replace(/\s/g, '+'));
                      }}
                    />
                  ) : (
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full rounded-2xl shadow-sm transform group-hover:scale-105 transition-transform duration-700"
                      objectFit="cover"
                    />
                  )}
                </div>

                {/* Category Name - Below Card */}
                <div className="mt-4 text-center">
                  <h3 className="text-lg md:text-xl font-bold text-[#1e293b] group-hover:text-amber-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mt-8 md:mt-14"
        >
          <Link
            to="/subcategory"
            className="inline-flex items-center px-6 py-2.5 bg-[#FCD24C] text-white font-semibold rounded-lg 
                       hover:bg-[#FCD24C] transition-all duration-300 group shadow-md hover:shadow-lg 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white text-sm"
          >
            View All Categories
            <svg
              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;