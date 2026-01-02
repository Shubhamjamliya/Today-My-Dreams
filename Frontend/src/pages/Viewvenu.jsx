import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Star, IndianRupee, ExternalLink, X, Building2, Wifi, Car, Utensils, Music, Camera, Shield, CheckCircle, Calendar, Clock3, Home, FileText, ChefHat, Bed, Settings, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import config from '../config/config';
import VenuePage from './Venupage';

const ViewVenue = () => {
    const { venueId } = useParams();
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [fullscreenImageIndex, setFullscreenImageIndex] = useState(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    // Function to track seller view
    const trackSellerView = async (sellerId) => {
        try {
            await fetch(`${config.API_URLS.SELLER}/${sellerId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            // Error tracking seller view
            // Don't show error to user as this is background tracking
        }
    };

    useEffect(() => {
        const fetchVenueData = async () => {
            if (!venueId) return;

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${config.API_URLS.SELLER}/${venueId}`);
                
                if (!response.ok) {
                    throw new Error('Venue not found. The link may be incorrect or the venue is no longer available.');
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch venue');
                }

                const venueData = data.seller;

                if (!venueData || !venueData._id) {
                    throw new Error('Received an invalid or empty venue object from the server.');
                }

                if (!venueData.approved || venueData.blocked) {
                    throw new Error('This venue is not available for viewing.');
                }

                setVenue(venueData);

                // Track view for this seller
                await trackSellerView(venueId);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVenueData();
    }, [venueId]);

    // Keyboard navigation for fullscreen image viewer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (fullscreenImageIndex === null || !venue?.images?.length) return;
            
            switch (e.key) {
                case 'Escape':
                    setFullscreenImageIndex(null);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setFullscreenImageIndex(prev => 
                        prev > 0 ? prev - 1 : venue.images.length - 1
                    );
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setFullscreenImageIndex(prev => 
                        prev < venue.images.length - 1 ? prev + 1 : 0
                    );
                    break;
            }
        };

        if (fullscreenImageIndex !== null) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [fullscreenImageIndex, venue?.images?.length]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50/50">
                <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !venue) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center bg-amber-50/50 p-4">
                <h2 className="text-2xl font-serif text-slate-800">Oops! Something Went Wrong.</h2>
                <p className="text-slate-600 mt-2">{error || 'We couldn’t find the venue you’re looking for.'}</p>
            </div>
        );
    }

    const safeVenue = {
        businessName: venue.businessName || 'Unnamed Venue',
        businessType: venue.businessType || 'Event Space',
        location: venue.location || venue.address || 'Location not specified',
        maxPersonsAllowed: venue.maxPersonsAllowed || 'N/A',
        startingPrice: venue.startingPrice || null,
        description: venue.description || `An excellent choice for your next ${venue.businessType || 'event'}. Contact us for more details.`,
        phone: venue.phone,
        email: venue.email,
        websiteLink: venue.websiteLink,
        amenity: venue.amenity || [],
        totalHalls: venue.totalHalls || 1,
        enquiryDetails: venue.enquiryDetails || '',
        bookingOpens: venue.bookingOpens || '',
        workingTimes: venue.workingTimes || '',
        workingDates: venue.workingDates || '',
        foodType: venue.foodType || [],
        roomsAvailable: venue.roomsAvailable || 1,
        bookingPolicy: venue.bookingPolicy || '',
        additionalFeatures: venue.additionalFeatures || [],
        included: venue.included || [],
        excluded: venue.excluded || [],
        faq: venue.faq || [],
        images: venue.images && venue.images.length > 0 ? venue.images : [{ url: '/placeholder-image.jpg' }]
    };

    const selectedImage = safeVenue.images[selectedImageIndex];

    // Icon mapping functions (unchanged)
    const getAmenityIcon = (amenity) => {
        const amenityLower = amenity.toLowerCase();
        if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi className="w-5 h-5" />;
        if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="w-5 h-5" />;
        if (amenityLower.includes('catering') || amenityLower.includes('food')) return <Utensils className="w-5 h-5" />;
        if (amenityLower.includes('music') || amenityLower.includes('dj') || amenityLower.includes('sound')) return <Music className="w-5 h-5" />;
        if (amenityLower.includes('photo') || amenityLower.includes('camera')) return <Camera className="w-5 h-5" />;
        if (amenityLower.includes('security') || amenityLower.includes('safe')) return <Shield className="w-5 h-5" />;
        if (amenityLower.includes('ac') || amenityLower.includes('air conditioning')) return <CheckCircle className="w-5 h-5" />;
        return <CheckCircle className="w-5 h-5" />;
    };

    const getFoodTypeIcon = (foodType) => {
        const foodLower = foodType.toLowerCase();
        if (foodLower.includes('vegetarian') || foodLower.includes('veg')) return <ChefHat className="w-5 h-5" />;
        if (foodLower.includes('non-vegetarian') || foodLower.includes('non veg') || foodLower.includes('nonveg')) return <Utensils className="w-5 h-5" />;
        if (foodLower.includes('jain')) return <Shield className="w-5 h-5" />;
        if (foodLower.includes('continental') || foodLower.includes('italian') || foodLower.includes('chinese')) return <Settings className="w-5 h-5" />;
        return <ChefHat className="w-5 h-5" />;
    };

    const getFeatureIcon = (feature) => {
        const featureLower = feature.toLowerCase();
        if (featureLower.includes('parking') || featureLower.includes('valet')) return <Car className="w-5 h-5" />;
        if (featureLower.includes('bridal') || featureLower.includes('room')) return <Home className="w-5 h-5" />;
        if (featureLower.includes('stage') || featureLower.includes('setup')) return <Settings className="w-5 h-5" />;
        if (featureLower.includes('green') || featureLower.includes('dressing')) return <Bed className="w-5 h-5" />;
        return <CheckCircle className="w-5 h-5" />;
    };

    return (
        <div
            className="h-fit bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 font-sans"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        >
            <SEO
                title={`${safeVenue.businessName} | ${safeVenue.businessType}`}
                description={`Book ${safeVenue.businessName} in ${safeVenue.location} for your next event.`}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 lg:mb-8"
                >



{/* Photo Gallery Section */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="bg-white rounded-xl shadow-md overflow-hidden mb-4"
>
  {/* Main Large Photo */}
  <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden">
    <img
      src={selectedImage.url}
   
      className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
      onClick={() => setFullscreenImageIndex(selectedImageIndex)}
    />
    
    {/* Image Counter Overlay */}
    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
      {selectedImageIndex + 1} / {safeVenue.images.length}
    </div>
    
    {/* Navigation Arrows for Main Image */}
    {safeVenue.images.length > 1 && (
      <>
        <button
          onClick={() => setSelectedImageIndex(prev => 
            prev > 0 ? prev - 1 : safeVenue.images.length - 1
          )}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setSelectedImageIndex(prev => 
            prev < safeVenue.images.length - 1 ? prev + 1 : 0
          )}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <ChevronRight size={20} />
        </button>
      </>
    )}
  </div>
  
  {/* Thumbnails */}
  {safeVenue.images.length > 1 && (
    <div className="p-3">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {safeVenue.images.map((image, index) => (
          <div
            key={index}
            className={`aspect-square rounded-md overflow-hidden cursor-pointer ring-2 ring-offset-1 transition-all ${
              selectedImageIndex === index
                ? "ring-amber-500"
                : "ring-transparent hover:ring-amber-300"
            }`}
            onClick={() => setSelectedImageIndex(index)}
          >
            <img
              src={image.url}
          
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )}
</motion.div>


                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 mb-3">
                                <Building2 className="w-4 h-4 mr-2" />
                                {safeVenue.businessType}
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">{safeVenue.businessName}</h1>
                            <p className="text-lg text-slate-600 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-amber-500" />
                                {safeVenue.location}
                            </p>
                        </div>
                        <div className="flex items-center gap-6 mt-4 lg:mt-0">
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
                                    <Star className="text-amber-500 fill-amber-500" size={24} />
                                    4.8
                                </div>
                                <p className="text-sm text-slate-500">Rating</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{safeVenue.maxPersonsAllowed}</div>
                                <p className="text-sm text-slate-500">Max Guests</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{safeVenue.totalHalls}</div>
                                <p className="text-sm text-slate-500">Halls</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-start">
                    
                    {/* Main Content Column (Left) */}
                    <motion.main
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-3 space-y-4 lg:space-y-8"
                    >
                        {/* Description Section - Premium Enhanced */}
                        <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 rounded-2xl shadow-2xl p-5 lg:p-8 border-2 border-amber-200/50">
                            <div className="flex items-center gap-3 mb-4 lg:mb-6">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                    <Building2 className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">About This Venue</h2>
                            </div>
                            
                            {/* Premium Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                                <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
                                <span className="text-sm font-bold">Premium Venue</span>
                            </div>

                            <div className="text-slate-700 leading-relaxed text-base lg:text-lg">
                                {(() => {
                                    const descriptionParagraphs = safeVenue.description.split('\n').filter(line => line.trim());
                                    const shouldShowReadMore = descriptionParagraphs.length > 1;
                                    const displayParagraphs = isDescriptionExpanded || !shouldShowReadMore 
                                        ? descriptionParagraphs 
                                        : [descriptionParagraphs[0]];
                                    
                                    return (
                                        <>
                                            {displayParagraphs.map((line, index) => (
                                                <p key={index} className="mb-4 last:mb-0 text-slate-700">{line}</p>
                                            ))}
                                            {shouldShowReadMore && (
                                                <motion.button
                                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                                                    <motion.span
                                                        animate={{ rotate: isDescriptionExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ChevronDown className="w-5 h-5" />
                                                    </motion.span>
                                                </motion.button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Venue Highlights */}
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-md border border-amber-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <Star className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900">4.8</p>
                                            <p className="text-xs text-slate-600">Average Rating</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900">100%</p>
                                            <p className="text-xs text-slate-600">Verified Venue</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-md border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900">500+</p>
                                            <p className="text-xs text-slate-600">Events Hosted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Venue Details Cards */}
                        <div className="space-y-4 lg:space-y-6">
                            {(safeVenue.bookingOpens || safeVenue.workingTimes || safeVenue.workingDates) && (
                                <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-indigo-200/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Booking & Hours</h3>
                                    </div>
                                    <p className="text-slate-600 mb-4 text-sm">Plan your event with our flexible scheduling</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {safeVenue.bookingOpens && (
                                            <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock3 className="w-5 h-5 text-indigo-600" />
                                                    <p className="text-xs font-bold text-indigo-600 uppercase">Booking Opens</p>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900">{safeVenue.bookingOpens}</p>
                                            </div>
                                        )}
                                        {safeVenue.workingTimes && (
                                            <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock3 className="w-5 h-5 text-indigo-600" />
                                                    <p className="text-xs font-bold text-indigo-600 uppercase">Working Times</p>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900">{safeVenue.workingTimes}</p>
                                            </div>
                                        )}
                                        {safeVenue.workingDates && (
                                            <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                                    <p className="text-xs font-bold text-indigo-600 uppercase">Working Dates</p>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900">{safeVenue.workingDates}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                             {/* Premium Rooms & Capacity Card */}
                            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-purple-200/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                                        <Home className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">Venue Capacity</h3>
                                </div>
                                <p className="text-slate-600 mb-4 text-sm">Spacious facilities to accommodate your guests comfortably</p>
                                <div className="grid grid-cols-3 gap-3 lg:gap-4">
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 lg:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="text-2xl lg:text-4xl font-bold  mb-1">{safeVenue.totalHalls}</div>
                                        <p className="text-xs lg:text-sm  font-medium">Total Halls</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 lg:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="text-2xl lg:text-4xl font-bold text-white mb-1">{safeVenue.roomsAvailable}</div>
                                        <p className="text-xs lg:text-sm text-green-100 font-medium">Rooms</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 lg:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="text-2xl lg:text-4xl font-bold text-white mb-1">{safeVenue.maxPersonsAllowed}</div>
                                        <p className="text-xs lg:text-sm text-purple-100 font-medium">Max Guests</p>
                                    </div>
                                </div>
                            </div>
                            
                            {safeVenue.foodType && safeVenue.foodType.length > 0 && (
                                 <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-green-200/50">
                                     <div className="flex items-center gap-3 mb-4">
                                         <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
                                             <ChefHat className="w-6 h-6 text-white" />
                                         </div>
                                         <h3 className="text-2xl font-bold text-slate-900">Culinary Options</h3>
                                     </div>
                                     <p className="text-slate-600 mb-4 text-sm">Delicious cuisine to delight your guests</p>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                         {safeVenue.foodType.map((food, index) => (
                                             <motion.div 
                                                 key={index} 
                                                 className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-green-100 shadow-md hover:shadow-lg transition-all"
                                                 whileHover={{ scale: 1.02, y: -2 }}
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: index * 0.05 }}
                                             >
                                                 <div className="p-2 bg-green-100 rounded-lg text-green-600 flex-shrink-0">
                                                     {getFoodTypeIcon(food)}
                                                 </div>
                                                 <span className="text-base font-bold text-slate-900">{food}</span>
                                             </motion.div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                            {safeVenue.additionalFeatures && safeVenue.additionalFeatures.length > 0 && (
                                 <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-teal-200/50">
                                     <div className="flex items-center gap-3 mb-4">
                                         <div className="p-2  rounded-lg shadow-lg">
                                             <Settings className="w-6 h-6"   />
                                         </div>
                                         <h3 className="text-2xl font-bold text-slate-900">Premium Features</h3>
                                     </div>
                                     <p className="text-slate-600 mb-4 text-sm">Exclusive amenities that set us apart</p>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                         {safeVenue.additionalFeatures.map((feature, index) => (
                                             <motion.div 
                                                 key={index} 
                                                 className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-teal-100 shadow-md hover:shadow-lg transition-all"
                                                 whileHover={{ scale: 1.02, y: -2 }}
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: index * 0.05 }}
                                             >
                                                 <div className="p-2 bg-purple-100 rounded-lg text-purple-600 flex-shrink-0">
                                                     {getFeatureIcon(feature)}
                                                 </div>
                                                 <span className="text-base font-bold text-slate-900">{feature}</span>
                                             </motion.div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                            {safeVenue.bookingPolicy && (
                                 <div className="bg-gradient-to-br from-white to-amber-50/40 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-amber-200/60">
                                     <div className="flex items-center gap-3 mb-4">
                                         <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                             <FileText className="w-6 h-6 text-white" />
                                         </div>
                                         <h3 className="text-2xl font-bold text-slate-900">Booking Policy</h3>
                                     </div>
                                     <p className="text-slate-600 mb-4 text-sm">Please review our terms and conditions before booking</p>
                                     <div className="bg-white rounded-xl p-5 lg:p-6 border-2 border-amber-100 shadow-md">
                                         <div className="space-y-3">
                                             {safeVenue.bookingPolicy.split('\n').filter(line => line.trim()).map((line, index) => (
                                                 <motion.div 
                                                     key={index} 
                                                     className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border-l-4 border-amber-500"
                                                     initial={{ opacity: 0, x: -10 }}
                                                     animate={{ opacity: 1, x: 0 }}
                                                     transition={{ delay: index * 0.05 }}
                                                 >
                                                     <div className="p-1 bg-amber-500 rounded-full flex-shrink-0 mt-1">
                                                         <Shield className="w-3 h-3 text-white" />
                                                     </div>
                                                     <p className="text-slate-700 leading-relaxed font-medium">{line}</p>
                                                 </motion.div>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                             )}

                            {/* What's Included */}
                            {safeVenue.included && safeVenue.included.length > 0 && (
                                 <div className="bg-white rounded-2xl shadow-xl p-5 lg:p-6">
                                     <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                         <CheckCircle className="w-6 h-6 text-green-500" /> What's Included
                                     </h3>
                                     <div className="space-y-2">
                                         {safeVenue.included.filter(item => item && item.trim()).map((item, index) => (
                                             <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                                                 <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                 <span className="text-sm font-medium text-slate-700 leading-relaxed">{item}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                            {/* What's Not Included */}
                            {safeVenue.excluded && safeVenue.excluded.length > 0 && (
                                 <div className="bg-white rounded-2xl shadow-xl p-5 lg:p-6">
                                     <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                         <X className="w-6 h-6 text-red-500" /> What's Not Included
                                     </h3>
                                     <div className="space-y-2">
                                         {safeVenue.excluded.filter(item => item && item.trim()).map((item, index) => (
                                             <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                                 <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                 <span className="text-sm font-medium text-slate-700 leading-relaxed">{item}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}

                            {/* Premium FAQ Section - Accordion Style */}
                            {safeVenue.faq && safeVenue.faq.length > 0 && (
                                 <div className="bg-gradient-to-br from-white to-indigo-50/40 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-indigo-200/60">
                                     <div className="flex items-center gap-3 mb-4">
                                         <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                             <FileText className="w-6 h-6 text-white" />
                                         </div>
                                         <h3 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
                                     </div>
                                     <p className="text-slate-600 mb-5 text-sm">Find answers to common questions about our venue</p>
                                     <div className="space-y-4">
                                         {safeVenue.faq.map((faqItem, index) => (
                                             <motion.div 
                                                 key={index} 
                                                 className="bg-white border-2 border-indigo-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: index * 0.05 }}
                                                 whileHover={{ scale: 1.01 }}
                                             >
                                                 <button
                                                     onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                                     className={`w-full flex items-center justify-between p-4 lg:p-5 transition-all text-left ${
                                                         openFaqIndex === index 
                                                             ? 'bg-gradient-to-r from-indigo-50 to-purple-50' 
                                                             : 'bg-white hover:bg-indigo-50/50'
                                                     }`}
                                                 >
                                                     <div className="flex items-start gap-3 flex-1">
                                                         <div className={`px-3 py-1 rounded-lg flex-shrink-0 font-bold text-sm ${
                                                             openFaqIndex === index
                                                                 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                                                 : 'bg-indigo-100 text-indigo-700'
                                                         }`}>
                                                             Q{index + 1}
                                                         </div>
                                                         <span className="font-bold text-slate-900 text-base lg:text-lg">{faqItem.question}</span>
                                                     </div>
                                                     <motion.div
                                                         animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                                                         transition={{ duration: 0.3 }}
                                                         className="flex-shrink-0 ml-3"
                                                     >
                                                         <div className={`p-1.5 rounded-full ${
                                                             openFaqIndex === index
                                                                 ? 'bg-indigo-500 text-white'
                                                                 : 'bg-indigo-100 text-indigo-600'
                                                         }`}>
                                                             <ChevronDown className="w-5 h-5" />
                                                         </div>
                                                     </motion.div>
                                                 </button>
                                                 <AnimatePresence>
                                                     {openFaqIndex === index && (
                                                         <motion.div
                                                             initial={{ height: 0, opacity: 0 }}
                                                             animate={{ height: "auto", opacity: 1 }}
                                                             exit={{ height: 0, opacity: 0 }}
                                                             transition={{ duration: 0.3 }}
                                                             className="overflow-hidden"
                                                         >
                                                             <div className="p-4 lg:p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-t-2 border-indigo-100">
                                                                 <div className="flex items-start gap-3">
                                                                     <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex-shrink-0 mt-0.5">
                                                                         <CheckCircle className="w-4 h-4 text-white" />
                                                                     </div>
                                                                     <p className="text-slate-700 leading-relaxed text-base font-medium">{faqItem.answer}</p>
                                                                 </div>
                                                             </div>
                                                         </motion.div>
                                                     )}
                                                 </AnimatePresence>
                                             </motion.div>
                                         ))}
                                     </div>
                                 </div>
                             )}


                                {/* Sticky Sidebar (Right) */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="block md:hidden lg:col-span-2 lg:sticky lg:top-8 space-y-4 lg:space-y-6"
                    >
                        {/* Premium Pricing Card - Mobile */}
                        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-2xl p-5 lg:p-6 text-white border-2 border-amber-300/50">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <IndianRupee className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold">Pricing</h3>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                                <p className="text-sm text-amber-100 mb-1">Starting from</p>
                                <p className="text-3xl lg:text-4xl font-bold">
                                    {safeVenue.startingPrice ? `₹${safeVenue.startingPrice.toLocaleString('en-IN')}` : 'Custom Quote'}
                                </p>
                                <p className="text-xs text-amber-100 mt-1">Per event (terms apply)</p>
                            </div>
                            {safeVenue.websiteLink && (
                                <motion.a
                                    href={safeVenue.websiteLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-amber-600 bg-white hover:bg-amber-50 shadow-xl hover:shadow-2xl transition-all"
                                >
                                    Book This Venue <ExternalLink size={20} />
                                </motion.a>
                            )}
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-xs text-amber-100 text-center">💎 Premium venue with exclusive amenities</p>
                            </div>
                        </div>

                        {/* Premium Amenities Card - Mobile */}
                        {safeVenue.amenity && safeVenue.amenity.length > 0 && (
                            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-blue-200/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                                        <CheckCircle className="w-6 h-6 " />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Premium Amenities</h3>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">Everything you need for a perfect event</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {safeVenue.amenity.map((amenity, index) => (
                                        <motion.div 
                                            key={index} 
                                            className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all"
                                            whileHover={{ x: 5 }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="p-1.5 bg-amber-100 rounded-md text-amber-600 flex-shrink-0">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{amenity}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

   {/* Contact Information */}
   {(safeVenue.phone || safeVenue.email) && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="hidden md:block bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-5 sm:p-6 text-white"
  >
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <Phone className="w-5 h-5" />
      Get in Touch
    </h2>

    {/* Buttons */}
    <div className="grid grid-cols-2 gap-3">
      {/* WhatsApp */}
      {safeVenue.phone && (
        <motion.a
          href={`https://wa.me/${safeVenue.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white shadow-md text-sm"
        >
          {/* Cleaner WhatsApp SVG Icon */}
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M16.75 13.96c.25.13.43.2.5.33.07.13.07.66-.03 1.39-.1.73-.55 1.34-1.12 1.52-.57.18-1.07.16-1.55.03-1.16-.3-2.12-.89-2.9-1.55a10.34 10.34 0 0 1-3.53-3.53c-.66-.78-1.25-1.74-1.55-2.9-.13-.48-.15-.98.03-1.55.18-.57.79-1.02 1.52-1.12.73-.1 1.26-.1 1.39-.03.13.07.2.25.33.5.13.25.43.98.5 1.13.07.15.07.33 0 .5-.13.17-.2.27-.38.45-.18.18-.38.4-.53.57-.15.17-.3.35-.15.68.2.43.95 1.63 2.1 2.78 1.15 1.15 2.35 1.9 2.78 2.1.33.15.5-.02.68-.15.17-.15.35-.3.57-.53.18-.18.28-.25.45-.38.17-.07.35-.07.5 0 .15.07.88.38 1.13.5zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          </svg>
          WhatsApp
        </motion.a>
      )}

      {/* Contact Button */}
      <motion.a
        href={safeVenue.phone ? `tel:${safeVenue.phone}` : `mailto:${safeVenue.email}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="hidden md:flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-emerald-600 hover:bg-gray-100 rounded-lg font-semibold shadow-md text-sm"
      >
        <Phone className="w-5 h-5" />
        Call Us
      </motion.a>
    </div>
  </motion.div>
)}
                        
                    </motion.aside>
                        </div>
                    </motion.main>

                    {/* Sticky Sidebar (Right) */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="hidden md:block lg:col-span-2 lg:sticky lg:top-8 space-y-4 lg:space-y-6"
                    >
                        {/* Premium Pricing Card */}
                        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-2xl p-5 lg:p-6 text-white border-2 border-amber-300/50">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <IndianRupee className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold">Pricing</h3>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                                <p className="text-sm text-amber-100 mb-1">Starting from</p>
                                <p className="text-3xl lg:text-4xl font-bold">
                                    {safeVenue.startingPrice ? `₹${safeVenue.startingPrice.toLocaleString('en-IN')}` : 'Custom Quote'}
                                </p>
                                <p className="text-xs text-amber-100 mt-1">Per event (terms apply)</p>
                            </div>
                            {safeVenue.websiteLink && (
                                <motion.a
                                    href={safeVenue.websiteLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-amber-600 bg-white hover:bg-amber-50 shadow-xl hover:shadow-2xl transition-all"
                                >
                                    Book This Venue <ExternalLink size={20} />
                                </motion.a>
                            )}
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-xs text-amber-100 text-center">💎 Premium venue with exclusive amenities</p>
                            </div>
                        </div>

                        {/* Premium Amenities Card */}
                        {safeVenue.amenity && safeVenue.amenity.length > 0 && (
                            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-2xl p-5 lg:p-6 border-2 border-blue-200/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Premium Amenities</h3>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">Everything you need for a perfect event</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {safeVenue.amenity.map((amenity, index) => (
                                        <motion.div 
                                            key={index} 
                                            className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all"
                                            whileHover={{ x: 5 }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="p-1.5 bg-amber-100 rounded-md text-amber-600 flex-shrink-0">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{amenity}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

   {/* Contact Information */}
   {(safeVenue.phone || safeVenue.email) && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="hidden md:block bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-5 sm:p-6 text-white"
  >
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <Phone className="w-5 h-5" />
      Get in Touch
    </h2>

    {/* Buttons */}
    <div className="grid grid-cols-2 gap-3">
      {/* WhatsApp */}
      {safeVenue.phone && (
        <motion.a
          href={`https://wa.me/${safeVenue.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white shadow-md text-sm"
        >
          {/* Cleaner WhatsApp SVG Icon */}
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M16.75 13.96c.25.13.43.2.5.33.07.13.07.66-.03 1.39-.1.73-.55 1.34-1.12 1.52-.57.18-1.07.16-1.55.03-1.16-.3-2.12-.89-2.9-1.55a10.34 10.34 0 0 1-3.53-3.53c-.66-.78-1.25-1.74-1.55-2.9-.13-.48-.15-.98.03-1.55.18-.57.79-1.02 1.52-1.12.73-.1 1.26-.1 1.39-.03.13.07.2.25.33.5.13.25.43.98.5 1.13.07.15.07.33 0 .5-.13.17-.2.27-.38.45-.18.18-.38.4-.53.57-.15.17-.3.35-.15.68.2.43.95 1.63 2.1 2.78 1.15 1.15 2.35 1.9 2.78 2.1.33.15.5-.02.68-.15.17-.15.35-.3.57-.53.18-.18.28-.25.45-.38.17-.07.35-.07.5 0 .15.07.88.38 1.13.5zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          </svg>
          WhatsApp
        </motion.a>
      )}

      {/* Contact Button */}
      <motion.a
        href={safeVenue.phone ? `tel:${safeVenue.phone}` : `mailto:${safeVenue.email}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="hidden md:flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-emerald-600 hover:bg-gray-100 rounded-lg font-semibold shadow-md text-sm"
      >
        <Phone className="w-5 h-5" />
        Call Us
      </motion.a>
    </div>
  </motion.div>
)}
                        
                    </motion.aside>
                </div>
            </div>

            {/* Fullscreen Image Modal */}
            <AnimatePresence>
                {fullscreenImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
                        onClick={() => setFullscreenImageIndex(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative max-w-6xl w-full px-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setFullscreenImageIndex(null)}
                                className="absolute -top-2 -right-2 z-10 bg-white text-slate-800 p-2 rounded-full hover:bg-slate-200 transition-all shadow-lg"
                            >
                                <X size={22} />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                {fullscreenImageIndex + 1} / {venue.images.length}
                            </div>

                            {/* Main Image */}
                            <img
                                src={venue.images[fullscreenImageIndex]?.url}
                              
                                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />

                            {/* Navigation Arrows */}
                            {venue.images.length > 1 && (
                                <>
                                    {/* Left Arrow */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFullscreenImageIndex(prev => 
                                                prev > 0 ? prev - 1 : venue.images.length - 1
                                            );
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    {/* Right Arrow */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFullscreenImageIndex(prev => 
                                                prev < venue.images.length - 1 ? prev + 1 : 0
                                            );
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Thumbnail Strip */}
                            {venue.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                                    <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                                        {venue.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullscreenImageIndex(index);
                                                }}
                                                className={`w-12 h-12 rounded-md overflow-hidden transition-all ${
                                                    fullscreenImageIndex === index
                                                        ? 'ring-2 ring-white scale-110'
                                                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                                                }`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Floating Contact Footer */}
            {(safeVenue.phone || safeVenue.email) && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="md:hidden fixed bottom-0 left-0 right-0 z-50   shadow-2xl backdrop-blur-xl"
                >
                    <div className="container mx-auto px-4 py-6">
                     
                        {/* Action Buttons - Two Column Layout */}
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                            {/* WhatsApp Button */}
                            {safeVenue.phone && (
                                <motion.a
                                    href={`https://wa.me/${safeVenue.phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center justify-center gap-3">
                                        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                                            <path d="M16.75 13.96c.25.13.43.2.5.33.07.13.07.66-.03 1.39-.1.73-.55 1.34-1.12 1.52-.57.18-1.07.16-1.55.03-1.16-.3-2.12-.89-2.9-1.55a10.34 10.34 0 0 1-3.53-3.53c-.66-.78-1.25-1.74-1.55-2.9-.13-.48-.15-.98.03-1.55.18-.57.79-1.02 1.52-1.12.73-.1 1.26-.1 1.39-.03.13.07.2.25.33.5.13.25.43.98.5 1.13.07.15.07.33 0 .5-.13.17-.2.27-.38.45-.18.18-.38.4-.53.57-.15.17-.3.35-.15.68.2.43.95 1.63 2.1 2.78 1.15 1.15 2.35 1.9 2.78 2.1.33.15.5-.02.68-.15.17-.15.35-.3.57-.53.18-.18.28-.25.45-.38.17-.07.35-.07.5 0 .15.07.88.38 1.13.5zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                                        </svg>
                                        <span className="text-sm font-bold">WhatsApp</span>
                                    </div>
                                </motion.a>
                            )}

                            {/* Call/Email Button */}
                            <motion.a
                                href={safeVenue.phone ? `tel:${safeVenue.phone}` : `mailto:${safeVenue.email}`}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <div className="relative flex items-center justify-center gap-3">
                                    <Phone className="w-3 h-3" />
                                    <span className="text-sm font-bold">
                                        {safeVenue.phone ? 'Call Now' : 'Email Us'}
                                    </span>
                                </div>
                            </motion.a>
                        </div>

                   
                    </div>
                </motion.div>
            )}
            <VenuePage/>
        </div>
    );
};

// Helper components for better organization
const DetailPill = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
        <Icon className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <p className="text-sm text-slate-600">{value}</p>
        </div>
    </div>
);

const CapacityPill = ({ label, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className={`text-center p-4 rounded-lg ${colorClasses[color] || 'bg-slate-50'}`}>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-sm text-slate-600">{label}</p>
        </div>
    );
};

export default ViewVenue;