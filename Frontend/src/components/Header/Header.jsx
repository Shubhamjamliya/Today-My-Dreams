import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- CONTEXTS ---

import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { useCart } from '../../context/CartContext';
import { cityAPI } from '../../services/api';

// --- CONFIG & ASSETS ---
import config from '../../config/config.js';
import logo from '/TodayMyDream.png';
import Loader from '../Loader';
import { slugify } from '../../utils/slugify';
import ContactInfoBar from '../ContactInfoBar';
// ShopMegaMenu Component
const ShopMegaMenu = ({ categories, closeMenu }) => (
    <motion.div
        initial={{ opacity: 0, y: 15, pointerEvents: 'none' }}
        animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
        exit={{ opacity: 0, y: 15, pointerEvents: 'none' }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="absolute top-full left-0 w-full bg-slate-900 border-t border-slate-800 shadow-2xl z-40"
    >
        <div className="container mx-auto px-6 py-10">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-wide uppercase flex items-center gap-3">
                    <FaShoppingBag className="text-[#FCD24C]" />
                    Shop Collections
                </h3>
                <Link to="/shop" onClick={closeMenu} className="text-[#FCD24C] hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors group">
                    View All Shop Products <FaChevronDown className="-rotate-90 group-hover:translate-x-1 transition-transform" size={12} />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {(categories || []).slice(0, 10).map((cat) => (
                    <Link
                        key={cat._id}
                        to="/shop"
                        state={{ selectedCategory: { main: cat.name } }}
                        onClick={closeMenu}
                        className="group relative overflow-hidden rounded-2xl bg-slate-800/50 hover:bg-slate-800 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FCD24C]/5 border border-slate-800 hover:border-[#FCD24C]/30"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="relative w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-[#FCD24C] flex items-center justify-center overflow-hidden shadow-sm transition-colors duration-300">
                                {cat.image ? (
                                    <img
                                        src={config.fixImageUrl(cat.image)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <FaShoppingBag size={28} className="text-slate-400 group-hover:text-[#FCD24C] transition-colors" />
                                )}
                            </div>
                            <div className="w-full">
                                <h4 className="font-extrabold text-white text-sm tracking-wide group-hover:text-[#FCD24C] transition-colors truncate">{cat.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider group-hover:text-slate-300">
                                    Browse Products
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </motion.div>
);




// --- ICONS ---
import {
    FaMapMarkerAlt, FaSearch, FaShoppingCart, FaUserCircle, FaChevronDown,
    FaHome, FaThLarge, FaPhoneAlt, FaBirthdayCake,
    FaInfoCircle,
    FaChevronCircleDown,
    FaFileAlt,
    FaShoppingBag,
    FiMenu, FiX,
    BiUser,
    MdOutlineCelebration, MdSelectAll,
    Building2, Grid, Option, OptionIcon, Package, Package2, User, User2Icon, BookOpen, Video
} from '../../utils/iconImports';

// --- SUB-COMPONENTS ---

const LocationModal = ({ isOpen, onClose, onSelectLocation, currentLocation }) => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            cityAPI.getCities()
                .then(res => {
                    // Filter to only show active cities (isActive !== false)
                    const allCities = res.data.cities || [];
                    const activeCities = allCities.filter(city => city.isActive !== false);
                    setCities(activeCities);
                })
                .catch(() => setError('Failed to fetch cities'))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleSelect = (location) => {
        onSelectLocation(location.name, location._id);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={currentLocation ? onClose : undefined}>
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="font-bold text-2xl text-slate-800">Select your City</h2>
                                <p className="text-slate-500 mt-1">Find more than 3000 decorations, gifts and surprises!</p>
                            </div>
                            {currentLocation && (
                                <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors text-slate-600">
                                    <FiX size={24} />
                                </button>
                            )}
                        </div>

                        {/* City Grid */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto bg-slate-50/50">
                            {loading && <div className="p-8 text-center text-slate-500"><Loader /></div>}
                            {error && <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>}

                            {!loading && !error && (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {cities.map(location => (
                                        <button
                                            key={location._id}
                                            onClick={() => handleSelect(location)}
                                            className={`
                                                flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 group h-32
                                                ${currentLocation === location.name
                                                    ? 'border-[#FCD24C] bg-[#FCD24C]/5'
                                                    : 'border-white bg-white hover:border-[#FCD24C] hover:shadow-lg shadow-sm'
                                                }
                                            `}
                                        >
                                            {/* City Icon/Image Placeholder - ideally fetch actual city icons if available */}
                                            <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                                                {/* Using a generic building icon as placeholder. In a real app, you'd map city names to specific icon assets */}
                                                <Building2 size={32} className={currentLocation === location.name ? 'text-[#FCD24C]' : 'text-slate-400 group-hover:text-[#FCD24C]'} />
                                            </div>
                                            <span className={`font-bold text-sm ${currentLocation === location.name ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{location.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const BottomNavItem = ({ to, icon, label, isActive }) => {
    const handleClick = () => {
        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Link
            to={to}
            onClick={handleClick}
            className="flex flex-col items-center justify-center text-center w-16 group focus:outline-none focus:ring-2 focus:ring-[#FCD24C]/50 rounded-lg py-1"
        >
            <div className={`transition-all duration-300 ease-in-out transform ${isActive ? 'scale-110 -translate-y-0.5 text-blue' : 'text-slate-500 group-hover:text-blue'}`}>
                {icon}
            </div>
            <span className={`text-[10px] mt-1 font-semibold transition-colors duration-300 ${isActive ? 'text-blue' : 'text-slate-600'}`}>
                {label}
            </span>
        </Link>
    );
};

const BottomNav = ({ user }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-lg border-t border-slate-200/80 z-50 shadow-lg"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex justify-around items-center h-14 px-2">
                <BottomNavItem to="/" icon={<FaHome size={20} />} label="Home" isActive={currentPath === '/'} />
                <Link
                    to="/shop"
                    className="flex flex-col items-center justify-center text-center w-16 group focus:outline-none"
                >
                    <div className={`transition-all duration-300 ease-in-out transform ${currentPath === '/shop' ? 'scale-110 -translate-y-0.5 text-blue' : 'text-slate-500 group-hover:text-blue'}`}><FaThLarge size={20} /></div>
                    <span className={`text-[10px] mt-1 font-semibold transition-colors duration-300 ${currentPath === '/shop' ? 'text-blue' : 'text-slate-600'}`}>Shop</span>
                </Link>
                <BottomNavItem to="/subcategory" icon={<FaBirthdayCake size={20} />} label="Categories" isActive={currentPath.startsWith('/subcategory')} />

                <BottomNavItem to="/contact" icon={<FaPhoneAlt size={20} />} label="Contact" isActive={currentPath === '/contact'} />

            </div>
        </div>
    );
};

const MegaMenu = ({ categories, closeMenu }) => (
    <motion.div
        initial={{ opacity: 0, y: 15, pointerEvents: 'none' }}
        animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
        exit={{ opacity: 0, y: 15, pointerEvents: 'none' }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="absolute top-full left-0 w-full bg-slate-900 border-t border-slate-800 shadow-2xl z-40"
    >
        <div className="container mx-auto px-6 py-10">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-wide uppercase flex items-center gap-3">
                    <MdOutlineCelebration className="text-[#FCD24C]" />
                    Explore Categories
                </h3>
                <Link to="/subcategory" onClick={closeMenu} className="text-[#FCD24C] hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors group">
                    View All Categories <FaChevronDown className="-rotate-90 group-hover:translate-x-1 transition-transform" size={12} />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {categories.slice(0, 10).map((cat, index) => (
                    <Link
                        key={cat._id}
                        to="/services"
                        state={{ selectedCategory: { main: cat.name } }}
                        onClick={closeMenu}
                        className="group relative overflow-hidden rounded-2xl bg-slate-800/50 hover:bg-slate-800 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FCD24C]/5 border border-slate-800 hover:border-[#FCD24C]/30"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="relative w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-[#FCD24C] flex items-center justify-center overflow-hidden shadow-sm transition-colors duration-300">
                                {cat.image ? (
                                    <img
                                        src={config.fixImageUrl(cat.image)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <FaBirthdayCake size={28} className="text-slate-400 group-hover:text-[#FCD24C] transition-colors" />
                                )}
                            </div>
                            <div className="w-full">
                                <h4 className="font-extrabold text-white text-sm tracking-wide group-hover:text-[#FCD24C] transition-colors truncate">{cat.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider group-hover:text-slate-300">
                                    Browse Collection
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </motion.div>
);

const Header = () => {
    // --- STATE MANAGEMENT ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);

    // Use CityContext for city selection
    const { selectedCity, updateCity, shouldShowCityModal, setShouldShowCityModal } = useCity();

    // Show city modal on first load if no city is selected
    useEffect(() => {
        if (shouldShowCityModal) {
            setIsLocationModalOpen(true);
        }
    }, [shouldShowCityModal]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // --- REFS & ROUTING ---
    const searchInputRef = useRef(null);
    const searchBarRef = useRef(null);
    const desktopSearchRef = useRef(null);
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();


    // --- EFFECT: Fetch Categories (Service & Shop) ---
    useEffect(() => {
        setCategoriesLoading(true);
        const urlParams = new URLSearchParams();
        if (selectedCity) {
            urlParams.append('city', selectedCity);
        }

        Promise.all([
            axios.get(`${config.API_URLS.CATEGORIES}?${urlParams.toString()}`),
            axios.get(`${config.API_URLS.SHOP_CATEGORIES}?${urlParams.toString()}`)
        ])
            .then(([catsRes, shopRes]) => {
                setDynamicCategories(catsRes.data.categories || []);
                setShopCategories(shopRes.data.categories || shopRes.data || []);
            })
            .catch(error => { console.error("Error fetching categories", error); })
            .finally(() => setCategoriesLoading(false));
    }, [selectedCity]);

    // --- EFFECT: Handle Search Input & Outside Clicks ---
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }

        const closeSearch = () => {
            setIsSearchOpen(false);
            setIsDesktopSearchFocused(false);
            setSearchResults([]);
            setSearchQuery('');
        };

        const handleClickOutside = (e) => {
            if (isSearchOpen && searchBarRef.current && !searchBarRef.current.contains(e.target)) closeSearch();
            if (isDesktopSearchFocused && desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) closeSearch();
        };

        const handleEsc = (e) => e.key === 'Escape' && closeSearch();

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isSearchOpen, isDesktopSearchFocused]);

    // --- EFFECT: Fetch Search Suggestions with optimized debouncing ---
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        // Set loading immediately for better UX
        setSearchLoading(true);

        const fetchSuggestions = setTimeout(async () => {
            try {
                setSearchError(null);
                const urlParams = new URLSearchParams();
                urlParams.append('q', searchQuery.trim());
                urlParams.append('limit', '8');
                if (selectedCity) {
                    urlParams.append('city', selectedCity);
                }

                const response = await axios.get(`${config.API_URLS.PRODUCTS}/search/suggestions?${urlParams.toString()}`, {
                    timeout: 3000 // 3 second timeout for suggestions
                });

                // Transform suggestions into the format expected by the UI
                const suggestions = response.data.suggestions || [];
                setSearchResults(suggestions);
            } catch (err) {
                // Search error
                setSearchError('Failed to fetch suggestions');
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300); // Faster debounce for suggestions

        return () => clearTimeout(fetchSuggestions);
    }, [searchQuery, selectedCity]);

    // --- HANDLERS (memoized for better performance) ---
    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setIsDesktopSearchFocused(false);
        }
    }, [searchQuery, navigate]);

    const handleResultClick = useCallback((item) => {
        if (item.type === 'product') {
            navigate(`/product/${item.id}`);
        } else if (item.type === 'category') {
            navigate(`/services?category=${encodeURIComponent(item.name)}`);
        }
        setIsSearchOpen(false);
        setIsDesktopSearchFocused(false);
        setSearchQuery('');
        setSearchResults([]);
    }, [navigate]);

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setIsMegaMenuOpen(false);
    };

    const menuLinks = [

        { label: 'Contact Us', href: '/contact', icon: <FaPhoneAlt /> },

        { label: 'About us', href: '/about', icon: < FaInfoCircle /> },
        { label: 'Blog', href: '/blog', icon: <BookOpen /> },
        { label: 'Policies', href: '/policies', icon: <FaFileAlt /> },

        { label: 'Categories', href: '/subcategory', icon: <FaBirthdayCake /> },
    ];

    // Handler for My Orders click
    const handleMyOrdersClick = () => {
        if (user) {
            // User is logged in, navigate to account page with orders tab
            navigate('/account?tab=orders');
        } else {
            // User is not logged in, navigate to login page
            navigate('/login');
        }
        closeAllMenus();
    };

    return (
        <>
            {/* Contact Info Bar */}
            <ContactInfoBar />

            <header className="bg-slate-900 w-full sticky top-0 z-50">
                {/* --- PREMIUM DESKTOP HEADER --- */}
                <div className="hidden md:block">
                    {/* [REMOVED] Tier 1: Utility Bar */}


                    {/* Tier 2: Main Navigation & Actions Bar - FULL WIDTH REDESIGN (Dark Mode) */}
                    <div className="bg-slate-900 shadow-xl relative z-50">
                        <div className="w-full px-6 lg:px-12 h-28 flex items-center justify-between gap-6 xl:gap-16">

                            {/* 1. Left Section: Logo & Primary Nav */}
                            <div className="flex items-center gap-10 shrink-0">
                                <Link to="/" onClick={closeAllMenus} className="flex-shrink-0 hover:opacity-90 transition-opacity">
                                    {/* Logo with brightness filter for dark mode compatibility if needed, or keeping original */}
                                    <img src={logo} alt="TodayMyDream Logo" className="h-24 w-auto object-contain drop-shadow-md" />
                                </Link>

                                {/* Desktop Navigation Links (White text) */}
                                <nav className="hidden xl:flex items-center gap-8 text-white">
                                    <div
                                        onMouseEnter={() => {
                                            if (window.shopMenuTimeout) clearTimeout(window.shopMenuTimeout);
                                            setIsShopMegaMenuOpen(true);
                                        }}
                                        onMouseLeave={() => {
                                            window.shopMenuTimeout = setTimeout(() => {
                                                setIsShopMegaMenuOpen(false);
                                            }, 200);
                                        }}
                                        className="relative h-full flex items-center"
                                    >
                                        <button className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase hover:text-[#FCD24C] transition-colors duration-300 group py-2 text-white">
                                            Shop
                                            <FaChevronDown size={10} className="group-hover:rotate-180 transition-transform duration-300 transform group-hover:text-[#FCD24C]" />
                                        </button>
                                    </div>

                                    <div
                                        onMouseEnter={() => {
                                            if (window.megaMenuTimeout) clearTimeout(window.megaMenuTimeout);
                                            setIsMegaMenuOpen(true);
                                        }}
                                        onMouseLeave={() => {
                                            window.megaMenuTimeout = setTimeout(() => {
                                                setIsMegaMenuOpen(false);
                                            }, 200);
                                        }}
                                        className="relative h-full flex items-center"
                                    >
                                        <button className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase hover:text-[#FCD24C] transition-colors duration-300 group py-2">
                                            Categories
                                            <FaChevronDown size={10} className="group-hover:rotate-180 transition-transform duration-300 transform group-hover:text-[#FCD24C]" />
                                        </button>
                                    </div>


                                </nav>
                            </div>

                            {/* 2. Center Section: Search Box (Dark Theme) */}
                            {!location.pathname.startsWith('/product/') && (

                                <div className="flex-1 max-w-4xl relative hidden md:flex items-center gap-4" ref={desktopSearchRef}>
                                    <form onSubmit={handleSearchSubmit} className="flex-1">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <FaSearch className="text-slate-400 group-focus-within:text-[#FCD24C] transition-colors duration-300" size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search for anything..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onFocus={() => setIsDesktopSearchFocused(true)}
                                                className="block w-full h-14 pl-14 pr-32 bg-slate-800 text-white border border-slate-700 rounded-2xl shadow-inner group-hover:bg-slate-700/80 focus:bg-slate-800 focus:shadow-xl focus:border-[#FCD24C]/50 focus:ring-0 text-base font-medium placeholder:text-slate-500 transition-all duration-300"
                                            />
                                            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-[#FCD24C] hover:bg-[#ffe066] text-slate-900 px-8 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 shadow-lg">
                                                Search
                                            </button>
                                        </div>
                                    </form>

                                    {/* Location Selector Button (Next to Search) */}
                                    <button
                                        onClick={() => setIsLocationModalOpen(true)}
                                        className="h-14 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl flex items-center gap-3 transition-all duration-300 group shrink-0"
                                    >
                                        <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-[#FCD24C] transition-colors">
                                            <FaMapMarkerAlt className="text-[#FCD24C] group-hover:text-slate-900" size={16} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Location</span>
                                            <span className="text-sm font-bold text-white group-hover:text-[#FCD24C] transition-colors max-w-[100px] truncate">
                                                {selectedCity || 'Select City'}
                                            </span>
                                        </div>
                                        <FaChevronDown className="text-slate-500 group-hover:text-white ml-2" size={12} />
                                    </button>

                                    {/* Desktop Search Results Dropdown */}
                                    <AnimatePresence>
                                        {isDesktopSearchFocused && searchQuery.trim() && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute top-full left-0 right-0 mt-4 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 z-50 overflow-hidden"
                                            >
                                                {searchLoading && <div className="p-4 text-center text-slate-400"><Loader /></div>}
                                                {searchError && <div className="p-4 text-center text-red-500">{searchError}</div>}
                                                {!searchLoading && !searchError && searchResults.length === 0 && <div className="p-4 text-center text-slate-400">No products found.</div>}
                                                {!searchLoading && !searchError && searchResults.length > 0 && (
                                                    <ul className="max-h-96 overflow-y-auto custom-scrollbar">
                                                        {searchResults.map((item, index) => (
                                                            <li key={`${item.type}-${item.id}-${index}`} onClick={() => handleResultClick(item)} className="flex items-center p-4 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-b-0 transition-colors">
                                                                <div className="w-12 h-12 rounded-lg mr-4 flex items-center justify-center bg-slate-700 overflow-hidden">
                                                                    {item.type === 'product' ? (
                                                                        <img src={config.fixImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <FaBirthdayCake size={16} className="text-[#FCD24C]" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-white">{item.name}</p>
                                                                    <p className="text-xs text-slate-400 truncate">
                                                                        {item.type === 'product' ? (item.category || item.subCategory) : 'Category'}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    {item.type === 'product' && <p className="font-bold text-[#FCD24C]">₹{item.price}</p>}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* 3. Right Section: User & Cart Actions (Dark Mode) */}
                            <div className="flex items-center gap-8 shrink-0">
                                {user ? (
                                    <Link to="/account" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all duration-300 group">
                                        <div className="bg-slate-800 p-2 rounded-lg text-[#FDD14E]">
                                            <FaUserCircle size={20} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hello,</span>
                                            <span className="text-xs font-black text-white leading-none group-hover:text-[#FCD24C] transition-colors">
                                                {user.name.split(' ')[0]}
                                            </span>
                                        </div>
                                    </Link>
                                ) : (
                                    <Link to="/login" className="flex items-center gap-2 text-white hover:text-[#FCD24C] font-extrabold text-sm uppercase tracking-wide transition-colors">
                                        <FaUserCircle size={24} />
                                        <span>Login</span>
                                    </Link>
                                )}

                                {/* Cart Icon */}
                                <Link to="/shop/cart" className="relative p-3 bg-white/10 hover:bg-white/15 rounded-xl text-white group transition-all duration-300">
                                    <FaShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                                    {getCartCount() > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#FCD24C] text-slate-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                                            {getCartCount()}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- (MODIFIED) MOBILE HEADER (Dark Mode) --- */}
                <div className="md:hidden bg-slate-900 border-b border-white/10">
                    {/* Top bar: Menu, Logo, Cart */}
                    <div className="relative px-4 flex items-center justify-between h-16">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 -ml-2">
                            <FiMenu size={24} />
                        </button>
                        <Link to="/" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link to="/shop/cart" className="relative text-white hover:text-[#FCD24C] transition-colors">
                                <FaShoppingCart size={22} />
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[#FCD24C] text-slate-900 text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <Link to="/account" className="flex items-center gap-1.5 text-white hover:text-[#FCD24C] transition-colors">
                                    <FaUserCircle size={22} />
                                </Link>
                            ) : (
                                <Link to="/login" className="flex items-center gap-1.5 text-white hover:text-[#FCD24C] transition-colors">
                                    <FaUserCircle size={22} />
                                </Link>
                            )}
                        </div>
                    </div>
                    {/* --- NEW: Tier 2 Mobile - Search & Location --- */}
                    <div className="bg-slate-900 pb-3 px-4 flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchOpen(true)} // Using existing menu open to show search overlay logic if needed, or better separate state
                                className="w-full h-10 pl-10 pr-4 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#FCD24C] focus:ring-1 focus:ring-[#FCD24C] text-white placeholder:text-slate-500"
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        </div>

                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="h-10 px-3 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-[#FCD24C]"
                        >
                            <FaMapMarkerAlt size={16} />
                        </button>
                    </div>
                </div>

                {/* --- MEGA MENU RENDER (Service Categories) --- */}
                <div
                    className="hidden md:block"
                    onMouseEnter={() => {
                        if (window.megaMenuTimeout) clearTimeout(window.megaMenuTimeout);
                        setIsMegaMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                        window.megaMenuTimeout = setTimeout(() => {
                            setIsMegaMenuOpen(false);
                        }, 200);
                    }}
                >
                    <AnimatePresence>
                        {isMegaMenuOpen && !categoriesLoading && <MegaMenu categories={dynamicCategories} closeMenu={closeAllMenus} />}
                    </AnimatePresence>
                </div>

                {/* --- SHOP MEGA MENU RENDER --- */}
                <div
                    className="hidden md:block"
                    onMouseEnter={() => {
                        if (window.shopMenuTimeout) clearTimeout(window.shopMenuTimeout);
                        setIsShopMegaMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                        window.shopMenuTimeout = setTimeout(() => {
                            setIsShopMegaMenuOpen(false);
                        }, 200);
                    }}
                >
                    <AnimatePresence>
                        {isShopMegaMenuOpen && !categoriesLoading && <ShopMegaMenu categories={shopCategories} closeMenu={closeAllMenus} />}
                    </AnimatePresence>
                </div>
            </header>

            {/* --- Mobile Slide-Out Menu --- */}
            < AnimatePresence >
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="fixed inset-0 bg-white z-[60] h-screen md:hidden"
                    >
                        <div className="flex justify-between items-center p-4 border-b border-slate-200">
                            <img src={logo} alt="Logo" className="h-6" />
                            <button onClick={closeAllMenus}><FiX size={24} className="text-slate-600" /></button>
                        </div>
                        <div className="p-4 overflow-y-auto h-[calc(100vh-65px)]">
                            {user ? (
                                <div className="bg-gradient-to-br from-[#FDD14E] to-[#FDD14E] p-4 rounded-xl mb-5 text-center">
                                    <FaUserCircle size={36} className="text-[#FDD14E]0 mx-auto mb-2" />
                                    <h3 className="font-bold text-base text-slate-800">Welcome, {user.name.split(' ')[0]}!</h3>
                                    <Link to="/account" onClick={closeAllMenus} className="mt-2 inline-block bg-[#FDD14E]0 hover:bg-[#FDD14E] text-blue font-bold py-2 px-5 text-sm rounded-full">My Account</Link>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-[#FDD14E] to-[#FDD14E] p-4 rounded-xl mb-5 text-center">
                                    <FaUserCircle size={36} className="text-slate-400 mx-auto mb-2" />
                                    <h3 className="font-bold text-base text-slate-800">Welcome Guest</h3>
                                    <Link to="/login" onClick={closeAllMenus} className="mt-2 inline-block bg-[#FCD24C] hover:bg-[#FDD14E]0 text-blue font-bold py-2 px-5 text-sm rounded-full">Login / Sign Up</Link>
                                </div>
                            )}

                            {/* My Orders Section */}
                            <div className="mb-5">
                                <button
                                    onClick={handleMyOrdersClick}
                                    className="w-full flex items-center gap-3 py-3 px-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-[#FDD14E] transition-colors"
                                >
                                    <span className="text-slate-500 w-5 text-center">
                                        <FaShoppingBag size={16} />
                                    </span>
                                    My Orders
                                </button>
                            </div>

                            <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider mb-3 px-2">Shop by Category</h3>
                            <ul>
                                {dynamicCategories.map((cat) => (
                                    <li key={cat._id}>
                                        <Link to="/services" state={{ selectedCategory: { main: cat.name } }} onClick={closeAllMenus} className="group flex items-center gap-3 py-3 px-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-[#FDD14E] transition-colors">
                                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                                {cat.image ? (
                                                    <img
                                                        src={config.fixImageUrl(cat.image)}
                                                        alt={cat.name}
                                                        className="w-8 h-8 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <FaBirthdayCake size={16} className="text-custom-dark-blue" />
                                                )}
                                            </div>
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <hr className="my-4 border-slate-200/80" />
                            <ul>
                                <li>
                                    <Link
                                        to="/shop"
                                        onClick={closeAllMenus}
                                        className="w-full flex items-center gap-3 py-3 px-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-[#FDD14E] transition-colors"
                                    >
                                        <span className="text-slate-500 w-5 text-center"><FaShoppingCart /></span> Shop
                                    </Link>
                                </li>
                                {menuLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.href} onClick={closeAllMenus} className="flex items-center gap-3 py-3 px-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-[#FDD14E] transition-colors">
                                            <span className="text-slate-500 w-5 text-center">{link.icon}</span> {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* --- Fullscreen Mobile Search Overlay --- */}
            < AnimatePresence >
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white z-[70] p-4 flex flex-col"
                        ref={searchBarRef}
                    >
                        <div className="flex-shrink-0 flex items-center gap-4">
                            <form onSubmit={handleSearchSubmit} className="relative flex-1">
                                <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-11 pr-4 text-slate-700 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FCD24C]"
                                />
                            </form>
                            <button onClick={() => setIsSearchOpen(false)} className="text-slate-600 font-medium">Cancel</button>
                        </div>
                        <div className="flex-grow overflow-y-auto mt-4">
                            {searchLoading && <div className="p-4 text-center"><Loader /></div>}
                            {searchError && <div className="p-4 text-center text-red-500">{searchError}</div>}
                            {!searchLoading && !searchError && searchResults.length === 0 && searchQuery.trim() && <div className="p-4 text-center text-slate-500">No products found.</div>}
                            {!searchLoading && !searchError && searchResults.length > 0 && (
                                <ul>
                                    {searchResults.map((item, index) => (
                                        <li key={`${item.type}-${item.id}-${index}`} onClick={() => handleResultClick(item)} className="flex items-center p-4 hover:bg-[#FDD14E] cursor-pointer rounded-lg">
                                            <div className="w-16 h-16 rounded-lg mr-4 flex items-center justify-center bg-slate-100">
                                                {item.type === 'product' ? (
                                                    <img src={config.fixImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <FaBirthdayCake size={20} className="text-custom-dark-blue" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800">{item.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {item.type === 'product'
                                                        ? `${item.category || ''} ${item.subCategory ? `• ${item.subCategory}` : ''}`.trim()
                                                        : item.description || 'Category'
                                                    }
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {item.type === 'product' ? (
                                                    <p className="font-bold text-custom-dark-blue">₹{item.price}</p>
                                                ) : (
                                                    <span className="text-xs text-custom-dark-blue font-medium uppercase">Category</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* --- Modals & Bottom Navigation --- */}
            < LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => {
                    if (selectedCity) {
                        setIsLocationModalOpen(false);
                        setShouldShowCityModal(false);
                    }
                }}
                onSelectLocation={updateCity}
                currentLocation={selectedCity}
            />

            <BottomNav user={user} />
        </>
    );
};

export default Header;