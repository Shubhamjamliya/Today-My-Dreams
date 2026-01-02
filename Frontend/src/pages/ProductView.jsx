import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparklesIcon, GiftIcon, ShieldCheckIcon,
    ShoppingCartIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon,
    CogIcon, TruckIcon, ChatBubbleLeftRightIcon, PhoneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { TrendingUp, Heart, Award } from 'lucide-react';
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

    const tabs = [
        { id: 'details', label: 'Art of Celebration', icon: SparklesIcon },
        { id: 'specifications', label: 'Details', icon: CogIcon },

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

                const endpoint = `${config.API_URLS.PRODUCTS}/${id}`;
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
            const subCatResponse = await fetch(`${config.API_BASE_URL}/api/categories/${categoryId}/subcategories`);
            if (subCatResponse.ok) {
                const subCatData = await subCatResponse.json();
                // Subcategories now include image field
                setSubCategories(subCatData || []);

                // Fetch all products in category to count properly
                const categoryResponse = await fetch(`${config.API_URLS.SHOP}?category=${categoryId}&limit=1000`);
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

    const handleBookNow = () => {
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-amber-50/50 font-sans"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        >
            <SEO {...enhancedProductSEO} />

            {/* Category & Subcategories Info Bar with Images */}
            {product.category && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100"
                >
                    <div className="container mx-auto px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                            {/* Current Category with Image and Total Count */}
                            <Link
                                to="/shop"
                                state={{ selectedCategory: { main: product.category.name } }}
                                className=" bg-black flex-shrink-0 flex items-center gap-2.5 bg-blue-600 text-white px-3 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                {product.category.image && (
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 flex-shrink-0 ring-2 ring-white/20">
                                        <img
                                            src={config.fixImageUrl(product.category.image)}
                                            alt={product.category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                                <span className=" bg-black text-blue-700 whitespace-nowrap font-bold">{product.category.name}</span>

                            </Link>

                            {/* Separator */}
                            {subCategories.length > 0 && (
                                <span className="text-blue-400 text-sm font-bold">→</span>
                            )}

                            {/* Subcategories with Images and Product Counts */}
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
                                        className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg ${isActive
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-105'
                                            : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300'
                                            }`}
                                    >
                                        {subCat.image && (
                                            <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ${isActive ? 'border-2 border-white/50 ring-2 ring-white/20' : 'border-2 border-blue-200'
                                                }`}>
                                                <img
                                                    src={config.fixImageUrl(subCat.image)}
                                                    alt={subCat.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                        <span className=" text-blue-700 whitespace-nowrap font-semibold">{subCat.name}</span>

                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="border-b border-amber-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10 hidden md:block">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
                        <span>/</span>
                        <Link to="/shop" className="hover:text-amber-600 transition-colors">Shop</Link>
                        {product.category?.name && (
                            <>
                                <span>/</span>
                                <Link to={`/shop?category=${product.category.name}`} className="hover:text-amber-600 transition-colors">{product.category.name}</Link>
                            </>
                        )}
                        {product.subCategory?.name && (
                            <>
                                <span>/</span>
                                <span className="text-slate-900 font-medium">{product.name}</span>
                            </>
                        )}
                        {!product.subCategory?.name && (
                            <>
                                <span>/</span>
                                <span className="text-slate-900 font-medium">{product.name}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-3 py-3 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-8 items-start">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-6 space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-visible"
                    >
                        <div className="relative w-full rounded-2xl overflow-hidden bg-white group shadow-xl shadow-amber-200/50">
                            <div className="relative w-full flex items-center justify-center min-h-[300px] md:min-h-[500px]" id="product-image-container">

                                {/* Attractive Badges at Top Left */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
                                    {product.isBestSeller && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-full shadow-xl text-xs font-bold uppercase tracking-wide"
                                        >
                                            <Award className="w-4 h-4" />
                                            <span>Best Seller</span>
                                        </motion.div>
                                    )}
                                    {product.isTrending && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 }}
                                            className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-xl text-xs font-bold uppercase tracking-wide animate-pulse"
                                        >
                                            <TrendingUp className="w-4 h-4" />
                                            <span>Trending</span>
                                        </motion.div>
                                    )}
                                    {product.isMostLoved && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.2 }}
                                            className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-full shadow-xl text-xs font-bold uppercase tracking-wide"
                                        >
                                            <Heart className="w-4 h-4 fill-current" />
                                            <span>Most Loved</span>
                                        </motion.div>
                                    )}
                                </div>

                                <img
                                    src={productImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
                                    onClick={handleImageClick}
                                    onLoad={(e) => {
                                        // Dynamic container sizing based on image aspect ratio and device type
                                        const img = e.target;
                                        const container = img.parentElement;
                                        const aspectRatio = img.naturalWidth / img.naturalHeight;
                                        const isMobile = window.innerWidth < 768; // md breakpoint

                                        // Get available space
                                        const availableWidth = container.clientWidth;
                                        let availableHeight;

                                        if (isMobile) {
                                            // On mobile, use more of the viewport height for prominent display
                                            availableHeight = window.innerHeight * 0.7;
                                        } else {
                                            // On desktop, use more space for prominent display
                                            availableHeight = window.innerHeight * 0.8;
                                        }

                                        let displayWidth, displayHeight;

                                        if (isMobile) {
                                            // Mobile-first approach: prioritize full width utilization
                                            if (aspectRatio > 1) {
                                                // Landscape on mobile - use full width and calculate height
                                                displayWidth = availableWidth;
                                                displayHeight = displayWidth / aspectRatio;

                                                // Allow larger images on mobile
                                                const maxMobileHeight = window.innerHeight * 0.75;
                                                if (displayHeight > maxMobileHeight) {
                                                    displayHeight = maxMobileHeight;
                                                    displayWidth = displayHeight * aspectRatio;
                                                }
                                            } else {
                                                // Portrait on mobile - use most of the available height
                                                displayHeight = Math.min(availableHeight, window.innerHeight * 0.75);
                                                displayWidth = displayHeight * aspectRatio;

                                                // Ensure it doesn't exceed screen width
                                                if (displayWidth > availableWidth) {
                                                    displayWidth = availableWidth;
                                                    displayHeight = displayWidth / aspectRatio;
                                                }
                                            }

                                            // Minimum sizes for mobile - larger for prominence
                                            const minMobileHeight = aspectRatio > 1 ? 350 : 400;
                                            displayHeight = Math.max(displayHeight, minMobileHeight);
                                            displayWidth = Math.max(displayWidth, 320);
                                        } else {
                                            // Desktop logic (existing)
                                            if (aspectRatio > 1) {
                                                displayWidth = Math.min(availableWidth, availableHeight * aspectRatio);
                                                displayHeight = displayWidth / aspectRatio;

                                                const maxHeightForLandscape = window.innerHeight * 0.85;
                                                if (displayHeight > maxHeightForLandscape) {
                                                    displayHeight = maxHeightForLandscape;
                                                    displayWidth = displayHeight * aspectRatio;
                                                }
                                            } else {
                                                displayHeight = Math.min(availableHeight, availableWidth / aspectRatio);
                                                displayWidth = displayHeight * aspectRatio;
                                            }

                                            const minHeight = aspectRatio > 1 ? 400 : 500;
                                            displayHeight = Math.max(displayHeight, minHeight);
                                            displayWidth = Math.max(displayWidth, 400);
                                        }

                                        // Apply calculated dimensions to fill container
                                        container.style.height = `${displayHeight}px`;
                                        img.style.width = `100%`;
                                        img.style.height = `100%`;
                                        img.style.objectFit = `cover`;
                                    }}
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x600/e2e8f0/475569?text=Image+Not+Found';
                                    }}
                                />
                            </div>

                            {isOutOfStock && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-20"
                                >
                                    Out of Stock
                                </motion.div>
                            )}

                            {productImages.length > 1 && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-amber-500 p-2 rounded-full shadow-lg transition-all z-10 border border-amber-200/50 backdrop-blur-sm"
                                        onClick={handlePreviousImage}
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeftIcon className="h-6 w-6" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-amber-500 p-2 rounded-full shadow-lg transition-all z-10 border border-amber-200/50 backdrop-blur-sm"
                                        onClick={handleNextImage}
                                        aria-label="Next image"
                                    >
                                        <ChevronRightIcon className="h-6 w-6" />
                                    </motion.button>
                                </>
                            )}

                            {productImages.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-4   bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
                                >
                                    {selectedImage + 1} / {productImages.length}
                                </motion.div>
                            )}
                        </div>

                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-6 space-y-2 flex flex-col justify-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-4 no-scrollbar"
                    >
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                {product.category?.name && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full tracking-wide">
                                        {product.category.name}
                                    </span>
                                )}
                                {product.subCategory?.name && (
                                    <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-semibold rounded-full tracking-wide">
                                        {product.subCategory.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, index) => (
                                        <StarIconSolid
                                            key={index}
                                            className={`h-5 w-5 ${index < Math.round(averageRating) ? 'text-amber-500' : 'text-slate-300'}`}
                                        />
                                    ))}
                                </div>
                                <a href="#reviews" onClick={() => setActiveTab('reviews')} className="text-sm text-slate-600 hover:text-amber-600 transition">
                                    {reviews.length > 0 ? `${averageRating.toFixed(1)} (${reviews.length} reviews)` : 'Be the first to review'}
                                </a>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="text-4xl font-bold text-slate-900 font-serif">
                                    ₹{product.price.toFixed(2)}
                                </span>
                                {product.regularPrice && product.regularPrice > product.price && (
                                    <>
                                        <span className="text-xl text-slate-400 line-through">₹{product.regularPrice.toFixed(2)}</span>
                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                                            {Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                            {product.regularPrice && product.regularPrice > product.price && (
                                <p className="text-sm font-medium text-green-600">You save ₹{(product.regularPrice - product.price).toFixed(2)}!</p>
                            )}
                        </div>




                        {/* View More in Category Button */}
                        {product.category?.name && (
                            <div className="mt-2">
                                <Link
                                    to="/shop"
                                    state={{ selectedCategory: { main: product.category.name, sub: null, item: null } }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg transition-colors text-sm font-medium group"
                                >
                                    <span>View More in {product.category.name}</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        )}

                        {/* Desktop buttons - hidden on mobile as we have sticky buttons */}
                        <div className="hidden md:flex items-center gap-2 sm:gap-4">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleBookNow}
                                disabled={isOutOfStock}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-8 py-3 rounded-full font-semibold transition-all text-base ${isOutOfStock
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40'
                                    }`}
                            >
                                <span>{isOutOfStock ? 'Out of Stock' : 'BOOK NOW'}</span>
                            </motion.button>

                            <motion.a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-8 py-3 rounded-full font-semibold transition-all text-base bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                </svg>
                                <span>Contact Us</span>
                            </motion.a>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-3 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors flex-shrink-0"
                                onClick={() => window.open(`tel:${selectedCityData?.contactNumber || '+917739873442'}`, '_self')}
                            >
                                <PhoneIcon className="h-5 w-5 text-slate-600" />
                            </motion.button>
                        </div>

                        <div className="border-t border-amber-200/80 pt-2 mt-1">
                            <div className="flex justify-between items-center text-center gap-4">
                                <div className="flex flex-col items-center gap-1 w-1/4">
                                    <SparklesIcon className="h-6 w-6 text-amber-500" />
                                    <span className="text-[11px] text-slate-600 font-medium">Guaranteed to Dazzle</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-1/4">
                                    <GiftIcon className="h-6 w-6 text-amber-500" />
                                    <span className="text-[11px] text-slate-600 font-medium">Perfect for Gifting</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-1/4">
                                    <ShieldCheckIcon className="h-6 w-6 text-amber-500" />
                                    <span className="text-[11px] text-slate-600 font-medium">Premium Quality</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-1/4">
                                    <TruckIcon className="h-6 w-6 text-amber-500" />
                                    <span className="text-[11px] text-slate-600 font-medium">Fast & Safe Delivery</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6" id="reviews">
                            <div className="border-b border-amber-200/80">
                                <nav className="flex overflow-x-auto no-scrollbar gap-x-4 sm:gap-x-6 border-b">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-1 sm:gap-2 py-3 px-2 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                                ? 'border-amber-500 text-amber-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                                }`}
                                        >
                                            <tab.icon className="h-5 w-5" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>

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
                                                <div className="bg-white p-6 rounded-2xl border-2 border-blue-200/80 shadow-lg hover:shadow-xl transition-shadow">


                                                    {/* Care Instructions */}
                                                    {product.care && (
                                                        <div className="mb-4">
                                                            <h5 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                                                                <span className="text-green-600">✓</span> What's Included / Excluded
                                                            </h5>
                                                            <ul className="space-y-2">
                                                                {product.care
                                                                    .split(/\n/) // Split by comma OR newline
                                                                    .filter(item => item.trim() !== '') // Remove any empty lines
                                                                    .map((item, index) => (
                                                                        <li key={index} className="flex items-start gap-3 p-2.5 bg-green-50 rounded-lg">
                                                                            <span className="text-green-600 text-base font-bold flex-shrink-0 mt-0.5">✓</span>
                                                                            <span className="text-sm text-slate-700 leading-relaxed">{item.trim()}</span>
                                                                        </li>
                                                                    ))}
                                                            </ul>
                                                        </div>
                                                    )}


                                                    {/* Default message if no items */}

                                                </div>
                                                <div className="bg-white p-6 rounded-2xl border-2 border-blue-200/80 shadow-lg hover:shadow-xl transition-shadow">

                                                    {/* Excluded Items */}
                                                    {product.excluded && product.excluded.length > 0 && (
                                                        <div>
                                                            <h5 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                                                                <span className="text-red-600">✗</span> Not Included
                                                            </h5>
                                                            <ul className="space-y-2">
                                                                {product.excluded.map((item, index) => (
                                                                    <li key={index} className="flex items-start gap-3 p-2.5 bg-red-50 rounded-lg">
                                                                        <span className="text-red-600 text-base font-bold flex-shrink-0 mt-0.5">✗</span>
                                                                        <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Why Choose This Product */}
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <GiftIcon className="w-6 h-6 text-purple-600" />
                                                    Why Choose This Product?
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-purple-200 rounded-full flex-shrink-0">
                                                            <SparklesIcon className="w-4 h-4 text-purple-700" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Eye-Catching Design</p>
                                                            <p className="text-sm text-slate-600">Creates stunning visual impact that wows your guests</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-pink-200 rounded-full flex-shrink-0">
                                                            <ShieldCheckIcon className="w-4 h-4 text-pink-700" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Quality Guaranteed</p>
                                                            <p className="text-sm text-slate-600">100% authentic products with quality assurance</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-purple-200 rounded-full flex-shrink-0">
                                                            <TruckIcon className="w-4 h-4 text-purple-700" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Fast & Safe Delivery</p>
                                                            <p className="text-sm text-slate-600">Carefully packaged for damage-free arrival</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-pink-200 rounded-full flex-shrink-0">
                                                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-pink-700" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Expert Support</p>
                                                            <p className="text-sm text-slate-600">24/7 customer service to help with your needs</p>
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
                                            <div className="bg-white p-6 rounded-2xl border-2 border-amber-200/80 shadow-lg hover:shadow-xl transition-shadow">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-amber-100 rounded-lg">
                                                        <SparklesIcon className="w-6 h-6 text-amber-600" />
                                                    </div>
                                                    <h4 className="text-xl font-bold text-slate-900">Key Features</h4>
                                                </div>
                                                <ul className="space-y-3">
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Premium Material</p>
                                                            <p className="text-sm text-slate-600"> {product.material || 'high-quality, durable materials'}</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Perfect For</p>
                                                            <p className="text-sm text-slate-600">{product.utility || 'Birthdays, weddings, anniversaries, and all celebrations'}</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Size Options</p>
                                                            <p className="text-sm text-slate-600">{product.size || 'Standard size - perfect for any venue'}</p>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                            {/* Main Specifications Card */}
                                            <div className="bg-white p-6 rounded-2xl border-2 border-amber-200/80 shadow-lg hover:shadow-xl transition-shadow">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-amber-100 rounded-lg">
                                                        <CogIcon className="w-6 h-6 text-amber-600" />
                                                    </div>
                                                    <h4 className="text-xl font-bold text-slate-900">Product Specifications</h4>
                                                </div>
                                                <ul className="space-y-3">
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Product Name</p>
                                                            <p className="text-sm text-slate-600">{product.name}</p>
                                                        </div>
                                                    </li>
                                                    {product.category?.name && (
                                                        <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                            <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">Category</p>
                                                                <p className="text-sm text-slate-600">{product.category.name}</p>
                                                            </div>
                                                        </li>
                                                    )}
                                                    {product.subCategory?.name && (
                                                        <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                            <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">Sub-Category</p>
                                                                <p className="text-sm text-slate-600">{product.subCategory.name}</p>
                                                            </div>
                                                        </li>
                                                    )}
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Material</p>
                                                            <p className="text-sm text-slate-600">{product.material || 'Premium Quality Materials'}</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Size</p>
                                                            <p className="text-sm text-slate-600">{product.size || 'Standard Size'}</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Color</p>
                                                            <p className="text-sm text-slate-600">{product.colour || 'As Shown'}</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                        <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Stock Status</p>
                                                            <div className="mt-1">
                                                                {isOutOfStock ? (
                                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                                        Out of Stock
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                                        In Stock & Ready to Ship
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </li>
                                                    {product.sku && (
                                                        <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                            <span className="text-amber-500 text-xl font-bold flex-shrink-0">◆</span>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">SKU</p>
                                                                <p className="text-sm text-slate-600 font-mono">{product.sku}</p>
                                                            </div>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            {/* Additional Product Information */}
                                            <div className="bg-white p-6 rounded-2xl border border-amber-200/60 shadow-md">
                                                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <SparklesIcon className="w-5 h-5 text-amber-500" />
                                                    What Makes This Special
                                                </h4>
                                                <ul className="space-y-3">
                                                    <li className="flex items-start gap-3">
                                                        <div className="mt-1 p-1 bg-amber-100 rounded-full flex-shrink-0">
                                                            <ShieldCheckIcon className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Premium Quality</p>
                                                            <p className="text-sm text-slate-600">Made with high-quality {product.material || 'materials'} for lasting beauty</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="mt-1 p-1 bg-amber-100 rounded-full flex-shrink-0">
                                                            <SparklesIcon className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Perfect for Any Occasion</p>
                                                            <p className="text-sm text-slate-600">Ideal for {product.utility || 'birthdays, weddings, anniversaries, and more'}</p>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="mt-1 p-1 bg-amber-100 rounded-full flex-shrink-0">
                                                            <TruckIcon className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Safe Delivery Guaranteed</p>
                                                            <p className="text-sm text-slate-600">Carefully packaged to arrive in perfect condition</p>
                                                        </div>
                                                    </li>
                                                </ul>
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
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                                                    <span className="ml-3 text-slate-600">Loading customer stories...</span>
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
                </div>


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
            </div>

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
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-amber-200/60 shadow-lg md:hidden">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Book Now Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBookNow}
                            disabled={isOutOfStock}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold transition-all text-sm ${isOutOfStock
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30'
                                }`}
                        >
                            <span>{isOutOfStock ? 'Out of Stock' : 'BOOK NOW'}</span>
                        </motion.button>

                        {/* Contact Us Button */}
                        <motion.a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold transition-all text-sm bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                            <span>WhatsApp</span>
                        </motion.a>

                        {/* Call Button (replacing share) */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(`tel:${selectedCityData?.contactNumber || '+917739873442'}`, '_self')}
                            className="p-3 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors flex-shrink-0"
                        >
                            <PhoneIcon className="h-5 w-5 text-slate-600" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Add bottom padding to prevent content from being hidden behind sticky buttons - Mobile Only */}
            <div className="h-16 md:hidden"></div>

            {/* Add-ons Selection Modal */}
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
                            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 z-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold">Enhance Your Order</h3>
                                        <p className="text-amber-50 text-sm mt-1">Select optional add-ons for a perfect celebration</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddonsModal(false)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                                {addonsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                                            <p className="mt-4 text-gray-600">Loading add-ons...</p>
                                        </div>
                                    </div>
                                ) : !addons || addons.length === 0 ? (
                                    <div className="text-center py-12">
                                        <GiftIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-900 font-semibold mb-2">No add-ons available</p>
                                        <p className="text-gray-600 text-sm">You can proceed directly to checkout</p>
                                        <p className="text-xs text-gray-400 mt-2">Loaded: {addons ? addons.length : 0} add-ons</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 mb-2">Available add-ons: {addons.length}</p>
                                        {addons.map((addon) => {
                                            const isSelected = selectedAddons.find(a => a.addonId === addon._id);
                                            return (
                                                <motion.div
                                                    key={addon._id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${isSelected
                                                        ? 'border-amber-500 bg-amber-50'
                                                        : 'border-gray-200 hover:border-amber-300 bg-white'
                                                        }`}
                                                    onClick={() => handleAddonToggle(addon)}
                                                >
                                                    <div className="flex gap-4">
                                                        {/* Image */}
                                                        {addon.image && (
                                                            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
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
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                                                                    <p className="text-lg font-bold text-amber-600 mt-2">₹{addon.price}</p>
                                                                </div>

                                                                {/* Checkbox */}
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-2 flex-shrink-0 ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
                                                                    }`}>
                                                                    {isSelected && (
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                                    <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAddonQuantityChange(addon._id, isSelected.quantity - 1);
                                                                            }}
                                                                            className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="w-12 text-center font-semibold">{isSelected.quantity}</span>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAddonQuantityChange(addon._id, isSelected.quantity + 1);
                                                                            }}
                                                                            className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-colors"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>

                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                                {selectedAddons.length > 0 && (
                                    <div className="mb-4 p-4 bg-amber-50 rounded-xl">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-600">Product Total:</span>
                                            <span className="font-semibold">₹{(product.price * quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-600">Add-ons Total:</span>
                                            <span className="font-semibold text-amber-600">₹{calculateAddonsTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-amber-200">
                                            <span>Grand Total:</span>
                                            <span className="text-amber-600">₹{((product.price * quantity) + calculateAddonsTotal()).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    {addons && addons.length > 0 ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedAddons([]);
                                                    setShowAddonsModal(false);
                                                    navigate('/checkout', { state: { product, quantity, addons: [] } });
                                                }}
                                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                            >
                                                Skip Add-ons
                                            </button>
                                            <button
                                                onClick={handleProceedToCheckout}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                                            >
                                                {selectedAddons.length > 0 ? 'Continue' : 'Proceed to Checkout'}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setShowAddonsModal(false);
                                                navigate('/checkout', { state: { product, quantity, addons: [] } });
                                            }}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                                        >
                                            Proceed to Checkout
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default ProductView;