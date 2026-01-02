import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags
}) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta tags
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update primary meta tags
    if (description) {
      updateMetaTag('description', description);
      updatePropertyTag('og:description', description);
      updatePropertyTag('twitter:description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    if (title) {
      updatePropertyTag('og:title', title);
      updatePropertyTag('twitter:title', title);
    }

    if (image) {
      updatePropertyTag('og:image', image);
      updatePropertyTag('twitter:image', image);
    }

    if (url) {
      updatePropertyTag('og:url', url);
      updatePropertyTag('twitter:url', url);
    }

    updatePropertyTag('og:type', type);

    // Update additional Open Graph tags
    if (author) {
      updatePropertyTag('og:author', author);
      updatePropertyTag('article:author', author);
    }

    if (publishedTime) {
      updatePropertyTag('article:published_time', publishedTime);
    }

    if (modifiedTime) {
      updatePropertyTag('article:modified_time', modifiedTime);
    }

    if (section) {
      updatePropertyTag('article:section', section);
    }

    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.content = tag;
        document.head.appendChild(tagMeta);
      });
    }

    // Update Twitter Card tags
    updatePropertyTag('twitter:card', 'summary_large_image');
    updatePropertyTag('twitter:site', '@todaymydream');
    updatePropertyTag('twitter:creator', '@todaymydream');

    // Update viewport and other essential meta tags
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0';

    // Update robots meta tag
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url || `https://decoryy.com${location.pathname}`;

    // Add structured data if provided
    if (structuredData) {
      // Remove existing structured data
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => {
        if (script.textContent.includes('"@type"')) {
          script.remove();
        }
      });

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, image, url, type, structuredData, location.pathname]);

  return null; // This component doesn't render anything
};

export default SEO; 