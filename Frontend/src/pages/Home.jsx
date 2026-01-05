import React, { Suspense } from 'react';
import Hero from '../components/Hero/Hero';
import SectionBanner from '../components/SectionBanner';
import Categories from '../components/Categories/Categories';
import BirthdaySubcategories from '../components/BirthdaySubcategories';
import CatCard from '../components/Catcard'; // Assuming index.js or default export
import VideoGallery from '../components/Video/VideoGallery';
import Testimonials from '../components/Testimonials/Testimonials';
import MissionVision from '../components/MissionVision/MissionVision';
import Offerpage from '../components/Hero/Offer';
import InfoSection from '../components/Info';
import Loader from '../components/Loader';

// Wrapper for suspended components not strictly necessary if pure imports, 
// but good if they are heavy internal renders.
// For Home page, let's render them directly.

const Home = () => {
  return (
    <main className="bg-white min-h-screen">
      {/* 1. Hero Full Width Carousel */}
      <Hero />

      {/* 2. Banner & Categories */}

      <Categories />

      {/* 3. Banner & Birthday Subcategories */}

      <BirthdaySubcategories />

      {/* 4. Banner & CatCard (Featured/Special) */}
      <SectionBanner
        title="Trending Themes"
        variant="light"
      />
      <CatCard />

      {/* 5. Banner & Video Gallery */}
      <SectionBanner
        title="Experience the Magic"
        subtitle="Watch real celebrations come to life."
        variant="primary"
      />
      <VideoGallery />

      {/* 6. Banner & Testimonials */}
      <SectionBanner
        title="Voices of Happiness"
        subtitle="Real stories from our cherished celebrations."
        variant="light"
      />
      <Testimonials />

      {/* 7. Banner & Mission Vision */}
      <SectionBanner
        title="Our Promise"
        variant="secondary"
      />
      <MissionVision />

      {/* 8. Banner & Offerpage */}
      <SectionBanner
        title="Exclusive Offers"
        subtitle="Grab the best deals for your upcoming events."
        variant="primary"
      />
      <Offerpage />

      {/* 9. Banner & Info Section */}
      <SectionBanner
        title="Did You Know?"
        variant="light"
      />
      <InfoSection />
    </main>
  );
};

export default Home;