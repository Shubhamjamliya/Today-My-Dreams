import React from 'react';
import VideoGallery from '../components/Video/VideoGallery';
import SEO from '../components/SEO/SEO';

const Videos = () => {
  return (
    <>
      <SEO
        title="Videos - Decoryy | Customer Reviews & Our Work"
        description="Watch our customer reviews, work showcases, testimonials, and demo videos. See the quality of our decoration services through real customer experiences and our beautiful work transformations."
        keywords="decoration videos, customer reviews video, work showcase, decoration testimonials, party decoration demo, birthday decoration video, wedding decoration video, anniversary decoration video, decoration transformation, before after decoration"
        url="https://decoryy.com/videos"
        image="/videos-preview.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "VideoGallery",
          "name": "Decoryy Video Gallery",
          "description": "Collection of customer reviews, work showcases, and decoration demos",
          "url": "https://decoryy.com/videos",
          "publisher": {
            "@type": "Organization",
            "name": "Decoryy",
            "url": "https://decoryy.com"
          }
        }}
      />
      
      <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <VideoGallery 
          title="Our Video Collection" 
          subtitle="Explore our work, customer reviews, and decoration demos"
          className="py-8"
        />
      </div>
    </>
  );
};

export default Videos;
