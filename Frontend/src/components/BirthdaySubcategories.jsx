import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { subCategoryAPI, categoryAPI } from '../services/api';
import config from '../config/config';
import { CircleSkeleton } from './Loader/Skeleton';
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

      const response = await axios.get(`${config.API_URLS.PRODUCTS}?${urlParams.toString()}`);
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
              <CircleSkeleton key={index} />
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
    <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-slate-50 via-purple-50/30 to-slate-50">

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 relative z-10">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4">
            🎈 Party Time
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Kids Birthday Themes
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover magical worlds for your little one's special day. From superheroes to fairytales!
          </p>
        </motion.div>

        {/* Birthday Themes Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {birthdayThemes.map((theme, index) => {
            return (
              <motion.div
                key={theme.id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link
                  to="/services"
                  state={{
                    selectedCategory: {
                      main: birthdayCategoryName,
                      sub: theme.name
                    }
                  }}
                  className="block relative aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  {theme.isVideo ? (
                    <video
                      src={theme.image}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      autoPlay muted loop playsInline
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/400x500/FCD24C/ffffff?text=${encodeURIComponent(theme.name)}`;
                      }}
                    />
                  )}

                  {/* Content Overlay */}
                  <div className="absolute inset-x-4 bottom-4">
                    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl text-center shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 border border-white/50">
                      <h3 className="font-bold text-slate-800 text-sm md:text-base truncate leading-tight">
                        {theme.name}
                      </h3>
                      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        View Theme
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:mt-20"
        >
          <Link
            to="/services"
            state={{ selectedCategory: { main: birthdayCategoryName, categoryId: birthdayCategoryId } }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 hover:scale-105 transition-all shadow-xl hover:shadow-2xl ring-4 ring-slate-100"
          >
            <span>Explore All Themes</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default BirthdaySubcategories;
