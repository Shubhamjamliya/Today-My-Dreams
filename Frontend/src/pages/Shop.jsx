import { useState, useEffect, useMemo, memo } from 'react';
import { useLocation, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Slider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FunnelIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard/ProductCard.jsx';
import config from '../config/config.js';
import Loader from '../components/Loader';
import { ProductSkeleton } from '../components/Loader/Skeleton.jsx';
import SEO from '../components/SEO/SEO';
import { categoryAPI } from '../services/api';
import { useCity } from '../context/CityContext';
import { FaBirthdayCake } from 'react-icons/fa';

// --- Sub-Components (Defined Outside to prevent re-renders) ---

const ShopHero = memo(({ selectedCategories }) => {
    return (
        <div className="relative bg-slate-900 overflow-hidden h-64 md:h-80 flex items-center">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
            <div className="container mx-auto px-6 relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-4xl"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-[#FCD24C]/20 border border-[#FCD24C] text-[#FCD24C] text-xs font-bold uppercase tracking-wider mb-4">
                        Premium Collection
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                        {selectedCategories.main || "All Collections"}
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl font-medium max-w-xl">
                        Curated decorations for your most memorable moments.
                    </p>
                </motion.div>
            </div>
        </div>
    );
});

const ShopSidebar = memo(({
    dynamicCategories,
    selectedCategories,
    handleCategorySelect,
    priceRange,
    setPriceRange,
    setCommittedPriceRange,
    minPrice,
    maxPrice,
    sortBy,
    setSortBy,
    hasActiveFilters,
    clearAllFilters
}) => {
    // Local state for smooth slider movement
    const handleChange = (event, newValue) => {
        setPriceRange(newValue); // Updates visual slider only
    };

    const handleChangeCommitted = (event, newValue) => {
        setCommittedPriceRange(newValue); // Triggers expensive filtering
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-36 max-h-[calc(100vh-160px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] z-30">

            {/* Section: Categories */}
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#FCD24C] rounded-full"></span>
                    Categories
                </h3>

                <div className="space-y-2">
                    <button
                        onClick={() => handleCategorySelect(null)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${!selectedCategories.main
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                        </div>
                        All Items
                    </button>

                    {dynamicCategories.map(cat => {
                        const isActive = selectedCategories.main === cat.name;
                        return (
                            <div key={cat._id} className="group">
                                <button
                                    onClick={() => handleCategorySelect(cat.name)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${isActive
                                        ? 'bg-[#FCD24C]/10 text-slate-900 border border-[#FCD24C]'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {cat.image ? (
                                            <img src={config.fixImageUrl(cat.image)} className="w-6 h-6 rounded-full object-cover shadow-sm" loading="lazy" />
                                        ) : <FaBirthdayCake className="text-slate-400" />}
                                        {cat.name}
                                    </div>
                                    {cat.submenu?.length > 0 && (
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-180 text-custom-gold' : 'text-slate-300'}`} />
                                    )}
                                </button>

                                {/* Subcategories Accordion */}
                                <AnimatePresence>
                                    {isActive && cat.submenu?.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pl-4 pr-2 py-2 space-y-1 ml-4 border-l-2 border-slate-100 my-1">
                                                <button
                                                    onClick={() => handleCategorySelect(cat.name, null)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${!selectedCategories.sub
                                                        ? 'text-[#FCD24C] bg-slate-900'
                                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    All in {cat.name}
                                                </button>

                                                {cat.submenu.map(sub => (
                                                    <button
                                                        key={sub._id}
                                                        onClick={() => handleCategorySelect(cat.name, sub.name)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${selectedCategories.sub === sub.name
                                                            ? 'text-white bg-indigo-600 shadow-md shadow-indigo-200'
                                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section: Refine */}
            <div className="p-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-slate-900 rounded-full"></span>
                    Filters
                </h3>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-500">Price Range</span>
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                    </div>
                    <Slider
                        value={priceRange}
                        onChange={handleChange}
                        onChangeCommitted={handleChangeCommitted}
                        min={minPrice}
                        max={maxPrice}
                        step={500}
                        sx={{
                            color: '#0f172a', // Slate 900
                            height: 4,
                            '& .MuiSlider-thumb': {
                                height: 16,
                                width: 16,
                                backgroundColor: '#FCD24C',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            },
                            '& .MuiSlider-rail': { opacity: 0.3, backgroundColor: '#cbd5e1' },
                        }}
                    />
                </div>

                <div className="mb-6">
                    <span className="text-xs font-bold text-slate-500 mb-2 block">Sort By</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                        >
                            <option value="popularity">Popularity</option>
                            <option value="latest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {hasActiveFilters() && (
                    <button
                        onClick={clearAllFilters}
                        className="w-full py-3 rounded-xl border border-dashed border-red-300 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors"
                    >
                        Reset All Filters
                    </button>
                )}
            </div>
        </div>
    );
});

const Shop = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { selectedCity } = useCity();

    // --- State ---
    const [products, setProducts] = useState([]);

    // Split price range into "displayed" and "committed" to prevent lag while dragging
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [committedPriceRange, setCommittedPriceRange] = useState([0, 100000]);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [selectedCategories, setSelectedCategories] = useState({ main: null, sub: null, item: null });
    const [sortBy, setSortBy] = useState('price-low');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);

    // --- Data Fetching ---
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategories(prev => ({ ...prev, main: categoryParam }));
        }

        const searchParam = searchParams.get('search');
        if (searchParam) setSearchQuery(searchParam);
        else setSearchQuery('');
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const searchQuery = searchParams.get('search');
                let productsUrl = config.API_URLS.SHOP;
                const urlParams = new URLSearchParams();

                if (searchQuery && searchQuery.trim()) urlParams.append('search', searchQuery.trim());
                if (selectedCity) urlParams.append('city', selectedCity);

                productsUrl += `?${urlParams.toString()}`;

                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetch(productsUrl, { timeout: 8000 }),
                    categoryAPI.getCategoriesWithSubCategories(selectedCity)
                ]);

                if (!productsResponse.ok) throw new Error('Failed to fetch products');

                const productsData = await productsResponse.json();
                const productsArray = productsData.products || [];

                setProducts(productsArray);
                setTotalProducts(productsData.total || productsArray.length);

                if (productsArray.length > 0) {
                    const productPrices = productsArray.map(p => p.price || 0).filter(price => price > 0);
                    if (productPrices.length > 0) {
                        const minProductPrice = Math.min(...productPrices);
                        const maxProductPrice = Math.max(...productPrices);
                        const roundedMinPrice = Math.floor(minProductPrice / 500) * 500;
                        const roundedMaxPrice = Math.ceil(maxProductPrice / 500) * 500;

                        setMinPrice(roundedMinPrice);
                        setMaxPrice(roundedMaxPrice);
                        setPriceRange([roundedMinPrice, roundedMaxPrice]);
                        setCommittedPriceRange([roundedMinPrice, roundedMaxPrice]);
                    }
                }

                const nestedCategories = categoriesResponse.data || [];
                const formattedCategories = nestedCategories.map(cat => ({
                    ...cat,
                    submenu: cat.subCategories
                }));
                setDynamicCategories(formattedCategories);

            } catch (err) {
                setError(err.message || 'Error fetching page data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [searchParams, selectedCity]);

    // Handle initial state from navigation (e.g. from Home page category click)
    useEffect(() => {
        if (location.state?.selectedCategory) {
            setSelectedCategories(location.state.selectedCategory);
        }
    }, [location.state]);

    // --- Filtering Logic (Memoized) ---
    const filteredProducts = useMemo(() => {
        let filtered = [...products];
        // Price Filter (Use committed range for performance)
        filtered = filtered.filter(p => p.price >= committedPriceRange[0] && p.price <= committedPriceRange[1]);

        // Category Filter
        if (selectedCategories.main) {
            filtered = filtered.filter(p => {
                const { main, sub, item } = selectedCategories;
                // Normalize for comparison
                const pMain = p.category?.name?.toLowerCase();
                const pSub = p.subCategory?.name?.toLowerCase();
                const sMain = main?.toLowerCase();
                const sSub = sub?.toLowerCase();

                if (item) return pMain === sMain && pSub === sSub && p.item === item;

                if (sub) {
                    // Match subcategory strictly or via flexible logic if needed
                    return (pMain === sMain && pSub === sSub) || (pMain === sSub && !p.subCategory);
                }

                // Match main category
                return pMain === sMain || pSub === sMain;
            });
        }

        // Sorting
        switch (sortBy) {
            case 'popularity': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            case 'latest': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
            case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
            case 'alphabetical': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
            default: break;
        }
        return filtered;
    }, [products, committedPriceRange, selectedCategories, sortBy]);

    // --- Handlers ---
    const handleCategorySelect = (main, sub = null) => {
        // Toggle if clicking the same main category again without sub
        if (main === selectedCategories.main && !sub) {
            setSelectedCategories({ main: null, sub: null, item: null });
        } else {
            setSelectedCategories(prev => ({
                main: main,
                sub: sub === prev.sub ? null : sub, // Toggle sub
                item: null
            }));
        }
    };

    const clearAllFilters = () => {
        setSelectedCategories({ main: null, sub: null, item: null });
        setPriceRange([minPrice, maxPrice]);
        setCommittedPriceRange([minPrice, maxPrice]);
        setSortBy('price-low');
    };

    const clearSearch = () => { setSearchParams({}); setSearchQuery(''); };

    const hasActiveFilters = () => {
        return selectedCategories.main || (committedPriceRange[0] > minPrice || committedPriceRange[1] < maxPrice);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <SEO
                title="Shop Premium Decoration | TodayMyDream"
                description="Browse our exclusive collection of decoration items."
                url="https://todaymydream.com/shop"
            />

            <ShopHero selectedCategories={selectedCategories} />

            <div className="container mx-auto px-4 py-12 w-full max-w-[1440px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">

                    {/* LEFT SIDEBAR (Sticky) */}
                    <aside className="hidden lg:block lg:col-span-1 h-full">
                        <ShopSidebar
                            dynamicCategories={dynamicCategories}
                            selectedCategories={selectedCategories}
                            handleCategorySelect={handleCategorySelect}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange} // Visual update
                            setCommittedPriceRange={setCommittedPriceRange} // Filter update
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            hasActiveFilters={hasActiveFilters}
                            clearAllFilters={clearAllFilters}
                        />
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="col-span-1 lg:col-span-3">

                        {/* Toolbar (Mobile Filters + Count) */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {selectedCategories.sub || selectedCategories.main || "All Products"}
                                </h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">
                                    Showing {filteredProducts.length} results
                                </p>
                            </div>

                            <button
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="lg:hidden w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-900/20 text-sm font-bold"
                            >
                                <FunnelIcon className="w-4 h-4" /> Filters / Categories
                            </button>
                        </div>

                        {/* Search Feedback Banner */}
                        <AnimatePresence>
                            {searchQuery && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 w-full">
                                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex justify-between items-center w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg"><MagnifyingGlassIcon className="w-5 h-5 text-blue-600" /></div>
                                            <p className="text-slate-700">Searching for <span className="font-bold text-slate-900">"{searchQuery}"</span></p>
                                        </div>
                                        <button onClick={clearSearch} className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg text-slate-600 hover:text-red-500 shadow-sm border border-slate-200 transition-colors">Clear Search</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Loading / Error / Results */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                                {[...Array(6)].map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-red-200 w-full">
                                <p className="text-red-500 font-bold mb-2">Oops! Something went wrong.</p>
                                <p className="text-slate-400 text-sm">{error}</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 w-full">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mb-8 leading-relaxed">We couldn't find any products matching your current filters. Try adjusting your search or price range.</p>
                                <button onClick={clearAllFilters} className="px-8 py-3 bg-[#FCD24C] text-slate-900 font-bold rounded-xl shadow-lg shadow-[#FCD24C]/20 hover:shadow-[#FCD24C]/40 hover:-translate-y-1 transition-all">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
                {isMobileFiltersOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm lg:hidden"
                            onClick={() => setIsMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-80 bg-white z-[61] p-0 shadow-2xl overflow-y-auto lg:hidden"
                        >
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-lg font-black text-slate-900">Filters & Categories</h2>
                                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                                    <XMarkIcon className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>
                            <div className="p-4">
                                <ShopSidebar
                                    dynamicCategories={dynamicCategories}
                                    selectedCategories={selectedCategories}
                                    handleCategorySelect={handleCategorySelect}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    setCommittedPriceRange={setCommittedPriceRange}
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    hasActiveFilters={hasActiveFilters}
                                    clearAllFilters={clearAllFilters}
                                />
                            </div>
                            <div className="p-4 sticky bottom-0 bg-white border-t border-slate-100">
                                <button
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-full bg-[#FCD24C] text-slate-900 font-bold py-3.5 rounded-xl text-center"
                                >
                                    Show {filteredProducts.length} Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Shop;