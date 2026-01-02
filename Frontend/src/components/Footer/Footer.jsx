import React, { useState, useEffect } from 'react'; // NEW: Added useState, useEffect
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Award, Sparkles, ThumbsUp, ChevronDown } from 'lucide-react';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';
// DELETED: Removed static category import
// import { categories } from '../../data/categories'; 
import { categoryAPI } from '../../services/api'; // NEW: Import your category API
import axios from 'axios';
import { useCity } from '../../context/CityContext';
import logo from '/TodayMyDream.png';

// --- DYNAMIC CITY DATA ---
const CITY_API_URL = 'https://api.decoryy.com/api/cities';

// --- Accordion Component (No changes here) ---
const FooterAccordion = ({ title, items }) => {
  // ... accordion code is unchanged
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-700 lg:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4"
      >
        <h3 className="text-md font-bold text-white uppercase tracking-wider">{title}</h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="text-amber-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 pt-2 pb-4">
              {items.map((item, index) => (
                <li key={index}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="text-sm text-slate-400 hover:text-amber-500 transition-colors text-left w-full"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link to={item.link} className="text-sm text-slate-400 hover:text-amber-500 transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  const { setSelectedCity, setSelectedCityId } = useCity();

  // NEW: State to hold categories fetched from the API
  const [footerCategories, setFooterCategories] = useState([]);
  // NEW: State to hold cities fetched from the API
  const [footerCities, setFooterCities] = useState([]);

  // NEW: useEffect to fetch categories when the component mounts
  useEffect(() => {
    const fetchFooterCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        // API returns { categories: [...] } according to backend controller
        let cats = [];

        if (response && response.data) {
          if (Array.isArray(response.data)) cats = response.data;
          else if (Array.isArray(response.data.categories)) cats = response.data.categories;
          else if (Array.isArray(response.data.category)) cats = response.data.category;
        }

        // Validate and normalize category items: ensure they have a usable name
        const validated = cats
          .filter(c => c && (typeof c === 'object') && (c.name || c.title))
          .map(c => ({ name: (c.name || c.title || '').trim(), id: c._id || c.id }))
          .filter(c => c.name && c.name.length > 0);

        // Keep the top 4 categories or fallback to empty
        setFooterCategories(validated.slice(0, 8));
      } catch (error) {
        // Failed to fetch footer categories
        setFooterCategories([]);
      }
    };

    fetchFooterCategories();
  }, []); // Empty dependency array means this runs only once on mount

  // NEW: useEffect to fetch cities when the component mounts
  useEffect(() => {
    const fetchFooterCities = async () => {
      try {
        const response = await axios.get(`${CITY_API_URL}?_t=${Date.now()}`);
        // Filter to only show active cities (isActive !== false)
        const allCities = response.data.cities || [];
        const activeCities = allCities.filter(city => city.isActive !== false);
        setFooterCities(activeCities.slice(0, 8)); // Keep the top 8 cities
      } catch (error) {
        // Failed to fetch footer cities
        setFooterCities([]);
      }
    };

    fetchFooterCities();
  }, []);

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const whyChooseUsPoints = [
    { icon: <Award size={20} />, text: "Curated & Professional Venues" },
    { icon: <Sparkles size={20} />, text: "Bespoke & Creative Decorations" },
    { icon: <ThumbsUp size={20} />, text: "Seamless Booking Experience" },
  ];

  const usefulLinks = [
    { label: "About Us", link: "/about" },
    { label: "Find a Venue", link: "/venues" },
    { label: "List Your Venue", link: "/dashboard" },
    { label: "Contact Us", link: "/contact" },
    { label: "Blog", link: "/blog" },
    { label: "Policies", link: "/policies" },
  ];

  // UPDATED: Uses the dynamic 'footerCategories' state and slices the first 4
  // Provide a sensible fallback if we don't have categories from the API
  const fallbackCategoryLinks = [
    { label: 'Balloons', link: '/shop?category=Balloons' },
    { label: 'Birthday', link: '/shop?category=Birthday' },
    { label: 'Wedding', link: '/shop?category=Wedding' },
    { label: 'Anniversary', link: '/shop?category=Anniversary' },
  ];

  const categoryLinks = (footerCategories && footerCategories.length > 0
    ? footerCategories.slice(0, 10).map(cat => ({ label: cat.name, link: `/shop?category=${encodeURIComponent(cat.name)}` }))
    : fallbackCategoryLinks
  );

  // Handle city selection
  const handleCityClick = (city) => {
    setSelectedCity(city.name);
    setSelectedCityId(city._id);
    // Navigate to home page with city parameter
    navigate(`/?city=${encodeURIComponent(city.name)}`);
    window.scrollTo(0, 0);
  };

  // Create city links for footer
  const cityLinks = footerCities.map(city => ({
    label: city.name,
    onClick: () => handleCityClick(city)
  }));

  return (
    <motion.footer
      className="bg-slate-900 text-slate-300 pt-16 pb-4 border-t-4 border-amber-400 md:mb-0 mb-10"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-10">

          {/* Column 1: Logo & About */}
          <motion.div variants={itemVariants} className="lg:mb-0 col-span-1 md:col-span-2 lg:col-span-1 mb-8 md:mb-0">
            <img src={logo} alt="TodayMyDream Logo" className="h-24 mb-4 object-contain" />
            <p className="text-sm text-slate-400 pr-4">
              Your premier destination for booking beautiful, bespoke decorations for all of life's special moments.
            </p>
          </motion.div>

          {/* Column 2: Useful Links */}
          <motion.div variants={itemVariants}>
            <div className="hidden lg:block">
              <h3 className="text-lg font-serif font-bold text-white mb-4">Useful Links</h3>
              <ul className="space-y-2 text-sm">
                {usefulLinks.map((link, i) => (
                  <li key={i}><Link to={link.link} className="text-slate-400 hover:text-amber-500 transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:hidden">
              <FooterAccordion title="Useful Links" items={usefulLinks} />
            </div>
          </motion.div>

          {/* Column 3: Popular Categories */}
          <motion.div variants={itemVariants}>
            <div className="hidden lg:block">
              <h3 className="text-lg font-serif font-bold text-white mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                {categoryLinks.map((link, i) => (
                  <li key={i}><Link to={link.link} className="text-slate-400 hover:text-amber-500 transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:hidden">
              <FooterAccordion title="Categories" items={categoryLinks} />
            </div>
          </motion.div>

          {/* Column 4: Available Cities */}
          <motion.div variants={itemVariants}>
            <div className="hidden lg:block">
              <h3 className="text-lg font-serif font-bold text-white mb-4">Our Cities</h3>
              <ul className="space-y-2 text-sm">
                {cityLinks.length > 0 ? (
                  cityLinks.map((city, i) => (
                    <li key={i}>
                      <button
                        onClick={city.onClick}
                        className="text-slate-400 hover:text-amber-500 transition-colors text-left"
                      >
                        {city.label}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 text-xs italic">Loading cities...</li>
                )}
              </ul>
            </div>
            <div className="lg:hidden">
              <FooterAccordion title="Our Cities" items={cityLinks.map(city => ({
                label: city.label,
                link: '#',
                onClick: city.onClick
              }))} />
            </div>
          </motion.div>

          {/* Column 5: Why Choose Us & Social */}
          <motion.div variants={itemVariants} className="mt-10 lg:mt-0 col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-serif font-bold text-white mb-4">Why Choose Us</h3>
            <ul className="space-y-4 text-sm">
              {whyChooseUsPoints.map((point, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-amber-400 flex-shrink-0">{point.icon}</span>
                  <span className="text-slate-400">{point.text}</span>
                </li>
              ))}
            </ul>

          </motion.div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          {/* Left Side: Copyright */}
          <p className="order-3 md:order-1 text-center md:text-left mb-16 md:mb-0">
            &copy; {new Date().getFullYear()} TodayMyDream. All Rights Reserved.
          </p>

          {/* Right Side: Socials & App Wrapper */}
          <div className="order-1 md:order-2 flex flex-col sm:flex-row items-center gap-6 md:gap-8">

            {/* Social Media Section */}
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-white">Follow Us</span>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61580103717383"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all hover:scale-110"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://www.instagram.com/decoryy.official?igsh=MXBuaGhyenhqbHBmYw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all hover:scale-110"
                >
                  <Instagram size={16} />
                </a>
              </div>
            </div>


          </div>
        </div>


      </div>
    </motion.footer>
  );
};

export default Footer;
