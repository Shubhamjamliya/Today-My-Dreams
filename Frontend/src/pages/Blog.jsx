import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  X
} from 'lucide-react';
import { blogAPI } from '../services/api';
import Loader from '../components/Loader';
import SEO from '../components/SEO/SEO';
import InternalLinking from '../components/SEO/InternalLinking';

const BlogCard = React.memo(({ blog, index }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/blog/${blog.slug}`);
  }, [navigate, blog.slug]);

  const formattedDate = useMemo(() => {
    return new Date(blog.createdAt).toLocaleDateString('en-GB');
  }, [blog.createdAt]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer border border-slate-100 hover:border-blue-200"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-40 md:h-56">
        <img
          src={blog.featuredImage}

          className="w-full h-full object-cover group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4">
          <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm border border-white/20">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 md:p-7">
        {/* Meta Information - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 mb-4">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-slate-400" />
            {formattedDate}
          </span>

          <span className="flex items-center gap-1.5 font-medium">
            <Eye size={14} className="text-slate-400" />
            {blog.views}
          </span>
        </div>

        {/* Mobile Meta - Compact version */}
        <div className="md:hidden flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formattedDate}
          </span>

        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-4 group-hover:text-blue-600 transition-colors duration-300 md:line-clamp-2 leading-tight">
          {blog.title}
        </h3>

        {/* Excerpt - Hidden on mobile, shown on desktop */}
        <p className="hidden md:block text-slate-600 mb-6 line-clamp-3 leading-relaxed text-sm">
          {blog.content}
        </p>
        <div className="flex items-center text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all duration-300">
          <span className="text-xs md:text-sm font-semibold mr-1">Read</span>
          <ArrowRight size={14} className="md:w-4 md:h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
        </div>


      </div>
    </motion.article>
  );
});


const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await blogAPI.getBlogs(params.toString());
      setBlogs(response.data.blogs || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      // Error fetching blogs
      setError('Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchFeaturedBlogs = useCallback(async () => {
    try {
      const response = await blogAPI.getBlogs('featured=true&limit=3');
      setFeaturedBlogs(response.data.blogs || []);
    } catch (error) {
      // Error fetching featured blogs
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchFeaturedBlogs();
  }, [fetchFeaturedBlogs]);

  // Fetch blogs when filters change
  useEffect(() => {
    fetchBlogs(currentPage);
  }, [fetchBlogs, currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== searchParams.get('search')) {
        setCurrentPage(1);
        fetchBlogs(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchParams, fetchBlogs]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURL();
  }, [searchTerm]);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params);
  }, [searchTerm, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  const hasActiveFilters = searchTerm;

  return (
    <>
      <SEO
        title="Celebration Blog - TodayMyDream"
        description="Ideas, tips and trends for your next celebration."
        keywords="birthday decoration ideas, anniversary decoration, baby shower decoration, venue decoration, party decoration tips, celebration ideas, DIY decoration, event planning, balloon decoration, party themes, decoration trends, party supplies, celebration materials, birthday party ideas, wedding decoration, anniversary party, baby shower themes, venue styling, party planning, decoration inspiration"
        url="https://todaymydream.com/blog"
        image="/blog-hero.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "TodayMyDream Decoration Blog",
          "description": "Expert tips and inspiration for birthday decorations, anniversary celebrations, baby shower themes, and venue decoration ideas.",
          "url": "https://todaymydream.com/blog",
          "publisher": {
            "@type": "Organization",
            "name": "TodayMyDream",
            "logo": {
              "@type": "ImageObject",
              "url": "https://todaymydream.com/TodayMyDream.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://todaymydream.com/blog"
          },
          "inLanguage": "en-US",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://todaymydream.com/blog?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />

      <div className="min-h-screen bg-slate-50">




        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Blog Grid */}
            {error ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ color: '#0f172a' }}>Error Loading Posts</h3>
                <p className="text-slate-600 mb-6" style={{ color: '#475569' }}>{error}</p>
                <button
                  onClick={() => fetchBlogs(currentPage)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading blog posts..." />
              </div>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {blogs.map((blog, index) => (
                    <BlogCard key={blog._id} blog={blog} index={index} />
                  ))}
                </div>


              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ color: '#0f172a' }}>No blog posts found</h3>
                <p className="text-slate-600 mb-6" style={{ color: '#475569' }}>
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "Check back later for new content!"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>


      </div>
    </>
  );
};

export default Blog;
