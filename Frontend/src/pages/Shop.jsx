import { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Slider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FunnelIcon, 
    XMarkIcon, 
    TagIcon, 
    CurrencyRupeeIcon, 
    ChevronDownIcon, 
    RectangleGroupIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { XMarkIcon as XMarkIconSolid } from '@heroicons/react/24/solid';
import ProductCard from '../components/ProductCard/ProductCard.jsx';
import config from '../config/config.js';
import Loader from '../components/Loader';
import SEO from '../components/SEO/SEO';
import { categoryAPI } from '../services/api';
import { useCity } from '../context/CityContext';

const Shop = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { selectedCity } = useCity();

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);
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
    
    // Refs for scrolling to selected categories
    const categoriesScrollRef = useRef(null);
    const subcategoriesScrollRefs = useRef({});

 

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategories({ main: categoryParam, sub: null, item: null });
        }
        
        // Set search query from URL
        const searchParam = searchParams.get('search');
        if (searchParam) {
            setSearchQuery(searchParam);
        } else {
            setSearchQuery('');
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get search parameter from URL
                const searchQuery = searchParams.get('search');
                
                // Build API URL with search parameter if present
                let productsUrl = config.API_URLS.SHOP;
                const urlParams = new URLSearchParams();
                
                if (searchQuery && searchQuery.trim()) {
                    urlParams.append('search', searchQuery.trim());
                }
                
                // Add city filter
                if (selectedCity) {
                    urlParams.append('city', selectedCity);
                }
                
                productsUrl += `?${urlParams.toString()}`;

                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetch(productsUrl, { timeout: 8000 }), // 8 second timeout
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
                        
                        // Round min price down to nearest 500
                        const roundedMinPrice = Math.floor(minProductPrice / 500) * 500;
                        
                        // Round max price up to nearest 500
                        const roundedMaxPrice = Math.ceil(maxProductPrice / 500) * 500;
                        
                        setMinPrice(roundedMinPrice);
                        setMaxPrice(roundedMaxPrice);
                        setPriceRange([roundedMinPrice, roundedMaxPrice]);
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

    useEffect(() => {
        if (location.state?.selectedCategory) {
            setSelectedCategories(location.state.selectedCategory);
            if (location.state.selectedCategory.main) {
                // Scroll to selected category
                scrollToSelectedCategory(location.state.selectedCategory.main);
                
                // Also scroll to subcategory if selected
                if (location.state.selectedCategory.sub) {
                    setTimeout(() => {
                        scrollToSelectedSubcategory(location.state.selectedCategory.main, location.state.selectedCategory.sub);
                    }, 200);
                }
            }
        }
    }, [location.state]);

    // Scroll to selected category when it changes
    useEffect(() => {
        if (selectedCategories.main) {
            scrollToSelectedCategory(selectedCategories.main);
        }
    }, [selectedCategories.main]);

    // Scroll to selected category when categories are loaded
    useEffect(() => {
        if (selectedCategories.main && dynamicCategories.length > 0) {
            scrollToSelectedCategory(selectedCategories.main);
        }
    }, [dynamicCategories.length, selectedCategories.main]);

    // Scroll to selected subcategory when it changes
    useEffect(() => {
        if (selectedCategories.main && selectedCategories.sub) {
            scrollToSelectedSubcategory(selectedCategories.main, selectedCategories.sub);
        }
    }, [selectedCategories.sub]);

    useEffect(() => {
        let filtered = [...products];
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
        if (selectedCategories.main) {
            filtered = filtered.filter(p => {
                const { main, sub, item } = selectedCategories;
                if (item) return p.category?.name?.toLowerCase() === main?.toLowerCase() && p.subCategory?.name?.toLowerCase() === sub?.toLowerCase() && p.item === item;
                if (sub) {
                    // For subcategory selection, show products from both:
                    // 1. Products in the selected subcategory
                    // 2. Products in categories with the same name as the subcategory
                    return (p.category?.name?.toLowerCase() === main?.toLowerCase() && p.subCategory?.name?.toLowerCase() === sub?.toLowerCase()) ||
                           (p.category?.name?.toLowerCase() === sub?.toLowerCase() && !p.subCategory);
                }
                // For main category selection, show products from both:
                // 1. Products in the selected category
                // 2. Products in subcategories with the same name as the category
                return p.category?.name?.toLowerCase() === main?.toLowerCase() || p.subCategory?.name?.toLowerCase() === main?.toLowerCase();
            });
        }
        switch (sortBy) {
            case 'popularity': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            case 'latest': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
            case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
            case 'alphabetical': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
            default: break;
        }
        setFilteredProducts(filtered);
    }, [products, priceRange, selectedCategories, sortBy]);

    const handlePriceChange = (event, newValue) => setPriceRange(newValue);
    const handleCategoryClick = (main, sub = null, item = null) => {
        setSelectedCategories({
            main: main === selectedCategories.main && !sub ? null : main,
            sub: sub === selectedCategories.sub && !item ? null : sub,
            item: item === selectedCategories.item ? null : item
        });
    };
    const isCategorySelected = (main, sub = null, item = null) => (
        selectedCategories.main === main && 
        (!sub || selectedCategories.sub === sub) && 
        (!item || selectedCategories.item === item)
    );
    const clearAllFilters = () => {
        setSelectedCategories({ main: null, sub: null, item: null });
        setPriceRange([minPrice, maxPrice]);
        setSortBy('price-low');
    };

    const clearSearch = () => {
        setSearchParams({});
        setSearchQuery('');
    };

    // Group filtered products by category for better organization
    const groupProductsByCategory = (products) => {
        const grouped = {};
        products.forEach(product => {
            const categoryName = product.category?.name || 'Other';
            if (!grouped[categoryName]) {
                grouped[categoryName] = [];
            }
            grouped[categoryName].push(product);
        });
        return grouped;
    };

    const groupedProducts = groupProductsByCategory(filteredProducts);

    // Function to scroll selected category into view
    const scrollToSelectedCategory = (categoryName) => {
        if (!categoryName || !categoriesScrollRef.current) return;
        
        setTimeout(() => {
            const scrollContainer = categoriesScrollRef.current;
            const selectedButton = scrollContainer.querySelector(`[data-category="${categoryName}"]`);
            
            if (selectedButton) {
                selectedButton.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }, 100);
    };

    // Function to scroll selected subcategory into view
    const scrollToSelectedSubcategory = (categoryName, subcategoryName) => {
        if (!categoryName || !subcategoryName) return;
        
        setTimeout(() => {
            const subcategoryScrollRef = subcategoriesScrollRefs.current[categoryName];
            if (!subcategoryScrollRef) return;
            
            const selectedButton = subcategoryScrollRef.querySelector(`[data-subcategory="${subcategoryName}"]`);
            
            if (selectedButton) {
                selectedButton.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }, 100);
    };

    // Helper functions to check if filters are applied
    const hasActiveFilters = () => {
        return selectedCategories.main || 
               priceRange[0] !== minPrice || 
               priceRange[1] !== maxPrice || 
               sortBy !== 'price-low';
    };

    const getActiveFilters = () => {
        const filters = [];
        
        // Category filter
        if (selectedCategories.main) {
            let categoryText = selectedCategories.main;
            if (selectedCategories.sub) {
                categoryText += ` > ${selectedCategories.sub}`;
            }
            if (selectedCategories.item) {
                categoryText += ` > ${selectedCategories.item}`;
            }
            filters.push({
                type: 'category',
                label: 'Category',
                value: categoryText,
                onRemove: () => setSelectedCategories({ main: null, sub: null, item: null })
            });
        }

        // Price range filter
        if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
            filters.push({
                type: 'price',
                label: 'Price',
                value: `₹${priceRange[0].toLocaleString()} - ₹${priceRange[1].toLocaleString()}`,
                onRemove: () => setPriceRange([minPrice, maxPrice])
            });
        }

        // Sort filter (only show if not default)
        if (sortBy !== 'price-low') {
            const sortLabels = {
                'popularity': 'Popularity',
                'latest': 'Latest',
                'price-high': 'Price: High to Low',
                'alphabetical': 'Alphabetical'
            };
            filters.push({
                type: 'sort',
                label: 'Sort',
                value: sortLabels[sortBy],
                onRemove: () => setSortBy('price-low')
            });
        }

        return filters;
    };

    // Product Count Functions (moved to parent scope)
    const getCategoryProductCount = (categoryName) => {
        // Count products from both:
        // 1. Products in this category
        // 2. Products in subcategories with the same name (case-insensitive)
        return products.filter(p => 
            p.category?.name?.toLowerCase() === categoryName?.toLowerCase() || 
            p.subCategory?.name?.toLowerCase() === categoryName?.toLowerCase()
        ).length;
    };

    const getSubCategoryProductCount = (categoryName, subCategoryName) => {
        // Count products from both:
        // 1. Products in this specific subcategory
        // 2. Products in categories with the same name as the subcategory (case-insensitive)
        return products.filter(p => 
            (p.category?.name?.toLowerCase() === categoryName?.toLowerCase() && 
             p.subCategory?.name?.toLowerCase() === subCategoryName?.toLowerCase()) ||
            (p.category?.name?.toLowerCase() === subCategoryName?.toLowerCase() && !p.subCategory)
        ).length;
    };

    // Horizontal Category Filter Component
    const HorizontalCategoryFilter = () => {
        return (
            <div className="md:hidden bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">Categories</h3>
                    <button 
                        onClick={clearAllFilters} 
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-700 underline"
                    >

                         {/* Mobile Filter Button */}
                         <div className="md:hidden">
                            <button 
                                onClick={() => setIsMobileFiltersOpen(true)} 
                                className="w-full flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <FunnelIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">Filters</span>
                            </button>
                        </div>
                        Clear All
                    </button>
                </div>
                

                {/* All Categories Horizontal Scroll */}
                <div className="space-y-3 sm:space-y-4">
                    {/* Main Categories Row - Mobile Optimized */}
                    <div ref={categoriesScrollRef} className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
                        {dynamicCategories.map((category) => {
                            const categoryProductCount = getCategoryProductCount(category.name);
                            const isCategoryActive = isCategorySelected(category.name);
                            
                            return (
                                <button
                                    key={category.name}
                                    data-category={category.name}
                                    onClick={() => {
                                        handleCategoryClick(category.name);
                                    }}
                                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium sm:font-semibold transition-all duration-300 hover:scale-105 flex-shrink-0 min-w-fit ${
                                        isCategoryActive 
                                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 border-2 border-amber-600' 
                                        : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-sm'
                                    }`}
                                >
                                    {category.image && (
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 ${
                                            isCategoryActive ? 'border-white/70' : 'border-gray-300'
                                        }`}>
                                            <img 
                                                src={config.fixImageUrl(category.image)} 
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <span className="whitespace-nowrap">{category.name}</span>
                                    <span className={`ml-auto text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold ${
                                        isCategoryActive ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {categoryProductCount}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Subcategories Rows - Show only for selected category */}
                    {selectedCategories.main && dynamicCategories.map((category) => {
                        // Only show subcategories for the selected category
                        if (category.name !== selectedCategories.main) return null;
                        
                        return (
                            <AnimatePresence key={`sub-${category.name}`}>
                                {category.submenu && category.submenu.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mb-2">
                                            <h4 className="text-xs font-semibold text-gray-600 mb-2 px-1">{category.name} Subcategories:</h4>
                                            <div ref={(el) => subcategoriesScrollRefs.current[category.name] = el} className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
                                                {category.submenu.map((sub) => {
                                                    const subCategoryProductCount = getSubCategoryProductCount(category.name, sub.name);
                                                    const isSubCategoryActive = isCategorySelected(category.name, sub.name);
                                                    
                                                    return (
                                                        <button
                                                            key={sub.name}
                                                            data-subcategory={sub.name}
                                                            onClick={() => handleCategoryClick(category.name, sub.name)}
                                                            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                                                                isSubCategoryActive 
                                                                ? 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-md shadow-indigo-700/40 border-2 border-indigo-600' 
                                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                                                            }`}
                                                        >
                                                            {sub.image && (
                                                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border ${
                                                                    isSubCategoryActive ? 'border-white/70' : 'border-gray-300'
                                                                }`}>
                                                                    <img 
                                                                        src={config.fixImageUrl(sub.image)} 
                                                                        alt={sub.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <span className="whitespace-nowrap">{sub.name}</span>
                                                            <span className={`ml-auto text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-bold ${
                                                                isSubCategoryActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {subCategoryProductCount}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Vertical Category Filter Component (for Desktop)
    const VerticalCategoryFilter = () => {
        return (
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                <div className="space-y-2">
                    {dynamicCategories.map((category) => {
                        const categoryProductCount = getCategoryProductCount(category.name);
                        const isCategoryActive = selectedCategories.main === category.name;

                        return (
                            <details key={category.name} className="group" open={isCategoryActive}>
                                <summary 
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                        isCategoryActive && !selectedCategories.sub ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100'
                                    }`}
                                    onClick={(e) => {
                                        // Only trigger category click if the summary itself (not the marker) is clicked
                                        if (e.target === e.currentTarget) {
                                            e.preventDefault();
                                            handleCategoryClick(category.name);
                                        }
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">{category.name}</span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{categoryProductCount}</span>
                                    </span>
                                    <ChevronDownIcon className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
                                </summary>
                                
                                {category.submenu && category.submenu.length > 0 && (
                                    <div className="pl-4 pt-2 space-y-1">
                                        {category.submenu.map((sub) => {
                                            const subCategoryProductCount = getSubCategoryProductCount(category.name, sub.name);
                                            const isSubCategoryActive = isCategorySelected(category.name, sub.name);

                                            return (
                                                <button
                                                    key={sub.name}
                                                    onClick={() => handleCategoryClick(category.name, sub.name)}
                                                    className={`w-full flex items-center justify-between text-left p-2 rounded-md transition-colors ${
                                                        isSubCategoryActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <span className="text-sm font-medium">{sub.name}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                        isSubCategoryActive ? 'bg-white/25' : 'bg-gray-200 text-gray-600'
                                                    }`}>{subCategoryProductCount}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </details>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Desktop Filter Sidebar Component
    const DesktopFilterSidebar = () => {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                    <button 
                        onClick={clearAllFilters} 
                        className="text-xs font-medium text-amber-600 hover:text-amber-700 underline"
                    >
                        Clear All
                    </button>
                </div>
                <ActiveFilters />
                <VerticalCategoryFilter />
                <AdditionalFilters />
            </div>
        );
    };

    // Additional Filters Component (Price & Sort)
    const AdditionalFilters = ({ isMobile = false }) => {
        return (
            <div className={` ${isMobile ? 'bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4' : 'mb-6'}`}>
                <div className="space-y-6">
                    {/* Price Range Filter */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h3>
                        <Slider 
                            value={priceRange} 
                            onChange={handlePriceChange} 
                            valueLabelDisplay="auto" 
                            min={minPrice} 
                            max={maxPrice}
                            step={1000}
                            sx={{ 
                                color: '#F59E0B',
                                '& .MuiSlider-thumb': {
                                    '&:hover, &.Mui-focusVisible': {
                                        boxShadow: '0px 0px 0px 8px rgba(245, 158, 11, 0.16)',
                                    },
                                    '&.Mui-active': {
                                        boxShadow: '0px 0px 0px 14px rgba(245, 158, 11, 0.16)',
                                    },
                                },
                            }}
                        />
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">₹{priceRange[0].toLocaleString()}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">₹{priceRange[1].toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Sort By Filter */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h3>
                        <div className="relative">
                            <select
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 appearance-none bg-gray-100 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-sm"
                            >
                                <option value="popularity">Popularity</option>
                                <option value="latest">Latest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                            <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Active Filters Component
    const ActiveFilters = () => {
        const activeFilters = getActiveFilters();
        
        if (activeFilters.length === 0) return null;
        
        return (
           <>
           </>
        );
    };

    return (
        <>
            <SEO
                title="Shop Decoration Materials - Birthday, Wedding & Anniversary Supplies | Decoryy"
                description="Browse our premium collection of decoration materials for birthdays, weddings, anniversaries, and celebrations. Balloons, banners, lights, party props, and celebration supplies. Free shipping on orders over ₹999."
                keywords="decoration materials shop, birthday decoration supplies, wedding decor materials, anniversary celebration items, party balloons, banners, lights, celebration props, decoration materials online, party supplies India, event decoration, celebration materials, birthday party supplies, wedding decor items, anniversary party decorations, baby shower decorations, venue decoration, party planning supplies"
                url="https://decoryy.com/shop"
                image="/shop-hero.jpg"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "Decoryy Decoration Materials Shop",
                    "description": "Shop decoration materials for birthdays, weddings, anniversaries and celebrations.",
                    "url": "https://decoryy.com/shop",
                    "mainEntity": {
                        "@type": "ItemList",
                        "name": "Decoration Materials",
                        "description": "Premium decoration materials and celebration supplies",
                        "numberOfItems": filteredProducts.length
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
                                "@type":"ListItem",
                                "position": 2,
                                "name": "Shop",
                                "item": "https://decoryy.com/shop"
                            }
                        ]
                    }
                }}
            />
            <div className="min-h-screen md:py-3 bg-gray-50">
            <div className="container mx-auto px-3">
                {/* Search Results Banner */}
                {searchQuery && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <MagnifyingGlassIcon className="h-5 w-5 text-amber-600" />
                                <p className="text-sm text-gray-700">
                                    Search results for: <span className="font-bold text-gray-900">"{searchQuery}"</span>
                                    <span className="ml-2 text-gray-600">({totalProducts} {totalProducts === 1 ? 'product' : 'products'} found)</span>
                                </p>
                            </div>
                            <button 
                                onClick={clearSearch}
                                className="text-sm font-medium text-amber-600 hover:text-amber-700 underline"
                            >
                                Clear Search
                            </button>
                        </div>
                    </motion.div>
                )}

               

                {loading ? (
                    <div className="w-full h-[50vh] flex items-center justify-center"><Loader size="large" text="Loading products..." /></div>
                ) : (
                    <div className="md:grid md:grid-cols-4 md:gap-6 lg:gap-8">

                        {/* --- DESKTOP SIDEBAR --- */}
                        <aside className="hidden md:block md:col-span-1 self-start">
                            {/* Make sidebar sticky within viewport on desktop */}
                            <div className="sticky top-20 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto md:pr-3 md:pb-6 modern-scrollbar">
                                {/* Sidebar gets its own scroll area on desktop */}
                                <DesktopFilterSidebar />
                            </div>
                        </aside>

                        {/* --- MOBILE VIEW & DESKTOP PRODUCT LIST --- */}
                        <main className="md:col-span-3 space-y-6 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto md:pr-2 modern-scrollbar">
                        
                            {/* Horizontal Category Filters (MOBILE ONLY) */}
                            <HorizontalCategoryFilter />

                            {/* Mobile Filters Sidebar */}
                            <AnimatePresence>
                            {isMobileFiltersOpen && (
                                <>
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                                        onClick={() => setIsMobileFiltersOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ x: '100%' }} 
                                        animate={{ x: 0 }} 
                                        exit={{ x: '100%' }} 
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        // Slide-panel starts below header on mobile, use same offset as desktop (top-20 -> 5rem)
                                        className="fixed right-0 top-[-25px] h-full w-80 bg-white z-50 p-4 overflow-y-auto modern-scrollbar md:hidden"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-semibold">Additional Filters</h2>
                                            <button 
                                                onClick={() => setIsMobileFiltersOpen(false)} 
                                                className="p-1.5 hover:bg-gray-100 rounded-full"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        
                                        <AdditionalFilters isMobile={true} />
                                        
                                        <button 
                                            onClick={clearAllFilters} 
                                            className="w-full mt-4 bg-gray-800 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition text-sm"
                                        >
                                            Clear All Filters
                                        </button>
                                    </motion.div>
                                </>
                            )}
                            </AnimatePresence>

                            {/* Products Grid */}
                            <div>
                                {error ? (
                                    <div className="text-center text-red-500 text-sm"> {error} </div>
                                ) : filteredProducts.length > 0 ? (
                                    <>
                                        {searchQuery ? (
                                            // Show grouped results when searching
                                            <div className="space-y-8">
                                                {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
                                                    <div key={categoryName} className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-lg font-bold text-gray-900">{categoryName}</h3>
                                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                                {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
                                                            {categoryProducts.map((product) => (
                                                                <ProductCard key={product._id} product={product} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // Show regular grid when not searching
                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
                                                {filteredProducts.map((product) => (
                                                    <ProductCard key={product._id} product={product} />
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Results Summary */}
                                        <div className="text-center text-sm text-gray-600 mt-8">
                                            {searchQuery ? (
                                                <>
                                                    Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} for "{searchQuery}"
                                                    {Object.keys(groupedProducts).length > 1 && (
                                                        <span className="block text-xs text-amber-600 mt-1">
                                                            in {Object.keys(groupedProducts).length} categories
                                                        </span>
                                                    )}
                                                </>
                                            ) : hasActiveFilters() ? (
                                                <>
                                                    Showing {filteredProducts.length} of {products.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                                                    {filteredProducts.length !== products.length && (
                                                        <span className="block text-xs text-amber-600 mt-1">
                                                            (filtered from {products.length} total)
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                `Showing all ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full flex justify-center">
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md w-full"
                                        >
                                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                                                {searchQuery ? `No results for "${searchQuery}"` : 'No Products Found'}
                                            </h3>
                                            <p className="text-gray-600 text-center text-sm leading-relaxed">
                                                {searchQuery ? 'Try different keywords or browse categories.' : 'Try adjusting your filters or browse other categories.'}
                                            </p>
                                            {searchQuery && (
                                                <button 
                                                    onClick={clearSearch}
                                                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium text-sm underline"
                                                >
                                                    Clear Search
                                                </button>
                                            )}
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                )}
            </div>
            </div>
        </>
    );
};

export default Shop;