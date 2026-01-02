import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { subCategoryAPI, categoryAPI } from '../services/api';
import config from '../config/config';
import { useCity } from '../context/CityContext';
import axios from 'axios';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 18,
    },
  },
};

const BirthdaySubcategories = () => {
  const [birthdayThemes, setBirthdayThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthdayCategoryId, setBirthdayCategoryId] = useState(null);
  const [birthdayCategoryName, setBirthdayCategoryName] = useState(null);
  const [subCategoryProductCounts, setSubCategoryProductCounts] = useState({});
  const { selectedCity } = useCity();


  useEffect(() => {
    fetchBirthdaySubcategories();
  }, [selectedCity]);

  // Fetch product counts when city or themes change
  useEffect(() => {
    if (birthdayThemes.length > 0 && birthdayCategoryName) {
      fetchSubCategoryProductCounts();
    }
  }, [birthdayThemes, birthdayCategoryName, selectedCity]);

  const fetchBirthdaySubcategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all categories to find the Kids Birthday category (with city filter)
      const urlParams = new URLSearchParams();
      if (selectedCity) {
        urlParams.append('city', selectedCity);
      }
      const categoriesResponse = await axios.get(`${config.API_URLS.CATEGORIES}?${urlParams.toString()}`);
      const categories = categoriesResponse.data.categories || [];
      
      // Find Kids Birthday category specifically (case-insensitive search)
      let kidsBirthdayCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('kids birthday') ||
        cat.name.toLowerCase() === 'kids birthday decor' ||
        cat.name.toLowerCase() === 'kids birthday decorations'
      );

      // If Kids Birthday not found, try finding general Birthday category
      if (!kidsBirthdayCategory) {
        kidsBirthdayCategory = categories.find(cat => 
          cat.name.toLowerCase().includes('birthday') || 
          cat.name.toLowerCase().includes('birth') ||
          cat.name.toLowerCase() === 'birthday decor' ||
          cat.name.toLowerCase() === 'birthday decorations'
        );
      }

      if (!kidsBirthdayCategory) {
        setError('Birthday category not found. Please try again.');
        setBirthdayThemes([]);
        setLoading(false);
        return;
      }

      setBirthdayCategoryId(kidsBirthdayCategory._id);
      setBirthdayCategoryName(kidsBirthdayCategory.name);

      // Fetch subcategories for the Kids Birthday category
      const subCategoriesResponse = await subCategoryAPI.getSubCategories(kidsBirthdayCategory._id);
      const subCategories = subCategoriesResponse.data || [];

      // Filter and transform the data to match our component's expected format
      // Filter for kids-specific themes if we're in a general birthday category
      let filteredSubCategories = subCategories;
      
      if (!kidsBirthdayCategory.name.toLowerCase().includes('kids')) {
        // If we're in a general birthday category, try to filter for kids themes
        // This is optional - you can remove this filtering if you want all themes
      }

      // Transform the data
      const transformedThemes = filteredSubCategories.map(subCat => ({
        id: subCat._id || subCat.slug,
        name: subCat.name,
        image: config.fixImageUrl(subCat.image || subCat.video || ''),
        description: subCat.description,
        gradient: 'from-amber-200 to-yellow-200',
        isVideo: !!subCat.video
      }));

      if (transformedThemes.length > 0) {
        setBirthdayThemes(transformedThemes);
      } else {
        setError('No birthday themes found. Please try again.');
        setBirthdayThemes([]);
      }

    } catch (error) {
      setError('Failed to load birthday themes. Please try again.');
      setBirthdayThemes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product counts for each subcategory based on selected city
  const fetchSubCategoryProductCounts = async () => {
    try {
      const urlParams = new URLSearchParams();
      if (selectedCity) {
        urlParams.append('city', selectedCity);
      }
      urlParams.append('limit', '1000');

      const response = await axios.get(`${config.API_URLS.SHOP}?${urlParams.toString()}`);
      const products = response.data || [];

      // Count products per subcategory
      const counts = {};
      birthdayThemes.forEach(theme => {
        counts[theme.name] = products.filter(p => 
          p.category?.name === birthdayCategoryName && 
          p.subCategory?.name === theme.name
        ).length;
      });

      setSubCategoryProductCounts(counts);
    } catch (error) {
      // Error fetching subcategory product counts
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-2 sm:py-8 md:py-12 font-sans">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-6 md:mb-8">
            <div className="relative inline-block">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Kids Birthday Decorations
              </h2>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FCD24C]"></div>
            </div>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Fun-Filled Themes for Every Celebration!
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 
                               bg-amber-200 rounded-full animate-pulse"></div>
                <div className="mt-2 h-4 bg-amber-200 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state - show "not found try again" message
  if (error) {
    return (
   <>
   </>
    );
  }

  // Only show the main content if we have themes to display
  if (birthdayThemes.length === 0) {
    return null;
  }

  return (
    <section className="py-2 sm:py-2 md:py-2 font-sans">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 flex flex-col items-center">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-6 md:mb-8 flex flex-col items-center w-full"
        >
          <div className="relative inline-block">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Kids Birthday Decorations
            </h2>
            {/* Decorative line like in the image */}
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FCD24C]"></div>
          </div>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Fun-Filled Themes for Every Celebration!
          </p>
          
        </motion.div>

        {/* Birthday Themes Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}    
          className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl mx-auto md:flex md:flex-wrap md:justify-center"
        >
          {birthdayThemes.map((theme, index) => (
            <motion.div
              key={theme.id}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.05,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              className="flex flex-col items-center text-center group"
            >
              <Link
                to="/shop"
                state={{ 
                  selectedCategory: { 
                    main: birthdayCategoryName,
                    sub: theme.name 
                  } 
                }}
                className="flex flex-col items-center text-center group w-full "
              >
                {/* Circular Theme Icon */}
                <div 
                  className={`relative w-26 h-26 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-32 lg:h-32 
                              rounded-full overflow-hidden 
                             shadow-lg group-hover:shadow-xl transition-all duration-300 
                             border-4  border-[#FCD24C]`}
                >
                  {/* Golden Shine Ring */}
                  <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-spin-slow"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-yellow-300 to-transparent animate-spin-slow" style={{animationDelay: '0.5s'}}></div>
                  </div>
                  {theme.isVideo ? (
                    <video
                      src={theme.image}
                      alt={theme.name}
                      className="w-full h-full object-cover object-center 
                                 transform group-hover:scale-110 transition-transform duration-500"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x300/FCD24C/ffffff?text=${encodeURIComponent(theme.name.split(' ')[0])}`;
                      }}
                    />
                  ) : (
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="w-full h-full object-cover object-center 
                                 transform group-hover:scale-110 transition-transform duration-500"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x300/FCD24C/ffffff?text=${encodeURIComponent(theme.name.split(' ')[0])}`;
                      }}
                    />
                  )}
                  
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 rounded-full flex items-center justify-center">
                    <div className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm 
                                    px-2 py-1 rounded-full">
                      Explore
                    </div>
                  </div>
                </div>

                {/* Theme Name */}
                <div className="mt-2 flex flex-col items-center">
                  <h3 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-700 
                                 group-hover:text-[#FCD24C] transition-colors  
                                 leading-tight text-center">
                    {theme.name}
                  </h3>
                 
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mt-6 md:mt-8 w-full flex justify-center"
        >
          <Link
            to="/shop"
            state={{ 
              selectedCategory: { 
                main: birthdayCategoryName,
                categoryId: birthdayCategoryId 
              } 
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD24C] to-[#FDD14E] 
                       text-white font-semibold rounded-full hover:from-[#FCD24C]/90 hover:to-[#FDD14E]/90 
                       transition-all duration-300 group shadow-lg hover:shadow-xl 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCD24C] 
                       text-sm md:text-base"
          >
            View All Birthday Themes
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

export default BirthdaySubcategories;
