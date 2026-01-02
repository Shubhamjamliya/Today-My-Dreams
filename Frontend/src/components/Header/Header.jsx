import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- CONTEXTS ---

import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';

// --- CONFIG & ASSETS ---
import config from '../../config/config.js';
import logo from '/TodayMyDream.png';
import Loader from '../Loader';
import { slugify } from '../../utils/slugify';
import ContactInfoBar from '../ContactInfoBar';

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

// --- DYNAMIC CITY DATA ---
const CITY_API_URL = 'https://api.decoryy.com/api/cities';

// --- SUB-COMPONENTS ---

const LocationModal = ({ isOpen, onClose, onSelectLocation, currentLocation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // Add timestamp to prevent caching
            axios.get(`${CITY_API_URL}?_t=${Date.now()}`)
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

    const filteredLocations = useMemo(() => cities.filter(city => city.name.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, cities]);
    const handleSelect = (location) => {
        onSelectLocation(location.name, location._id);
        onClose();
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 " onClick={currentLocation ? onClose : undefined}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-xl text-slate-800">Select Your City</h2>
                                    <p className="text-sm text-slate-500">Choose your city for accurate service availability.</p>
                                </div>
                                {currentLocation && (
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                        <FiX size={24} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-4">
                            <input type="text" placeholder="Search for your city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-3 px-4 text-sm text-slate-700 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD24C]/50" />
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto px-4 pb-4">
                            {loading && <div className="p-4 text-center"><Loader /></div>}
                            {error && <div className="p-4 text-center text-red-500">{error}</div>}
                            <ul className="space-y-1">
                                {filteredLocations.map(location => (
                                    <li key={location._id}>
                                        <button
                                            onClick={() => handleSelect(location)}
                                            className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${currentLocation === location.name ? 'bg-[#FCD24C]/10 text-blue' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <span>{location.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${currentLocation === location.name ? 'bg-[#FCD24C] text-slate-800' : 'bg-slate-200 text-slate-600'}`}>
                                                {location.productCount || 0} products
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
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
                <BottomNavItem to="/shop" icon={<FaThLarge size={20} />} label="Shop" isActive={currentPath.startsWith('/shop')} />
                <BottomNavItem to="/subcategory" icon={<FaBirthdayCake size={20} />} label="Categories" isActive={currentPath.startsWith('/subcategory')} />
                <BottomNavItem to="/venues" icon={<Building2 size={20} />} label="Venues" isActive={currentPath === '/venues'} />
                <BottomNavItem to="/contact" icon={<FaPhoneAlt size={20} />} label="Contact" isActive={currentPath === '/contact'} />

            </div>
        </div>
    );
};

const MegaMenu = ({ categories, closeMenu }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-lg z-[-1]"
    >
        <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            {categories.map((cat) => (
                <Link key={cat._id} to="/shop" state={{ selectedCategory: { main: cat.name } }} onClick={closeMenu} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-[#FDD14E] transition-colors">
                    <div className="bg-[#FDD14E] p-2 rounded-lg overflow-hidden flex-shrink-0">
                        {cat.image ? (
                            <img
                                src={config.fixImageUrl(cat.image)}
                                alt={cat.name}
                                className="w-12 h-12 object-cover rounded-lg"
                            />
                        ) : (
                            <FaBirthdayCake size={20} className="text-slate-600 m-3" />
                        )}
                    </div>
                    <div >
                        <p className="font-bold text-slate-800 group-hover:text-blue">{cat.name}</p>
                        <p className="text-sm text-slate-500">{cat.description || "Explore our collection"}</p>
                    </div>
                </Link>
            ))}
        </div>
    </motion.div>
);

const Header = () => {
    // --- STATE MANAGEMENT ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

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
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // --- REFS & ROUTING ---
    const searchInputRef = useRef(null);
    const searchBarRef = useRef(null);
    const desktopSearchRef = useRef(null);
    const navigate = useNavigate();


    const { user } = useAuth();

    // --- EFFECT: Fetch Categories ---
    useEffect(() => {
        setCategoriesLoading(true);
        const urlParams = new URLSearchParams();
        if (selectedCity) {
            urlParams.append('city', selectedCity);
        }

        axios.get(`${config.API_URLS.CATEGORIES}?${urlParams.toString()}`)
            .then(response => setDynamicCategories(response.data.categories || []))
            .catch(error => { /* Error fetching categories */ })
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
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setIsDesktopSearchFocused(false);
        }
    }, [searchQuery, navigate]);

    const handleResultClick = useCallback((item) => {
        if (item.type === 'product') {
            navigate(`/product/${item.id}`);
        } else if (item.type === 'category') {
            navigate(`/shop?category=${encodeURIComponent(item.name)}`);
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
        { label: 'Choose Venue', href: '/venues', icon: <MdOutlineCelebration /> },
        { label: 'About us', href: '/about', icon: < FaInfoCircle /> },
        { label: 'Blog', href: '/blog', icon: <BookOpen /> },
        { label: 'Policies', href: '/policies', icon: <FaFileAlt /> },

        { label: 'Categories', href: '/subcategory', icon: <FaBirthdayCake /> },
        { label: 'Shop', href: '/shop', icon: <FaShoppingCart /> },
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

            <header className="bg-[#FDD14E] md:bg-[#FDD14E] backdrop-blur-lg w-full sticky top-0 z-50 ">
                {/* --- PREMIUM DESKTOP HEADER --- */}
                <div className="hidden md:block">
                    {/* Tier 1: Utility Bar */}
                    <div className="bg-[#FDD14E]">
                        <div className="container mx-auto px-4 sm:px-6 h-10 flex justify-between items-center">

                            {/* Left side links */}
                            <div className="flex gap-4 text-xs text-slate-600 font-semibold tracking-wide antialiased">
                                <a href="/about" className="hover:text-blue transition-all duration-200 flex items-center gap-1.5 hover:scale-105">
                                    <FaInfoCircle size={12} /> <span className="uppercase">About Us</span>
                                </a>
                                <a href="/contact" className="hover:text-blue transition-all duration-200 flex items-center gap-1.5 hover:scale-105">
                                    <FaPhoneAlt size={12} /> <span className="uppercase">Contact</span>
                                </a>
                                <a href="/policies" className="hover:text-blue transition-all duration-200 flex items-center gap-1.5 hover:scale-105">
                                    <FaFileAlt size={12} /> <span className="uppercase">Policy</span>
                                </a>
                                <a href="/blog" className="hover:text-blue transition-all duration-200 flex items-center gap-1.5 hover:scale-105">
                                    <BookOpen size={12} /> <span className="uppercase">Blog</span>
                                </a>
                            </div>

                            {/* Location dropdown (unchanged) */}
                            <button
                                onClick={() => setIsLocationModalOpen(true)}
                                className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue font-semibold tracking-wide antialiased transition-all duration-200 hover:scale-105"
                            >
                                <FaMapMarkerAlt />
                                <span className="uppercase">{selectedCity || 'Select City'}</span>
                                <FaChevronCircleDown size={10} />
                            </button>

                        </div>
                    </div>


                    {/* Tier 2: Main Navigation & Actions Bar - FULL WIDTH REDESIGN */}
                    <div className="border-b border-white/20 bg-[#FDD14E] shadow-md relative z-50">
                        <div className="w-full px-6 lg:px-12 h-28 flex items-center justify-between gap-6 xl:gap-16">

                            {/* 1. Left Section: Logo & Primary Nav */}
                            <div className="flex items-center gap-10 shrink-0">
                                <Link to="/" onClick={closeAllMenus} className="flex-shrink-0 hover:opacity-90 transition-opacity">
                                    <img src={logo} alt="Decoryy Logo" className="h-24 w-auto object-contain drop-shadow-md" />
                                </Link>

                                {/* Desktop Navigation Links */}
                                <nav className="hidden xl:flex items-center gap-8 text-slate-900">
                                    <Link to="/shop" className="font-extrabold text-sm tracking-widest uppercase hover:text-white transition-colors duration-300 relative group py-2">
                                        Shop
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                    </Link>

                                    <div onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)} className="relative h-full flex items-center">
                                        <button className="flex items-center gap-2 font-extrabold text-sm tracking-widest uppercase hover:text-white transition-colors duration-300 group py-2">
                                            Categories
                                            <FaChevronDown size={10} className="group-hover:rotate-180 transition-transform duration-300" />
                                        </button>
                                    </div>

                                    <Link to="/venues" className="flex items-center gap-2 font-extrabold text-sm tracking-widest uppercase hover:text-white transition-colors duration-300 relative group py-2">
                                        <MdOutlineCelebration size={18} /> Venue
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </nav>
                            </div>

                            {/* 2. Center Section: Search Box (Wider & Modern) */}
                            {!location.pathname.startsWith('/product/') && (
                                <div className="flex-1 max-w-4xl relative hidden md:block" ref={desktopSearchRef}>
                                    <form onSubmit={handleSearchSubmit}>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <FaSearch className="text-slate-500 group-focus-within:text-[#FCD24C] transition-colors duration-300" size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search for anything..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onFocus={() => setIsDesktopSearchFocused(true)}
                                                className="block w-full h-14 pl-14 pr-6 bg-white text-slate-900 border-none rounded-2xl shadow-sm group-hover:shadow-lg focus:shadow-xl focus:ring-0 text-base font-medium placeholder:text-slate-400 transition-all duration-300"
                                            />
                                            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-[#FCD24C]/20 hover:bg-[#FCD24C] text-slate-800 hover:text-white px-6 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300">
                                                Search
                                            </button>
                                        </div>
                                    </form>
                                    {/* Desktop Search Results Dropdown */}
                                    <AnimatePresence>
                                        {isDesktopSearchFocused && searchQuery.trim() && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 z-50 overflow-hidden ring-1 ring-black/5"
                                            >
                                                {searchLoading && <div className="p-4 text-center"><Loader /></div>}
                                                {searchError && <div className="p-4 text-center text-red-500">{searchError}</div>}
                                                {!searchLoading && !searchError && searchResults.length === 0 && <div className="p-4 text-center text-slate-500">No products found.</div>}
                                                {!searchLoading && !searchError && searchResults.length > 0 && (
                                                    <ul className="max-h-96 overflow-y-auto">
                                                        {searchResults.map((item, index) => (
                                                            <li key={`${item.type}-${item.id}-${index}`} onClick={() => handleResultClick(item)} className="flex items-center p-4 hover:bg-[#FDD14E] cursor-pointer border-b border-slate-100 last:border-b-0">
                                                                <div className="w-12 h-12 rounded-lg mr-4 flex items-center justify-center bg-slate-100">
                                                                    {item.type === 'product' ? (
                                                                        <img src={config.fixImageUrl(item.image)} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                                                    ) : (
                                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                            <FaBirthdayCake size={16} className="text-blue" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-slate-800">{item.name}</p>
                                                                    <p className="text-xs text-slate-500 truncate">
                                                                        {item.type === 'product'
                                                                            ? `${item.category || ''} ${item.subCategory ? `• ${item.subCategory}` : ''}`.trim()
                                                                            : item.description || 'Category'
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    {item.type === 'product' ? (
                                                                        <p className="font-bold text-blue">₹{item.price}</p>
                                                                    ) : (
                                                                        <span className="text-xs text-blue font-medium uppercase">Category</span>
                                                                    )}
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

                            {/* Right: User Actions */}
                            {/* 3. Right Section: User & Cart Actions */}
                            <div className="flex items-center gap-8 shrink-0">
                                {user ? (
                                    <Link to="/account" className="flex items-center gap-3 bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl transition-all duration-300 group">
                                        <div className="bg-white p-2 rounded-lg text-[#FDD14E]">
                                            <FaUserCircle size={20} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">Hello,</span>
                                            <span className="text-xs font-black text-slate-900 leading-none group-hover:text-blue transition-colors">
                                                {user.name.split(' ')[0]}
                                            </span>
                                        </div>
                                    </Link>
                                ) : (
                                    <Link to="/login" className="flex items-center gap-2 text-slate-900 hover:text-white font-extrabold text-sm uppercase tracking-wide transition-colors">
                                        <FaUserCircle size={24} />
                                        <span>Login</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- (MODIFIED) MOBILE HEADER --- */}
                <div className="md:hidden">
                    {/* Top bar: Menu, Logo, Cart */}
                    <div className="relative container mx-auto px-3 sm:px-4 flex items-center justify-between h-16">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-800 p-1.5 -ml-1 z-10">
                            <FiMenu size={24} />
                        </button>
                        <Link to="/" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
                        </Link>
                        <div className="flex items-center gap-1.5 z-10">
                            {/* --- MODIFICATION START: Location selector moved from here --- */}
                            {user ? (
                                <Link to="/account" className="flex items-center gap-1.5 text-slate-600 hover:text-blue transition-colors">
                                    <FaUserCircle size={28} />
                                    <span className="text-xs font-medium hidden xs:block">{user.name.split(' ')[0]}</span>
                                </Link>
                            ) : (
                                <Link to="/login" className="flex items-center gap-1.5 text-slate-600 hover:text-blue transition-colors">
                                    <FaUserCircle size={28} />
                                    <span className="text-xs font-medium hidden xs:block">Login</span>
                                </Link>
                            )}
                            {/* --- MODIFICATION END --- */}
                        </div>
                    </div>
                    {/* Bottom strip: Search Bar & New Location Selector - Hidden on ProductView page */}
                    {!location.pathname.startsWith('/product/') && (
                        <div className="px-3  pt-2 bg-white border-t border-slate-200/80">
                            {/* Search Bar */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-full flex items-center text-left bg-slate-100 rounded-xl h-11 px-4 text-sm text-slate-500"
                            >
                                <FaSearch className="mr-3 text-slate-400" size={16} />
                                <span className="text-sm">Search products...</span>
                            </button>

                            {/* --- MODIFICATION START: New Premium Location Selector Added Here --- */}
                            <div className="mt-2.5">
                                <button
                                    onClick={() => setIsLocationModalOpen(true)}
                                    className="w-full flex items-center text-left py-2"
                                >
                                    <FaMapMarkerAlt className="text-slate-500 mr-2.5 flex-shrink-0" size={14} />
                                    <div className="flex-grow">
                                        <p className="text-sm text-slate-500 font-medium">
                                            {selectedCity ? `Deliver to: ${selectedCity}` : 'Select your city'}
                                        </p>

                                    </div>
                                    <div className="flex items-center text-blue font-semibold text-xs">
                                        <span className="truncate max-w-[60px]">{selectedCity || 'Choose'}</span>
                                        <FaChevronDown size={10} className="ml-1" />
                                    </div>
                                </button>
                            </div>
                            {/* --- MODIFICATION END --- */}
                        </div>
                    )}
                </div>

                {/* --- MEGA MENU RENDER --- */}
                <div className="hidden md:block" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
                    <AnimatePresence>
                        {isMegaMenuOpen && !categoriesLoading && <MegaMenu categories={dynamicCategories} closeMenu={closeAllMenus} />}
                    </AnimatePresence>
                </div>
            </header>

            {/* --- Mobile Slide-Out Menu --- */}
            <AnimatePresence>
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
                                        <Link to="/shop" state={{ selectedCategory: { main: cat.name } }} onClick={closeAllMenus} className="group flex items-center gap-3 py-3 px-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-[#FDD14E] transition-colors">
                                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                                {cat.image ? (
                                                    <img
                                                        src={config.fixImageUrl(cat.image)}
                                                        alt={cat.name}
                                                        className="w-8 h-8 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <FaBirthdayCake size={16} className="text-blue" />
                                                )}
                                            </div>
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <hr className="my-4 border-slate-200/80" />
                            <ul>
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
            </AnimatePresence>

            {/* --- Fullscreen Mobile Search Overlay --- */}
            <AnimatePresence>
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
                                                        <FaBirthdayCake size={20} className="text-blue" />
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
                                                    <p className="font-bold text-blue">₹{item.price}</p>
                                                ) : (
                                                    <span className="text-xs text-blue font-medium uppercase">Category</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Modals & Bottom Navigation --- */}
            <LocationModal
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