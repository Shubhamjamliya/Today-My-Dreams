import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import {
    SparklesIcon, GiftIcon, ShieldCheckIcon,
    XMarkIcon, ChevronLeftIcon, ChevronRightIcon,
    AdjustmentsHorizontalIcon, ShoppingBagIcon,
    ChevronDownIcon, CheckBadgeIcon, TruckIcon,
    ArrowPathIcon, CurrencyRupeeIcon, PhoneIcon,
    StarIcon as StarIconSolid, CogIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Heart, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import config from '../config/config.js';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { ProductDetailSkeleton } from '../components/Loader/Skeleton.jsx';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import ReviewService from '../services/reviewService';
import SEO from '../components/SEO/SEO';
import { seoConfig } from '../config/seo';
import InternalLinking from '../components/SEO/InternalLinking';
import { slugify } from '../utils/slugify';
import VideoSection from '../components/Video/VideoSection';

// Lazy load heavy components for better initial page load
const RelatedProducts = lazy(() => import('../components/RelatedProducts'));
const Mostloved = lazy(() => import('../components/Products/MostLoved.jsx'));

const ProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedCityData } = useCity();
    const [searchParams] = useSearchParams();
    const moduleQuery = searchParams.get('module');
    const isShop = moduleQuery === 'shop';

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('details');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalSelectedImage, setModalSelectedImage] = useState(0);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [error, setError] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [categoryProductCount, setCategoryProductCount] = useState(0);
    const [subCategoryProductCounts, setSubCategoryProductCounts] = useState({});
    const [addons, setAddons] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [addonsLoading, setAddonsLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const { addToCart } = useCart();
    const [adminContacts, setAdminContacts] = useState({ service: '', shop: '' });

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/admin/settings/contacts`);
                if (response.ok) {
                    const data = await response.json();
                    setAdminContacts(data);
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };
        fetchContacts();
    }, []);

    const tabs = [
        { id: 'details', label: 'Overview', icon: SparklesIcon },
        { id: 'specifications', label: 'Specifications', icon: CogIcon },
        { id: 'shipping', label: 'Shipping', icon: TruckIcon },
        { id: 'reviews', label: 'Reviews', icon: ChatBubbleLeftRightIcon },
    ];

    const loadReviews = async () => {
        if (!product?._id) return;

        setReviewsLoading(true);
        try {
            const reviewsData = await ReviewService.getProductReviews(product._id);
            setReviews(reviewsData.reviews || []);

            if (user && user.email) {
                try {
                    const userReviewData = await ReviewService.getUserReview(product._id, user.email);
                    setUserReview(userReviewData);
                } catch (error) {
                    setUserReview(null);
                }
            } else {
                setUserReview(null);
            }
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = isShop
                    ? `${config.API_URLS.SHOP_PRODUCTS}/${id}`
                    : `${config.API_URLS.PRODUCTS}/${id}`;

                console.log('Fetching product from:', endpoint);
                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Product not found (status: ${response.status})`);
                }

                const data = await response.json();
                const foundProduct = data.product || data;

                if (!foundProduct || !foundProduct._id) {
                    throw new Error('Invalid product data received from API');
                }

                setProduct({
                    ...foundProduct,
                    id: foundProduct._id,
                    price: parseFloat(foundProduct.price) || 0,
                    regularPrice: parseFloat(foundProduct.regularPrice) || 0,
                    images: foundProduct.images && foundProduct.images.length > 0 ? foundProduct.images : [foundProduct.image],
                });

                // Fetch subcategories and product counts
                if (foundProduct.category?._id) {
                    fetchCategoryData(foundProduct.category._id);
                }

            } catch (error) {
                console.error('Error fetching product:', error);
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    setError('Unable to connect to server. Please check if the backend is running.');
                } else {
                    setError(error.message || 'Failed to load product details');
                }
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
            fetchAddons();
        }
    }, [id]);

    const fetchAddons = async () => {
        try {
            setAddonsLoading(true);
            const url = `${config.API_BASE_URL}/api/addons?active=true`;

            const response = await fetch(url);

            if (!response.ok) {
                setAddons([]);
                return;
            }

            const data = await response.json();

            if (data.success && data.data && Array.isArray(data.data)) {
                setAddons(data.data);
            } else {
                setAddons([]);
            }
        } catch (error) {
            setAddons([]);
        } finally {
            setAddonsLoading(false);
        }
    };

    const fetchCategoryData = async (categoryId) => {
        try {
            // Fetch subcategories with full data including images
            const subCatUrl = isShop
                ? `${config.API_BASE_URL}/api/shop/categories/${categoryId}/subcategories`
                : `${config.API_BASE_URL}/api/categories/${categoryId}/subcategories`;

            const subCatResponse = await fetch(subCatUrl);
            if (subCatResponse.ok) {
                const subCatData = await subCatResponse.json();
                // Subcategories now include image field
                setSubCategories(Array.isArray(subCatData) ? subCatData : (subCatData.subcategories || []));

                // Fetch all products in category to count properly
                const productsUrl = isShop
                    ? `${config.API_URLS.SHOP}?category=${categoryId}&limit=1000`
                    : `${config.API_URLS.PRODUCTS}?category=${categoryId}&limit=1000`;

                const categoryResponse = await fetch(productsUrl);
                if (categoryResponse.ok) {
                    const allProducts = await categoryResponse.json();
                    const productsArray = Array.isArray(allProducts) ? allProducts : [];

                    // Set total category count
                    setCategoryProductCount(productsArray.length);

                    // Count products per subcategory
                    const counts = {};
                    (subCatData || []).forEach(subCat => {
                        counts[subCat._id] = productsArray.filter(
                            p => p.subCategory?._id === subCat._id || p.subCategory === subCat._id
                        ).length;
                    });
                    setSubCategoryProductCounts(counts);
                }
            }
        } catch (error) {
            // Error fetching category data
        }
    };

    // Lazy load reviews only when the reviews tab is active
    useEffect(() => {
        if (product?._id && activeTab === 'reviews' && reviews.length === 0) {
            loadReviews();
        }
    }, [product?._id, activeTab]);

    // Memoize product images to avoid recalculating on every render
    const productImages = useMemo(() => {
        if (!product) return [];
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const validImages = product.images
                .filter(img => {
                    if (!img || typeof img !== 'string') return false;
                    const ext = img.toLowerCase().split('.').pop();
                    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                })
                .map(img => config.fixImageUrl(img));

            if (validImages.length > 0) return validImages;
        }

        const fallbackImage = config.fixImageUrl(product.image);
        return [fallbackImage];
    }, [product]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!product || productImages.length <= 1) return;

            if (e.key === 'ArrowLeft') {
                setSelectedImage(prev => prev === 0 ? productImages.length - 1 : prev - 1);
            } else if (e.key === 'ArrowRight') {
                setSelectedImage(prev => prev === productImages.length - 1 ? 0 : prev + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [product, productImages]);

    if (loading) return <ProductDetailSkeleton />;
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Product Not Found</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button onClick={() => navigate('/shop')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Back to Shop</button>
        </div>
    );
    if (!product) return null;

    const productSEO = seoConfig.product(product);
    const isOutOfStock = product.stock === 0 || product.inStock === false;

    // Enhanced SEO data for products
    const enhancedProductSEO = {
        ...productSEO,
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images || ["/logo.png"],
            "brand": {
                "@type": "Brand",
                "name": "TodayMyDream",
                "logo": "https://todaymydream.com/TodayMyDream.png"
            },
            "category": product.category?.name || "Decoration Materials",
            "sku": product.sku || product._id,
            "mpn": product.sku || product._id,
            "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "INR",
                "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                "url": `https://todaymydream.com/product/${product._id}`,
                "seller": {
                    "@type": "Organization",
                    "name": "TodayMyDream"
                },
                "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            "aggregateRating": reviews.length > 0 ? {
                "@type": "AggregateRating",
                "ratingValue": (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1),
                "reviewCount": reviews.length,
                "bestRating": 5,
                "worstRating": 1
            } : undefined,
            "review": reviews.slice(0, 5).map(review => ({
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": review.userName || "Anonymous"
                },
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": review.stars,
                    "bestRating": 5,
                    "worstRating": 1
                },
                "reviewBody": review.reviewDescription,
                "datePublished": review.createdAt
            }))
        }
    };

    const handleQuantityChange = (value) => {
        if (value >= 1) setQuantity(value);
    };

    const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.stars, 0) / reviews.length : 0;

    const handleReviewSubmitted = (newReview) => {
        setReviews(prev => [newReview, ...prev.filter(r => r.userEmail !== newReview.userEmail)]);
        setUserReview(newReview);
    };

    const handleReviewUpdated = (updatedReview) => {
        setReviews(prev => prev.map(review => review._id === updatedReview._id ? updatedReview : review));
        setUserReview(updatedReview);
    };

    const handleReviewDeleted = () => {
        setUserReview(null);
        loadReviews();
    };

    const handlePreviousImage = () => setSelectedImage(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
    const handleNextImage = () => setSelectedImage(prev => (prev === productImages.length - 1 ? 0 : prev + 1));



    const handleAddToCart = () => {
        setAddingToCart(true);
        addToCart(product, quantity);
        setTimeout(() => {
            setAddingToCart(false);
            toast.success('Product added to cart!');
        }, 800);
    };

    const handleBookNow = () => {
        if (isShop) {
            handleAddToCart();
            return;
        }
        // Always show the add-ons modal for consistent user experience
        setShowAddonsModal(true);
    };

    const handleProceedToCheckout = () => {
        navigate('/checkout', { state: { product, quantity, addons: selectedAddons } });
    };

    const handleAddonToggle = (addon) => {
        setSelectedAddons(prev => {
            const exists = prev.find(a => a.addonId === addon._id);
            if (exists) {
                return prev.filter(a => a.addonId !== addon._id);
            } else {
                return [...prev, {
                    addonId: addon._id,
                    name: addon.name,
                    price: addon.price,
                    quantity: 1
                }];
            }
        });
    };

    const handleAddonQuantityChange = (addonId, newQuantity) => {
        if (newQuantity < 1) return;
        setSelectedAddons(prev =>
            prev.map(addon =>
                addon.addonId === addonId
                    ? { ...addon, quantity: newQuantity }
                    : addon
            )
        );
    };

    const calculateAddonsTotal = () => {
        return selectedAddons.reduce((total, addon) => total + (addon.price * addon.quantity), 0);
    };

    const handleShare = () => setIsShareModalOpen(true);

    const handleShareOption = async (option) => {
        const shareData = {
            title: product.name,
            text: `Planning a celebration? Check out this amazing decor: ${product.name}`,
            url: window.location.href,
        };
        try {
            switch (option) {
                case 'native':
                    if (navigator.share) await navigator.share(shareData);
                    else {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                    }
                    break;
                case 'whatsapp':
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`, '_blank');
                    break;
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
                    break;
                case 'copy':
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                    break;
                default:
                    break;
            }
            setIsShareModalOpen(false);
        } catch (error) {
            toast.error('Failed to share product');
            setIsShareModalOpen(false);
        }
    };

    const handleImageClick = () => {
        setModalSelectedImage(selectedImage);
        setIsImageModalOpen(true);
    };

    const handleModalPreviousImage = () => setModalSelectedImage(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
    const handleModalNextImage = () => setModalSelectedImage(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
    const handleModalClose = () => setIsImageModalOpen(false);

    // WhatsApp button configuration - uses city-specific contact number
    const whatsappPhoneNumber = selectedCityData?.contactNumber || '+917739873442';
    const whatsappMessage = `Hello! I'm interested in the "${product.name}" product and have a question. Product Link: ${window.location.href}`;
    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    const contactNumber = isShop ? adminContacts.shop : adminContacts.service;
    const callUrl = `tel:${contactNumber || '+917739873442'}`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 font-sans selection:bg-black selection:text-white"
        >
            <SEO {...enhancedProductSEO} />

            {/* Category & Subcategories Info Bar with Images */}
            {product.category && (
                <div className="bg-white border-b border-gray-100 sticky top-16 z-20 shadow-sm backdrop-blur-md bg-white/80 support-backdrop-blur:bg-white/95">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                            {/* Current Category */}
                            <Link
                                to="/shop"
                                state={{ selectedCategory: { main: product.category.name } }}
                                className="group flex-shrink-0 flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-gray-100/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all duration-200"
                            >
                                {product.category.image && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                                        <img
                                            src={config.fixImageUrl(product.category.image)}
                                            alt={product.category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                                <span className="text-xs font-semibold text-gray-900 tracking-wide">{product.category.name}</span>
                            </Link>

                            {/* Separator */}
                            {subCategories.length > 0 && (
                                <span className="text-gray-300 text-xs font-light">/</span>
                            )}

                            {/* Subcategories */}
                            {subCategories.map((subCat) => {
                                const isActive = product.subCategory?._id === subCat._id;
                                return (
                                    <Link
                                        key={subCat._id}
                                        to="/shop"
                                        state={{
                                            selectedCategory: {
                                                main: product.category.name,
                                                sub: subCat.name
                                            }
                                        }}
                                        className={`flex-shrink-0 flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${isActive
                                            ? 'bg-black text-white shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
                                            }`}
                                    >
                                        {subCat.image && (
                                            <div className={`w-6 h-6 rounded-full overflow-hidden ${isActive ? 'border border-white/30' : 'border border-gray-100'}`}>
                                                <img
                                                    src={config.fixImageUrl(subCat.image)}
                                                    alt={subCat.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                        <span className="whitespace-nowrap">{subCat.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden md:block py-4">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center text-sm text-gray-500">
                        <Link to="/" className="hover:text-black transition-colors">Home</Link>
                        <span className="mx-2 text-gray-300">/</span>
                        <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
                        {product.category?.name && (
                            <>
                                <span className="mx-2 text-gray-300">/</span>
                                <Link to={`/shop?category=${product.category.name}`} className="hover:text-black transition-colors">{product.category.name}</Link>
                            </>
                        )}
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-3 py-3 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-8 items-start">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="lg:col-span-7 sticky top-28 self-start"
                    >
                        <div className="relative w-full rounded-3xl overflow-hidden bg-white group border border-slate-100 shadow-lg shadow-slate-200/50">
                            {/* Main Image Container */}
                            <div className="relative w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white min-h-[350px] md:min-h-[500px]" id="product-image-container">

                                {/* Premium Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2 z-30">
                                    {product.isBestSeller && (
                                        <motion.div
                                            initial={{ scale: 0, x: -20 }}
                                            animate={{ scale: 1, x: 0 }}
                                            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg shadow-amber-400/30 text-xs font-bold uppercase tracking-wider"
                                        >
                                            <Award className="w-4 h-4" />
                                            <span>Bestseller</span>
                                        </motion.div>
                                    )}
                                    {product.isTrending && (
                                        <motion.div
                                            initial={{ scale: 0, x: -20 }}
                                            animate={{ scale: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg shadow-violet-500/30 text-xs font-bold uppercase tracking-wider"
                                        >
                                            <TrendingUp className="w-4 h-4" />
                                            <span>Trending</span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Wishlist Button */}
                                <button className="absolute top-4 right-4 z-30 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-slate-100">
                                    <Heart className="w-5 h-5 text-slate-400 hover:text-rose-500 transition-colors" />
                                </button>

                                {/* Main Product Image */}
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    src={productImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain max-h-[500px] cursor-zoom-in p-6 transition-transform duration-500 group-hover:scale-[1.02]"
                                    onClick={handleImageClick}
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image';
                                    }}
                                />

                                {/* Out of Stock Overlay */}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
                                        <div className="bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest shadow-2xl -rotate-12">
                                            Out of Stock
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {productImages.length > 1 && (
                                    <>
                                        <button
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md text-slate-700 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white z-20 border border-slate-100"
                                            onClick={(e) => { e.stopPropagation(); handlePreviousImage(); }}
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeftIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md text-slate-700 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white z-20 border border-slate-100"
                                            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                            aria-label="Next image"
                                        >
                                            <ChevronRightIcon className="h-5 w-5" />
                                        </button>
                                    </>
                                )}

                                {/* Image Counter Badge */}
                                {productImages.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold z-20">
                                        {selectedImage + 1} / {productImages.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Strip */}
                            {productImages.length > 1 && (
                                <div className="flex gap-2 p-3 bg-slate-50/80 border-t border-slate-100 overflow-x-auto scrollbar-hide">
                                    {productImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all duration-300 ${selectedImage === idx
                                                ? 'ring-2 ring-[#FCD24C] ring-offset-2 scale-105 shadow-lg'
                                                : 'opacity-60 hover:opacity-100 border border-slate-200'
                                                }`}
                                            aria-label={`View image ${idx + 1}`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} view ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={e => { e.target.src = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=...'; }}
                                            />
                                            {selectedImage === idx && (
                                                <div className="absolute inset-0 border-2 border-[#FCD24C] rounded-xl" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>


                        {/* Tabs Navigation - Modern Style */}
                        <div className="pt-6" id="reviews">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-6">
                                {tabs.map((tab) => {
                                    const TabIcon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                                                ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 ring-1 ring-black/5'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                                }`}
                                        >
                                            <TabIcon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-[#FCD24C]' : 'opacity-70'}`} />
                                            <span className="truncate">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>


                            <div className="py-3">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'details' && (
                                        <motion.div
                                            key="details"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >


                                            {/* Features Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                                {/* What's Included & Excluded Card */}
                                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

                                                    {/* Care Instructions/Included */}
                                                    {product.care && (
                                                        <div className="mb-6">
                                                            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                                                <span className="w-1.5 h-4 bg-green-500 rounded-full"></span>
                                                                What's Included
                                                            </h5>
                                                            <ul className="space-y-3">
                                                                {product.care
                                                                    .split(/\n/)
                                                                    .filter(item => item.trim() !== '')
                                                                    .map((item, index) => (
                                                                        <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                                                            <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                                                                            <span className="leading-relaxed">{item.trim()}</span>
                                                                        </li>
                                                                    ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Excluded Items */}
                                                    {product.excluded && product.excluded.length > 0 && (
                                                        <div className="pt-6 border-t border-gray-100">
                                                            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                                                <span className="w-1.5 h-4 bg-red-500 rounded-full"></span>
                                                                Not Included
                                                            </h5>
                                                            <ul className="space-y-3">
                                                                {product.excluded.map((item, index) => (
                                                                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                                                        <span className="text-red-500 font-bold flex-shrink-0 mt-0.5">✕</span>
                                                                        <span className="leading-relaxed">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Why Choose This Product */}
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                    <GiftIcon className="w-5 h-5 text-gray-900" />
                                                    Why Choose This Product?
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                            <SparklesIcon className="w-5 h-5 text-black" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">Eye-Catching Design</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">Creates stunning visual impact that wows your guests</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                            <ShieldCheckIcon className="w-5 h-5 text-black" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">Quality Guaranteed</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">100% authentic products with quality assurance</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                            <TruckIcon className="w-5 h-5 text-black" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">Fast & Safe Delivery</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">Carefully packaged for damage-free arrival</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-black" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">Expert Support</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">24/7 customer service to help with your needs</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'specifications' && (
                                        <motion.div
                                            key="specifications"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >

                                            {/* Key Features Card */}
                                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <SparklesIcon className="w-5 h-5 text-gray-900" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900">Key Features</h4>
                                                </div>
                                                <ul className="space-y-4">
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">Premium Material</p>
                                                            <p className="text-sm text-gray-600 mt-0.5"> {product.material || 'high-quality, durable materials'}</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">Perfect For</p>
                                                            <p className="text-sm text-gray-600 mt-0.5">{product.utility || 'Birthdays, weddings, anniversaries, and all celebrations'}</p>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Main Specifications Card */}
                                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <CogIcon className="w-5 h-5 text-gray-900" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900">Product Specifications</h4>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Material</p>
                                                        <p className="text-sm text-gray-900 font-medium mt-1">{product.material || 'Premium Quality Materials'}</p>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Size</p>
                                                        <p className="text-sm text-gray-900 font-medium mt-1">{product.size || 'Standard Size'}</p>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Color</p>
                                                        <p className="text-sm text-gray-900 font-medium mt-1">{product.colour || 'As Shown'}</p>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">SKU</p>
                                                        <p className="text-sm text-gray-900 font-medium mt-1 font-mono">{product.sku || product._id.slice(-8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'shipping' && (
                                        <motion.div
                                            key="shipping"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="prose max-w-none text-slate-600"
                                        >
                                            <h3 className="text-xl font-serif text-slate-800 mb-4">Your Celebration, Delivered Promptly & Safely</h3>
                                            <p>We understand that timing is everything when planning an event. We take extra care to ensure your decorations arrive safely and on time.</p>
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 mb-3">Shipping Details</h4>
                                                    <ul className="space-y-2 text-sm">
                                                        <li>• Free shipping on orders above ₹1000</li>
                                                        <li>• Standard delivery: 3-5 business days</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'reviews' && (
                                        <motion.div
                                            key="reviews"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-8"
                                        >
                                            {reviewsLoading ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                                    <span className="ml-3 text-gray-600 font-medium">Loading customer stories...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <ReviewForm
                                                        productId={product._id}
                                                        existingReview={userReview}
                                                        isEditing={isEditingReview}
                                                        onStartEdit={() => setIsEditingReview(true)}
                                                        onCancelEdit={() => setIsEditingReview(false)}
                                                        onReviewSubmitted={handleReviewSubmitted}
                                                        onReviewUpdated={handleReviewUpdated}
                                                        onReviewDeleted={handleReviewDeleted}
                                                    />
                                                    <ReviewList
                                                        reviews={reviews}
                                                        averageRating={averageRating}
                                                        totalReviews={reviews.length}
                                                    />
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Product Info */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 self-start py-6 lg:py-0">

                        {/* Category & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {product.category?.name && (
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200">
                                    {product.category.name}
                                </span>
                            )}
                            {product.isBestSeller && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-md shadow-amber-300/30">
                                    <Award className="w-3 h-3" /> Bestseller
                                </span>
                            )}
                            {product.isTrending && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-md shadow-violet-300/30">
                                    <TrendingUp className="w-3 h-3" /> Trending
                                </span>
                            )}
                        </div>

                        {/* Product Title */}
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={`text-lg ${star <= Math.round(averageRating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                    ))}
                                </div>
                                <span className="font-bold text-slate-800">{averageRating?.toFixed(1)}</span>
                                <span className="text-slate-400 text-sm">({reviews.length} reviews)</span>
                            </div>
                        )}

                        {/* Price Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            {/* Decorative Element */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FCD24C]/10 rounded-full blur-2xl" />

                            <div className="relative flex flex-col gap-3">
                                {/* Main Price */}
                                <div className="flex items-baseline gap-3 flex-wrap">
                                    <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                        ₹{product.price?.toLocaleString('en-IN')}
                                    </span>
                                    {product.regularPrice && product.regularPrice > product.price && (
                                        <span className="text-xl text-slate-400 line-through font-medium">
                                            ₹{product.regularPrice?.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>

                                {/* Savings Badge */}
                                {product.regularPrice && product.regularPrice > product.price && (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-full shadow-md shadow-green-300/30">
                                            <SparklesIcon className="w-4 h-4" />
                                            Save ₹{(product.regularPrice - product.price).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                            {Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)}% OFF
                                        </span>
                                    </div>
                                )}

                                {/* Price Note */}
                                <p className="text-xs text-slate-500 mt-1">
                                    Inclusive of all taxes
                                </p>
                            </div>
                        </div>

                        {/* Description Excerpt */}
                        <div className="space-y-3">
                            <p className="text-slate-600 leading-relaxed line-clamp-3">{product.description}</p>
                            <button
                                onClick={() => {
                                    document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
                                    setActiveTab('details');
                                }}
                                className="inline-flex items-center gap-1 text-[#F5A623] font-semibold hover:gap-2 transition-all duration-300"
                            >
                                Read full details →
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {/* Primary CTA */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBookNow}
                                    disabled={isOutOfStock || addingToCart}
                                    className={`relative flex-1 py-4 px-6 rounded-2xl font-bold text-base uppercase tracking-wider shadow-lg transform transition-all duration-300 overflow-hidden group ${isOutOfStock
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#FCD24C] to-[#F5A623] text-slate-900 hover:shadow-xl hover:shadow-amber-300/40 hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {/* Shine Effect */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    <span className="relative">
                                        {isOutOfStock ? 'Out of Stock' : (addingToCart ? 'Adding...' : (isShop ? '🛒 Add to Cart' : '📅 Book Now'))}
                                    </span>
                                </button>

                                <a
                                    href={callUrl}
                                    className="flex items-center justify-center px-6 py-4 rounded-2xl font-bold text-base uppercase tracking-wider shadow-lg bg-black text-white hover:bg-gray-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    <PhoneIcon className="w-5 h-5 mr-2" />
                                    <span>Call Now</span>
                                </a>
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex gap-3">
                                {/* WhatsApp Button */}
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                    </svg>
                                    <span>WhatsApp</span>
                                </a>

                                {/* Share Button */}
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all duration-300"
                                    aria-label="Share"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093s-.107.769-.287 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                    </svg>
                                    <span className="hidden sm:inline">Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Secure Booking</p>
                                    <p className="text-xs text-slate-500">100% Protected</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <SparklesIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Premium Quality</p>
                                    <p className="text-xs text-slate-500">Verified Decor</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

                <div>
                    {/* Why Image Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6 }}

                    >
                        <div className="relative w-full h-52 py-10 md:h-66 lg:h-80 rounded-2xl overflow-hidden ">
                            <img
                                src="/why.jpg"
                                alt="Why Choose Our Products"
                                className="w-full h-full object-contain rounded-2xl"
                                onError={e => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/800x400/e2e8f0/475569?text=Why+Choose+Us';
                                }}
                            />

                        </div>
                    </motion.div>

                    {/* Video Section - Reviews and Work */}
                    <VideoSection

                        subtitle="See what our customers say and watch our decoration work"
                        limit={4}
                        showViewAll={false}
                        className="py-1"
                    />

                    {/* Lazy load these components for better performance */}
                    <Suspense fallback={
                        <div className="py-8 flex justify-center">
                            <Loader size="medium" text="Loading..." />
                        </div>
                    }>
                        <Mostloved />
                    </Suspense>

                    {product && product.category && (
                        <Suspense fallback={
                            <div className="py-8 flex justify-center">
                                <Loader size="medium" text="Loading similar products..." />
                            </div>
                        }>
                            <RelatedProducts currentProduct={product} />
                        </Suspense>
                    )}

                </div>
            </div >

            <AnimatePresence>
                {isImageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={handleModalClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full h-full flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleModalClose}
                                className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-3 rounded-full transition-all border border-white/20"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <div className="relative flex items-center justify-center w-full h-full">
                                <img
                                    src={productImages[modalSelectedImage]}
                                    alt={`${product.name} - Full size view`}
                                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                                    onLoad={(e) => {
                                        // Optimize modal sizing for different aspect ratios and devices
                                        const img = e.target;
                                        const aspectRatio = img.naturalWidth / img.naturalHeight;
                                        const isMobile = window.innerWidth < 768;

                                        let viewportWidth, viewportHeight;

                                        if (isMobile) {
                                            // Mobile modal - use almost full screen
                                            viewportWidth = window.innerWidth * 0.98;
                                            viewportHeight = window.innerHeight * 0.98;
                                        } else {
                                            // Desktop modal
                                            viewportWidth = window.innerWidth * 0.95;
                                            viewportHeight = window.innerHeight * 0.95;
                                        }

                                        let displayWidth, displayHeight;

                                        if (isMobile) {
                                            // Mobile-first modal approach
                                            if (aspectRatio > 1) {
                                                // Landscape on mobile - prioritize full width
                                                displayWidth = viewportWidth;
                                                displayHeight = displayWidth / aspectRatio;

                                                // Ensure reasonable height on mobile
                                                if (displayHeight > viewportHeight) {
                                                    displayHeight = viewportHeight;
                                                    displayWidth = displayHeight * aspectRatio;
                                                }
                                            } else {
                                                // Portrait on mobile - prioritize height
                                                displayHeight = viewportHeight;
                                                displayWidth = displayHeight * aspectRatio;

                                                if (displayWidth > viewportWidth) {
                                                    displayWidth = viewportWidth;
                                                    displayHeight = displayWidth / aspectRatio;
                                                }
                                            }
                                        } else {
                                            // Desktop modal logic
                                            if (aspectRatio > 1.5) {
                                                displayWidth = Math.min(viewportWidth, img.naturalWidth);
                                                displayHeight = displayWidth / aspectRatio;

                                                const minHeight = viewportHeight * 0.6;
                                                if (displayHeight < minHeight) {
                                                    displayHeight = minHeight;
                                                    displayWidth = displayHeight * aspectRatio;
                                                }
                                            } else if (aspectRatio > 1) {
                                                displayWidth = Math.min(viewportWidth * 0.9, img.naturalWidth);
                                                displayHeight = displayWidth / aspectRatio;

                                                if (displayHeight > viewportHeight) {
                                                    displayHeight = viewportHeight;
                                                    displayWidth = displayHeight * aspectRatio;
                                                }
                                            } else {
                                                displayHeight = Math.min(viewportHeight, img.naturalHeight);
                                                displayWidth = displayHeight * aspectRatio;

                                                if (displayWidth > viewportWidth) {
                                                    displayWidth = viewportWidth;
                                                    displayHeight = displayWidth / aspectRatio;
                                                }
                                            }
                                        }

                                        // Apply calculated dimensions for modal
                                        img.style.width = `${displayWidth}px`;
                                        img.style.height = `${displayHeight}px`;
                                        img.style.objectFit = `contain`;
                                    }}
                                />

                                {productImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={handleModalPreviousImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-4 rounded-full transition-all shadow-lg border border-white/20"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeftIcon className="h-8 w-8" />
                                        </button>
                                        <button
                                            onClick={handleModalNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-4 rounded-full transition-all shadow-lg border border-white/20"
                                            aria-label="Next image"
                                        >
                                            <ChevronRightIcon className="h-8 w-8" />
                                        </button>
                                    </>
                                )}

                                {productImages.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                                        {modalSelectedImage + 1} / {productImages.length}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isShareModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsShareModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 font-sans"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">Share This Item</h3>
                                <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleShareOption('copy')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                                        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                                        <span className="text-sm font-medium text-gray-700">Copy Link</span>
                                    </button>
                                    <button onClick={() => handleShareOption('whatsapp')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"><svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg></div>
                                        <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Bottom Buttons - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-xl md:hidden pb-safe">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Book Now Button */}
                        <button
                            onClick={handleBookNow}
                            disabled={isOutOfStock}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all shadow-lg ${isOutOfStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-900'
                                }`}
                        >
                            <span>{isOutOfStock ? 'Out of Stock' : (isShop ? 'Shop Now' : 'Book Now')}</span>
                        </button>

                        {/* WhatsApp Button */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-3.5 rounded-full bg-green-500 text-white shadow-lg shadow-green-200"
                        >
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                        </a>

                        <a
                            href={callUrl}
                            className="flex items-center justify-center p-3.5 rounded-full bg-gray-100 text-gray-900 border border-gray-200"
                        >
                            <PhoneIcon className="h-6 w-6" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Add bottom padding to prevent content from being hidden behind sticky buttons - Mobile Only */}
            <div className="h-16 md:hidden"></div>
            <AnimatePresence>
                {showAddonsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={() => setShowAddonsModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 z-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Enhance Your Celebration</h3>
                                    <p className="text-gray-500 text-sm mt-0.5">Select optional add-ons</p>
                                </div>
                                <button
                                    onClick={() => setShowAddonsModal(false)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6 bg-gray-50">
                                {addonsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                            <p className="mt-4 text-gray-500 text-sm">Loading add-ons...</p>
                                        </div>
                                    </div>
                                ) : !addons || addons.length === 0 ? (
                                    <div className="text-center py-12">
                                        <GiftIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-900 font-medium mb-1">No add-ons available</p>
                                        <p className="text-gray-500 text-sm">Proceed to checkout</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addons.map((addon) => {
                                            const isSelected = selectedAddons.find(a => a.addonId === addon._id);
                                            return (
                                                <div
                                                    key={addon._id}
                                                    className={`border rounded-xl p-3 cursor-pointer transition-all ${isSelected
                                                        ? 'border-black ring-1 ring-black bg-white shadow-sm'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                    onClick={() => handleAddonToggle(addon)}
                                                >
                                                    <div className="flex gap-4">
                                                        {/* Image */}
                                                        {addon.image && (
                                                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                                <img
                                                                    src={config.fixImageUrl(addon.image)}
                                                                    alt={addon.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 text-sm">{addon.name}</h4>
                                                                    <p className="text-sm font-bold text-gray-900 mt-1">₹{addon.price}</p>
                                                                </div>

                                                                {/* Checkbox */}
                                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-2 flex-shrink-0 transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-300'
                                                                    }`}>
                                                                    {isSelected && (
                                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Quantity Selector */}
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="flex items-center gap-3 mt-3"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAddonQuantityChange(addon._id, isSelected.quantity - 1);
                                                                            }}
                                                                            className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-gray-700 text-xs hover:bg-gray-50"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="w-8 text-center font-semibold text-sm">{isSelected.quantity}</span>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAddonQuantityChange(addon._id, isSelected.quantity + 1);
                                                                            }}
                                                                            className="w-6 h-6 rounded bg-black shadow-sm text-white flex items-center justify-center text-xs hover:bg-gray-800"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 sm:p-6">
                                {selectedAddons.length > 0 && (
                                    <div className="mb-4 flex items-center justify-between text-base">
                                        <span className="text-gray-500">Cart Total</span>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-gray-900">₹{((product.price * quantity) + calculateAddonsTotal()).toFixed(2)}</span>
                                            <p className="text-xs text-gray-400">Including {selectedAddons.length} add-ons</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (selectedAddons.length === 0) {
                                                setShowAddonsModal(false);
                                                navigate('/checkout', { state: { product, quantity, addons: [] } });
                                            } else {
                                                handleProceedToCheckout();
                                            }
                                        }}
                                        className="w-full px-6 py-4 bg-black text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-900 shadow-lg transform transition-transform active:scale-95"
                                    >
                                        {selectedAddons.length > 0 ? 'Continue to Checkout' : 'Skip & Checkout'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div >
    );
};

export default ProductView;