import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  TrendingUp,
  X,
  Check,
  XCircle
} from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const BlogCard = React.memo(({ blog, onEdit, onDelete, onToggleStatus }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setIsDeleting(true);
      try {
        await apiService.deleteBlog(blog._id);
        toast.success('Blog post deleted successfully');
        onDelete(blog._id);
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog post');
      } finally {
        setIsDeleting(false);
      }
    }
  }, [blog._id, onDelete]);

  const handleToggleStatus = useCallback(async () => {
    try {
      await apiService.updateBlog(blog._id, {
        ...blog,
        isPublished: !blog.isPublished,
        publishedAt: !blog.isPublished ? new Date() : blog.publishedAt
      });
      toast.success(`Blog post ${!blog.isPublished ? 'published' : 'unpublished'} successfully`);
      onToggleStatus(blog._id, !blog.isPublished);
    } catch (error) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status');
    }
  }, [blog, onToggleStatus]);

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('en-GB');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="relative">
        <img
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {blog.isPublished ? (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Published
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
              Draft
            </span>
          )}
          {blog.isFeatured && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {blog.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {blog.excerpt}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <User size={14} />
            {blog.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(blog.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {blog.views} views
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {blog.category}
          </span>
          {blog.tags && blog.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/blog/edit/${blog._id}`}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              <Edit size={14} />
              Edit
            </Link>
            
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-colors text-sm ${
                blog.isPublished
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {blog.isPublished ? (
                <>
                  <XCircle size={14} />
                  Unpublish
                </>
              ) : (
                <>
                  <Check size={14} />
                  Publish
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
          >
            <Trash2 size={14} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // Load categories once
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch blogs when filters change
  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm, filterStatus, filterCategory]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory) params.append('category', filterCategory);

      const response = await apiService.getAdminBlogs(params.toString());
      setBlogs(response.data.blogs || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to fetch blogs. Please try again.');
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiService.getBlogCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
  }, []);

  const handleDelete = useCallback((blogId) => {
    setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId));
  }, []);

  const handleToggleStatus = useCallback((blogId, newStatus) => {
    setBlogs(prevBlogs => 
      prevBlogs.map(blog => 
        blog._id === blogId 
          ? { ...blog, isPublished: newStatus, publishedAt: newStatus ? new Date() : blog.publishedAt }
          : blog
      )
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCategory('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterCategory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>
        <Link
          to="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Blog Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {blogs.filter(blog => blog.isPublished).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">
                {blogs.filter(blog => !blog.isPublished).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <XCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-purple-600">
                {blogs.filter(blog => blog.isFeatured).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Blog Grid */}
      {error ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Blogs</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBlogs}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : blogs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onEdit={() => {}}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNext}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters 
              ? "Try adjusting your filters to see more results." 
              : "Get started by creating your first blog post!"}
          </p>
          {!hasActiveFilters && (
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Blog Post
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
