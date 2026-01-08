import React, { Suspense, lazy } from 'react';
import Hero from '../components/Hero/Hero';
import SectionBanner from '../components/SectionBanner';
import Categories from '../components/Categories/Categories';
import Loader from '../components/Loader';
import SEO from '../components/SEO/SEO';
import { seoConfig } from '../config/seo';

// Lazy load heavy components below the fold
import BirthdaySubcategories from '../components/BirthdaySubcategories';
const CatCard = lazy(() => import('../components/Catcard'));
const VideoGallery = lazy(() => import('../components/Video/VideoGallery'));
const Testimonials = lazy(() => import('../components/Testimonials/Testimonials'));
const MissionVision = lazy(() => import('../components/MissionVision/MissionVision'));
const Offerpage = lazy(() => import('../components/Hero/Offer'));
const InfoSection = lazy(() => import('../components/Info'));
const VendorBanner = lazy(() => import('../components/VendorBanner'));
const TrendingThemesBanner = lazy(() => import('../components/TrendingThemesBanner'));

// Simple fallback loader for sections
const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
  </div>
);

const Home = () => {
  // Home page structured data with FAQ schema
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      seoConfig.home.structuredData,
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What decoration services does Today My Dream offer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Today My Dream offers premium decoration services for birthdays, weddings, anniversaries, baby showers, and all special celebrations. We provide balloons, banners, lights, party props, and complete venue decoration."
            }
          },
          {
            "@type": "Question",
            "name": "Do you deliver decoration materials across India?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we deliver decoration materials and supplies across major cities in India. Check our service areas for availability in your location."
            }
          },
          {
            "@type": "Question",
            "name": "Can I book decoration services online?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, you can easily book decoration services online through our website. Browse our catalog, select your preferred decorations, choose a date, and complete your booking."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO
        title={seoConfig.home.title}
        description={seoConfig.home.description}
        keywords={seoConfig.home.keywords}
        url={seoConfig.home.url}
        image={seoConfig.home.image}
        structuredData={homeStructuredData}
      />
      <main className="bg-white min-h-screen">
        {/* 1. Hero Full Width Carousel - Loaded Immediately */}
        <Hero />

        {/* 2. Categories - Loaded Immediately for SEO/UX */}
        <Categories />

        {/* 3. Banner & Birthday Subcategories */}
        <BirthdaySubcategories />

        {/* 4. Feature & Trending Group */}
        <Suspense fallback={<SectionLoader />}>
          <TrendingThemesBanner />
          <CatCard />
        </Suspense>

        {/* 5. Experience & Social Proof Group */}
        <Suspense fallback={<SectionLoader />}>
          <SectionBanner
            title="Experience the Magic"
            subtitle="Watch real celebrations come to life."
            variant="primary"
          />
          <VideoGallery />

          <SectionBanner
            title="Voices of Happiness"
            subtitle="Real stories from our cherished celebrations."
            variant="light"
          />
          <Testimonials />

          <SectionBanner
            title="Our Promise"
            variant="secondary"
          />
          <MissionVision />
        </Suspense>

        {/* 6. Footer Content Group */}
        <Suspense fallback={<SectionLoader />}>
          <SectionBanner
            title="Exclusive Offers"
            subtitle="Grab the best deals for your upcoming events."
            variant="primary"
          />
          <Offerpage />

          <VendorBanner />

          <SectionBanner
            title="Did You Know?"
            variant="light"
          />
          <InfoSection />
        </Suspense>
      </main>
    </>
  );
};

export default Home;