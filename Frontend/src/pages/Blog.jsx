import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { blogAPI } from '../services/api';
import { BlogSkeleton } from '../components/Loader/Skeleton'; // Assuming existing path is correct
import SEO from '../components/SEO/SEO';

const ModernBlogCard = ({ blog, index }) => {
  const navigate = useNavigate();
  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/blog/${blog.slug}`)}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-6 shadow-lg shadow-slate-100">
        <img
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-slate-900 rounded-full shadow-sm border border-white/20">
            {blog.category || 'Article'}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-grow bg-white p-2">
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-amber-500" />
            {formattedDate}
          </span>
          {/* Assuming readingTime might exist or we omit it */}
          {/* <span className="flex items-center gap-1">
                        <Clock size={14} className="text-amber-500" />
                        5 min read
                    </span> */}
        </div>

        <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 font-serif group-hover:text-amber-600 transition-colors leading-tight">
          {blog.title}
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {blog.content} {/* Assuming content is plain text or simple HTML */}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-amber-600 font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
            Read Story <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </motion.article>
  );
};

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
        limit: '9', // Increased limit for grid layout
        ...(searchTerm && { search: searchTerm })
      });

      const response = await blogAPI.getBlogs(params.toString());
      setBlogs(response.data.blogs || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
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
      // Silently fail for featured
    }
  }, []);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, [fetchFeaturedBlogs]);

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [fetchBlogs, currentPage]);

  // Debounce Search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== searchParams.get('search')) {
        setCurrentPage(1);
        fetchBlogs(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchParams, fetchBlogs]);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params);
  }, [searchTerm, setSearchParams]);

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      <SEO
        title="Celebration Journal - TodayMyDream"
        description="Ideas, tips and trends for your next celebration."
        keywords="party planning blog, decoration tips, event design ideas"
        url="https://todaymydream.com/blog"
        image="/blog-hero.jpg"
      />

      {/* Hero Section */}
      <section className="bg-slate-900 relative pt-32 pb-32 lg:pt-40 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">The Journal</span>
            <h1 className="text-4xl lg:text-7xl font-bold text-white mb-8 font-serif">
              Stories of <span className="text-amber-500 italic">Celebration</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
              Discover the latest trends, expert tips, and inspiring stories to help you create unforgettable moments.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-500 transition-colors" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-14 pr-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-amber-500/50 focus:outline-none transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section (if exists) */}
      {/* Keeping it hidden for now as code fetched it but didn't display nicely in previous version. Can add if requested. */}

      {/* Blogs Grid */}
      <section className="py-20 lg:py-24 bg-slate-50 min-h-[600px]">
        <div className="container mx-auto px-6">
          {error ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-slate-700 mb-2">Oops!</h3>
              <p className="text-slate-500">{error}</p>
              <button onClick={() => fetchBlogs(currentPage)} className="mt-4 px-6 py-2 bg-amber-500 rounded-full font-bold">Try Again</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {[...Array(6)].map((_, i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {blogs.map((blog, index) => (
                  <ModernBlogCard key={blog._id} blog={blog} index={index} />
                ))}
              </div>

              {/* Pagination (Simple) */}
              {pagination.pages > 1 && (
                <div className="mt-16 flex justify-center gap-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-6 py-3 rounded-full border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-3 text-slate-500">Page {currentPage} of {pagination.pages}</span>
                  <button
                    disabled={currentPage === pagination.pages}
                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                    className="px-6 py-3 rounded-full border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 grayscale opacity-50">📰</div>
              <h3 className="text-xl font-bold text-slate-500">No articles found</h3>
              <p className="text-slate-400 mt-2">Try searching for something else.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
