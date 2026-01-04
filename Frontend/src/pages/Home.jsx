import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories/Categories';
import BirthdaySubcategories from '../components/BirthdaySubcategories';
import WeeklyBestsellers from '../components/Products/WeeklyBestsellers';
import MostLoved from '../components/Products/MostLoved';
import Testimonials from '../components/Testimonials';
import InfoSection from '../components/Info';
import SEO from '../components/SEO/SEO';
import InternalLinking from '../components/SEO/InternalLinking';
import VideoSection from '../components/Video/VideoSection';
import VideoGallery from '../components/Video/VideoGallery';

export default function Home() {
  return (
    <>
      <SEO
        title="TodayMyDream - Complete Birthday & Wedding Decoration Services"
        description="Book premium decoration services for birthdays, weddings, anniversaries and corporate events. Balloons, banners, lights, party props, and celebration supplies for every special event. Free shipping on orders over ₹999."
        keywords="birthday decoration materials, wedding decoration supplies, anniversary celebration items, party balloons, banners, lights, celebration props, decoration materials online, party supplies India, event decoration, celebration materials, birthday party supplies, wedding decor items, anniversary party decorations, baby shower decorations, venue decoration, party planning supplies"
        url="https://todaymydream.com/"
        image="/hero-image.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "TodayMyDream",
          "alternateName": ["TodayMyDream Decoration", "Celebration Materials", "Party Supplies"],
          "url": "https://todaymydream.com",
          "description": "Premium decoration materials and celebration supplies for birthdays, weddings, anniversaries, and all special events.",
          "brand": {
            "@type": "Brand",
            "name": "TodayMyDream",
            "alternateName": "TodayMyDream",
            "logo": "https://todaymydream.com/TodayMyDream.png",
            "slogan": "Celebration Made Beautiful with TodayMyDream"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://todaymydream.com/services?search={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://www.facebook.com/todaymydream",
            "https://www.instagram.com/todaymydream",
            "https://twitter.com/todaymydream"
          ]
        }}
      />
      <div>
        {/* Hero Section with SEO-optimized content */}
        <section aria-label="Hero Section">
          <Hero />
        </section>

        {/* Categories Section */}
        <section aria-label="Decoration Categories">
          <Categories />
        </section>

        {/* Birthday Subcategories */}
        <section aria-label="Birthday Decoration Ideas">
          <BirthdaySubcategories />
        </section>

        {/* Weekly Bestsellers */}
        <section aria-label="Popular Decoration Materials">
          <WeeklyBestsellers />
        </section>

        {/* Most Loved Products */}
        <section aria-label="Customer Favorites">
          <MostLoved />
        </section>

        {/* Video Reviews Section */}
        <section aria-label="Customer Video Reviews">
          <VideoSection
            title="Customer Reviews"
            subtitle="See what our customers say about our decoration services"
            category="review"
            limit={4}
            showViewAll={true}
            className="bg-gray-50"
          />
        </section>

        {/* Our Work Videos Section */}
        <section aria-label="Our Work Showcase">
          <VideoSection
            title="Our Work"
            subtitle="Watch our beautiful decoration setups and transformations"
            category="work"
            limit={4}
            showViewAll={true}
          />
        </section>

        {/* Video Gallery - All Videos */}
        <section aria-label="Video Gallery">
          <VideoGallery
            title="Our Video Collection"
            subtitle="Explore all our videos organized by category"
            className="bg-gradient-to-br from-gray-50 via-white to-purple-50/30"
          />
        </section>

        {/* Testimonials */}
        <section aria-label="Customer Reviews">
          <Testimonials />
        </section>

        {/* Info Section */}
        <section aria-label="About Our Services">
          <InfoSection />
        </section>

        {/* Internal Linking */}
        <section aria-label="Explore More">
          <InternalLinking type="general" />
        </section>

        {/* Video Gallery - Complete Video Collection */}
        <section aria-label="Complete Video Gallery">
          <VideoGallery
            title="Complete Video Gallery"
            subtitle="Browse through all our videos - customer reviews, our work showcases, testimonials, and demo videos"
            className="bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30"
          />
        </section>
      </div>
    </>
  );
} 