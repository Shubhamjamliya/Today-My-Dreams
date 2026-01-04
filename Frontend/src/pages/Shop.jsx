import { useState, useEffect, useMemo, memo } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Slider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import ShopProductCard from '../components/ShopProductCard/ShopProductCard.jsx';
import config from '../config/config.js';
import { ProductSkeleton } from '../components/Loader/Skeleton.jsx';
import SEO from '../components/SEO/SEO';
import { useCity } from '../context/CityContext';
import { FaBirthdayCake } from 'react-icons/fa';

// --- Sub-Components ---

const CategorySidebar = memo(({
  dynamicCategories,
  selectedCategories,
  handleCategorySelect
}) => {
  return (
    <div className="bg-white rounded-3xl lg:sticky lg:top-[112px] lg:h-[calc(100vh-140px)] flex flex-col z-30 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="p-5 pb-4 border-b border-slate-100 bg-white/50 backdrop-blur-xl rounded-t-3xl z-10 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-[#FCD24C] shadow-lg shadow-slate-900/20">
            <ShoppingBagIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight text-lg leading-tight">Collections</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Category</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pt-4 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 scroll-smooth">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`w-full group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 border ${!selectedCategories.main
            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/30 scale-[1.02]'
            : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${!selectedCategories.main ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">All Products</span>
          {!selectedCategories.main && <div className="absolute right-4 w-2 h-2 bg-[#FCD24C] rounded-full animate-pulse" />}
        </button>

        {dynamicCategories.map(cat => {
          const isActive = selectedCategories.main === cat.name;
          return (
            <div key={cat._id} className="relative">
              <button
                onClick={() => handleCategorySelect(cat.name)}
                className={`w-full group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 border ${isActive
                  ? 'bg-[#FCD24C] border-[#FCD24C] text-slate-900 shadow-lg shadow-[#FCD24C]/30 scale-[1.02] z-10'
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {cat.image ? (
                    <img src={config.fixImageUrl(cat.image)} className={`w-9 h-9 rounded-full object-cover shadow-sm transition-all ${isActive ? 'ring-2 ring-white scale-110' : 'grayscale group-hover:grayscale-0'}`} loading="lazy" alt={cat.name} />
                  ) : <FaBirthdayCake className="text-slate-400" />}
                  <span className={`text-sm ${isActive ? 'font-black' : 'font-bold'}`}>{cat.name}</span>
                </div>
                {cat.submenu?.length > 0 && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-slate-900/10' : 'group-hover:bg-slate-100'}`}>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isActive ? 'rotate-180 text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isActive && cat.submenu?.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div className="relative ml-8 pl-6 py-3 space-y-1">
                      <div className="absolute left-0 top-0 bottom-4 w-[2px] bg-slate-300 rounded-full"></div>

                      <button
                        onClick={() => handleCategorySelect(cat.name, null)}
                        className={`relative w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${!selectedCategories.sub
                          ? 'bg-slate-100 text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                      >
                        <div className="absolute -left-6 top-1/2 w-4 h-[2px] bg-slate-300"></div>
                        <span className={`w-1.5 h-1.5 rounded-full ${!selectedCategories.sub ? 'bg-slate-900' : 'bg-slate-400'}`}></span>
                        View All
                      </button>

                      {cat.submenu.map(sub => (
                        <button
                          key={sub._id}
                          onClick={() => handleCategorySelect(cat.name, sub.name)}
                          className={`relative w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${selectedCategories.sub === sub.name
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105 origin-left z-10'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                          <div className={`absolute -left-6 top-1/2 w-4 h-[2px] transition-colors ${selectedCategories.sub === sub.name ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
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
  );
});

const TopFilterSection = memo(({
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
  const [showPrice, setShowPrice] = useState(false);

  // Close price popover when clicking outside
  const togglePrice = () => setShowPrice(!showPrice);

  return (
    <div className="flex items-center gap-3">
      {/* Price Filter */}
      <div className="relative">
        <button
          onClick={togglePrice}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${showPrice || (priceRange[0] > minPrice || priceRange[1] < maxPrice)
            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>Price Range</span>
          {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
            <span className="ml-1 w-2 h-2 rounded-full bg-[#FCD24C]" />
          )}
        </button>

        <AnimatePresence>
          {showPrice && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPrice(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-900">Budget</span>
                  <span className="text-xs font-bold text-slate-500">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                </div>
                <Slider
                  value={priceRange}
                  onChange={(e, val) => setPriceRange(val)}
                  onChangeCommitted={(e, val) => setCommittedPriceRange(val)}
                  min={minPrice}
                  max={maxPrice}
                  step={500}
                  sx={{
                    color: '#0f172a',
                    height: 6,
                    '& .MuiSlider-thumb': {
                      height: 20,
                      width: 20,
                      backgroundColor: '#FCD24C',
                      border: '3px solid #fff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(252, 210, 76, 0.16)' },
                    },
                    '& .MuiSlider-track': { border: 'none' },
                    '& .MuiSlider-rail': { opacity: 0.3, backgroundColor: '#cbd5e1' },
                  }}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowPrice(false)}
                    className="text-xs font-bold text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Dropdown */}
      <div className="relative group min-w-[160px]">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full appearance-none bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer transition-colors"
        >
          <option value="popularity">Popularity</option>
          <option value="latest">Latest Trends</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
      </div>

      {hasActiveFilters() && (
        <button
          onClick={clearAllFilters}
          className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
});

const Shop = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  const [products, setProducts] = useState([]);
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

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories(prev => ({ ...prev, main: categoryParam }));
    }

    const searchParam = searchParams.get('search');
    if (searchParam) setSearchQuery(searchParam);
    else setSearchQuery('');
  }, [searchParams]);

  // Fetch Data - Always fetch SHOP products
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
          fetch(productsUrl),
          fetch(`${config.API_URLS.SHOP_CATEGORIES_NESTED}${selectedCity ? `?city=${selectedCity}` : ''}`).then(res => res.json())
        ]);

        if (!productsResponse.ok) throw new Error('Failed to fetch shop products');

        const productsData = await productsResponse.json();
        const productsArray = (productsData.products || []).map(p => ({
          ...p,
          module: 'shop' // Force module to shop
        }));

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

  // Handle location state
  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategories(location.state.selectedCategory);
    }
  }, [location.state]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    filtered = filtered.filter(p => p.price >= committedPriceRange[0] && p.price <= committedPriceRange[1]);

    if (selectedCategories.main) {
      filtered = filtered.filter(p => {
        const { main, sub, item } = selectedCategories;
        const pMain = p.category?.name?.toLowerCase();
        const pSub = p.subCategory?.name?.toLowerCase();
        const sMain = main?.toLowerCase();
        const sSub = sub?.toLowerCase();

        if (item) return pMain === sMain && pSub === sSub && p.item === item;
        if (sub) return (pMain === sMain && pSub === sSub) || (pMain === sSub && !p.subCategory);
        return pMain === sMain || pSub === sMain;
      });
    }

    switch (sortBy) {
      case 'popularity': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'latest': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return filtered;
  }, [products, committedPriceRange, selectedCategories, sortBy]);

  const handleCategorySelect = (main, sub = null) => {
    if (main === selectedCategories.main && !sub) {
      setSelectedCategories({ main: null, sub: null, item: null });
    } else {
      setSelectedCategories(prev => ({
        main: main,
        sub: sub === prev.sub ? null : sub,
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
        title="Premium Shop | TodayMyDream"
        description="Explore our range of decoration products and gifts."
        url="https://todaymydream.com/shop"
      />



      <div className="container mx-auto px-4 pb-12 w-full max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          <aside className="hidden lg:block lg:col-span-1 h-full">
            <CategorySidebar
              dynamicCategories={dynamicCategories}
              selectedCategories={selectedCategories}
              handleCategorySelect={handleCategorySelect}
            />
          </aside>

          <main className="col-span-1 lg:col-span-3">
            <div className="z-10 bg-[#F8FAFC] py-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4 border-b border-slate-200/60 -mx-4 px-4 md:-mx-0 md:px-0 transition-all duration-300">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedCategories.sub || selectedCategories.main || "All Products"}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  {filteredProducts.length} Premium Options Available
                </p>
              </div>

              <div className="hidden lg:block">
                <TopFilterSection
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

              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-900/20 text-sm font-bold"
              >
                <FunnelIcon className="w-4 h-4" /> Categorize
              </button>
            </div>

            <AnimatePresence>
              {searchQuery && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 w-full">
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg"><MagnifyingGlassIcon className="w-5 h-5 text-blue-600" /></div>
                      <p className="text-slate-700">Finding products for <span className="font-bold text-slate-900">"{searchQuery}"</span></p>
                    </div>
                    <button onClick={clearSearch} className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg text-slate-600 hover:text-red-500 shadow-sm border border-slate-200 transition-colors">Clear Search</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar scroll-smooth border border-slate-200/80 bg-white/50 rounded-3xl shadow-sm p-4 md:p-6 relative">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                  {[...Array(6)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-red-200 w-full">
                  <p className="text-red-500 font-bold mb-2">Shop unavailable</p>
                  <p className="text-slate-400 text-sm">{error}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 w-full">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                  <p className="text-slate-400 max-w-xs mx-auto mb-8 leading-relaxed">Try adjusting your filters to find the perfect gift.</p>
                  <button onClick={clearAllFilters} className="px-8 py-3 bg-[#FCD24C] text-slate-900 font-bold rounded-xl shadow-lg shadow-[#FCD24C]/20 hover:shadow-[#FCD24C]/40 hover:-translate-y-1 transition-all">
                    Reset Options
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full pb-8">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ShopProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

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
                <h2 className="text-lg font-black text-slate-900">Shop Options</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Filters</h3>
                  <div className="space-y-4">
                    {/* Mobile Filters Inline */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500">Budget</span>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-900 px-2 py-1 rounded">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                      </div>
                      <Slider
                        value={priceRange}
                        onChange={(e, v) => setPriceRange(v)}
                        onChangeCommitted={(e, v) => setCommittedPriceRange(v)}
                        min={minPrice}
                        max={maxPrice}
                        step={500}
                        sx={{
                          color: '#0f172a',
                          height: 6,
                          '& .MuiSlider-thumb': { height: 20, width: 20, backgroundColor: '#FCD24C', border: '3px solid #fff' }
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 mb-2 block">Sort By</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-3"
                      >
                        <option value="popularity">Popularity</option>
                        <option value="latest">Latest Trends</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200"></div>

                <CategorySidebar
                  dynamicCategories={dynamicCategories}
                  selectedCategories={selectedCategories}
                  handleCategorySelect={handleCategorySelect}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;