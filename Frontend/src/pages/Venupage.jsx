import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Star, Search, ArrowRight, IndianRupee, Building2, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { VenueSkeleton } from "../components/Loader/Skeleton";
import config from '../config/config';
import SEO from '../components/SEO/SEO';

// --- Background Shapes ---
const BackgroundShapes = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div
      initial={{ opacity: 0, y: 100, x: -100, rotate: -45 }}
      animate={{ opacity: 0.05, y: -100, x: 50, rotate: 15 }}
      transition={{ duration: 60, repeat: Infinity, repeatType: "reverse" }}
      className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-300 rounded-full"
    />
    <motion.div
      initial={{ opacity: 0, y: -100, x: 100, rotate: 45 }}
      animate={{ opacity: 0.05, y: 100, x: -50, rotate: -15 }}
      transition={{ duration: 70, repeat: Infinity, repeatType: "reverse" }}
      className="absolute -top-40 -right-40 w-96 h-96 bg-amber-300 rounded-full"
    />
  </div>
);

// --- Premium VenueCard with Price & Details ---
const VenueCard = ({ venue }) => {
  const hasPrice = venue.price && venue.price > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg shadow-amber-200/50 overflow-hidden 
                 border border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-xl group"
    >
      {/* Image section with badges */}
      <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Location Badge */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg text-[10px] md:text-xs font-bold"
          >
            <MapPin size={12} className="md:hidden" />
            <span className="line-clamp-1">{venue.location}</span>
          </motion.div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <div className="flex items-center gap-0.5 md:gap-1 px-2 py-1 md:px-2.5 md:py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <Star size={12} className="text-amber-500 fill-amber-500 md:w-3.5 md:h-3.5" />
            <span className="text-[10px] md:text-xs font-bold text-slate-900">{venue.rating || "4.8"}</span>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-2.5 md:p-4 flex flex-col flex-grow">
        {/* Venue Name */}
        <h3 className="text-sm md:text-base lg:text-lg font-bold text-slate-900 leading-tight line-clamp-2 mb-2 md:mb-2.5 group-hover:text-amber-600 transition-colors min-h-[2.5rem] md:min-h-0">
          {venue.name}
        </h3>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent my-2 md:my-2.5" />

        {/* Price & CTA Row */}
        <div className="flex items-center justify-between gap-1.5 md:gap-2 mt-auto">
          {/* Price */}
          <div className="flex flex-col">
            {hasPrice ? (
              <>
                <div className="flex items-center gap-0.5 md:gap-1">
                  <IndianRupee size={14} className="text-amber-600 md:w-4 md:h-4" />
                  <span className="text-base md:text-lg lg:text-xl font-bold text-slate-900">
                    {venue.price?.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs text-slate-500 font-medium">Starting price</span>
              </>
            ) : (
              <span className="text-xs md:text-sm font-semibold text-amber-600">Contact us</span>
            )}
          </div>

          {/* View Details Button */}
          <Link
            to={`/venues/${venue.id}`}
            className="flex items-center justify-center gap-1 md:gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[11px] md:text-xs lg:text-sm 
                       bg-gradient-to-r from-amber-500 to-orange-500 text-white 
                       hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg
                       transition-all duration-300 group-hover:scale-105 whitespace-nowrap"
          >
            <span>View</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform md:w-3.5 md:h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- VenuePage ---
const VenuePage = () => {
  const [selectedState, setSelectedState] = useState("All India");
  const [searchTerm, setSearchTerm] = useState("");
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${config.API_URLS.SELLER}/venues`
        );
        if (!response.ok) {
          throw new Error("Could not connect to the server.");
        }
        const data = await response.json();

        // Filter sellers first, then map the result
        const mappedVenues = data.sellers
          .filter(
            (seller) => seller.approved === true && seller.blocked === false
          )
          .map((seller) => ({
            id: seller._id,
            name: seller.businessName || "Exquisite Event Space",
            location:
              seller.location?.split(",").pop().trim() || seller.address?.split(",").pop().trim() || "India",
            state: seller.state || "",
            image:
              seller.images && seller.images.length > 0
                ? seller.images[0].url
                : "https://images.unsplash.com/photo-1616587930779-d227a92ad693?q=80&w=800&auto=format&fit=crop",
            capacity: seller.maxPersonsAllowed || null,
            rating: seller.rating || 4.8,
            price: seller.startingPrice || seller.pstartingPrice || null,
          }));

        setVenues(mappedVenues);
      } catch (err) {
        setError("No venues available at the moment.");
        // Fetch error
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // Dynamically extract unique locations from fetched venues
  const availableLocations = useMemo(() => {
    const locations = venues
      .map((venue) => venue.location)
      .filter((location) => location && location.trim() !== "")
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    return ["All India", ...locations];
  }, [venues]);

  const filteredVenues = useMemo(() => {
    return venues
      .filter(
        (venue) =>
          selectedState === "All India" ||
          venue.location?.toLowerCase().includes(selectedState.toLowerCase()) ||
          venue.state?.toLowerCase() === selectedState.toLowerCase()
      )
      .filter(
        (venue) =>
          venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.location?.toLowerCase().includes(searchTerm.toLowerCase()) || // ✅ location
          venue.address?.toLowerCase().includes(searchTerm.toLowerCase())     // ✅ address
      );
  }, [venues, selectedState, searchTerm]);


  return (
    <>
      <SEO
        title="Venue Decoration Services - Professional Event Styling | TodayMyDream"
        description="Professional venue decoration services for weddings, birthdays, anniversaries, and corporate events across India. Expert event styling, decoration materials, and venue transformation services."
        keywords="venue decoration services, event styling, wedding venue decoration, birthday party venue decoration, anniversary celebration venue, corporate event decoration, venue transformation, event decoration India, professional decoration services, venue styling experts, event planning decoration, celebration venue decoration"
        url="https://todaymydream.com/venues"
        image="/venue-hero.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "TodayMyDream Venue Decoration Services",
          "description": "Professional venue decoration services for weddings, birthdays, anniversaries, and corporate events across India.",
          "url": "https://todaymydream.com/venues",
          "telephone": "+91-XXXXXXXXXX",
          "email": "info@todaymydream.com",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN",
            "addressRegion": "India"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "28.6139",
            "longitude": "77.2090"
          },
          "areaServed": {
            "@type": "Country",
            "name": "India"
          },
          "serviceType": "Venue Decoration Services",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Venue Decoration Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Wedding Venue Decoration"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Birthday Party Venue Decoration"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Anniversary Celebration Venue Decoration"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Corporate Event Venue Decoration"
                }
              }
            ]
          },
          "sameAs": [
            "https://www.facebook.com/todaymydream",
            "https://www.instagram.com/todaymydream",
            "https://twitter.com/todaymydream"
          ]
        }}
      />
      <div className="min-h-screen font-sans relative bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-8 relative z-10">
          {/* Premium Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-10"
          >
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight mb-3 md:mb-4 bg-gradient-to-r from-slate-900 via-amber-900 to-slate-900 bg-clip-text"
            >
              Find Your Perfect Venue
            </motion.h1>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-4 md:mt-6"
            >
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="p-1.5 md:p-2 bg-amber-100 rounded-lg">
                  <Building2 size={16} className="text-amber-600 md:w-5 md:h-5" />
                </div>
                <div className="text-left">
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900">{venues.length}+</p>
                  <p className="text-[10px] md:text-xs lg:text-sm text-slate-600 font-medium">Premium Venues</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="p-1.5 md:p-2 bg-green-100 rounded-lg">
                  <Star size={16} className="text-green-600 fill-green-600 md:w-5 md:h-5" />
                </div>
                <div className="text-left">
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900">4.8+</p>
                  <p className="text-[10px] md:text-xs lg:text-sm text-slate-600 font-medium">Average Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                  <TrendingUp size={16} className="text-blue-600 md:w-5 md:h-5" />
                </div>
                <div className="text-left">
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900">100%</p>
                  <p className="text-[10px] md:text-xs lg:text-sm text-slate-600 font-medium">Verified</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Premium Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6 md:mb-8 sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-amber-100 p-3 md:p-5"
          >
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 max-w-4xl mx-auto">
              {/* Location Filter */}
              <div className="relative flex-1">
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 ml-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute top-1/2 left-3 md:left-4 -translate-y-1/2 text-amber-500"
                    size={16}
                  />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-white border-2 border-amber-200 rounded-lg md:rounded-xl shadow-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none transition-all hover:border-amber-300"
                  >
                    {availableLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Filter */}
              <div className="relative flex-1">
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 ml-1">
                  Search Venues
                </label>
                <div className="relative">
                  <Search
                    className="absolute top-1/2 left-3 md:left-4 -translate-y-1/2 text-amber-500"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search venue or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-white border-2 border-amber-200 rounded-lg md:rounded-xl shadow-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all hover:border-amber-300"
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            {!loading && (
              <div className="mt-3 md:mt-4 text-center">
                <p className="text-xs md:text-sm text-slate-600">
                  Showing <span className="font-bold text-amber-600">{filteredVenues.length}</span> {filteredVenues.length === 1 ? 'venue' : 'venues'}
                  {searchTerm && <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>}
                </p>
              </div>
            )}
          </motion.div>

          {/* Venues Grid */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 lg:gap-6"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <>
                  {[...Array(8)].map((_, i) => (
                    <VenueSkeleton key={i} />
                  ))}
                </>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="col-span-full text-center py-12 md:py-16"
                >
                  <div className="max-w-md mx-auto bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-6 md:p-8 border border-red-100">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <Building2 size={24} className="text-red-500 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1.5 md:mb-2">
                      No Venues Available
                    </h3>
                    <p className="text-sm md:text-base text-slate-600">
                      We're currently updating our venue listings. Please check back later.
                    </p>
                  </div>
                </motion.div>
              ) : filteredVenues.length > 0 ? (
                filteredVenues.map((venue, index) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="col-span-full text-center py-12 md:py-16"
                >
                  <div className="max-w-md mx-auto bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-6 md:p-8 border border-amber-100">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <Search size={24} className="text-amber-500 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1.5 md:mb-2">
                      No Venues Found
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-5">
                      We couldn't find any venues matching your search criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedState("All India");
                      }}
                      className="px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg md:rounded-xl font-semibold text-sm md:text-base hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                    >
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default VenuePage;