import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Tag, 
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check
} from 'lucide-react';
import { FaPinterest } from 'react-icons/fa';
import { blogAPI } from '../services/api';
import Loader from '../components/Loader';
import SEO from '../components/SEO/SEO';
import { toast } from 'react-hot-toast';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogBySlug(slug);
        
        if (response.data.success) {
          setBlog(response.data.blog);
          
          // Fetch related blogs
          const relatedResponse = await blogAPI.getBlogs(`category=${response.data.blog.category}&limit=3`);
          const filteredRelated = relatedResponse.data.blogs.filter(b => b.slug !== slug);
          setRelatedBlogs(filteredRelated.slice(0, 3));
        } else {
          navigate('/blog');
        }
      } catch (error) {
        // Error fetching blog post
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogPost();
    }
  }, [slug, navigate]);

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = blog?.title || '';
    const description = blog?.excerpt || '';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}&media=${encodeURIComponent(blog?.featuredImage || '')}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader size="lg" text="Loading blog post..." showLogo={true} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Blog post not found</h1>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.metaTitle || blog.title,
    "description": blog.metaDescription || blog.excerpt,
    "image": blog.socialImage || blog.featuredImage,
    "author": {
      "@type": "Person",
      "name": blog.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Decoryy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://decoryy.com/logo.png"
      }
    },
    "datePublished": blog.publishedAt,
    "dateModified": blog.lastModified || blog.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://decoryy.com/blog/${blog.slug}`
    },
    "url": `https://decoryy.com/blog/${blog.slug}`,
    "keywords": blog.seoKeywords?.join(', ') || blog.tags?.join(', '),
    "articleSection": blog.category,
    "wordCount": blog.content?.split(' ').length || 0,
    "timeRequired": `PT${blog.readTime}M`,
    "inLanguage": "en-US"
  };

  return (
    <>
      <SEO
        title={blog.metaTitle || blog.title}
        description={blog.metaDescription || blog.excerpt}
        keywords={blog.seoKeywords?.join(', ') || blog.tags?.join(', ')}
        url={`https://decoryy.com/blog/${blog.slug}`}
        image={blog.socialImage || blog.featuredImage}
        type="article"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/blog"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Blog
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
                
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-2 z-10"
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Share on Facebook"
                      >
                        <Facebook size={20} />
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="p-2 text-blue-400 hover:bg-blue-50 rounded"
                        title="Share on Twitter"
                      >
                        <Twitter size={20} />
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="p-2 text-blue-700 hover:bg-blue-50 rounded"
                        title="Share on LinkedIn"
                      >
                        <Linkedin size={20} />
                      </button>
                      <button
                        onClick={() => handleShare('pinterest')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Share on Pinterest"
                      >
                        <FaPinterest size={20} />
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded"
                        title="Copy Link"
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-1 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(blog.publishedAt).toLocaleDateString('en-GB')}
                  </span>
                 
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {blog.category}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  {blog.title}
                </h1>

                <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                  {blog.excerpt}
                </p>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-slate-600">
                  <span className="font-medium">By {blog.author}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl shadow-xl"
              >
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>
        </section>

     
      </div>
    </>
  );
};

export default BlogPost;