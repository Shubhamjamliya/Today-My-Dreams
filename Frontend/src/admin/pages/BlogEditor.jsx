import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  Eye,
  ArrowLeft,
  Upload,
  Image,
  FileText,
  X
} from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featuredImage: '',
    author: '',
    category: '',
    readTime: 5,
    isPublished: false,
    imageFile: null
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
 

  useEffect(() => {
    if (isEditing) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminBlog(id);
      const blog = response.data.blog;
      
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        featuredImage: blog.featuredImage || '',
        author: blog.author || '',
        category: blog.category || '',
        readTime: blog.readTime || 5,
        isPublished: blog.isPublished || false
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to fetch blog post');
      toast.error('Failed to fetch blog post');
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [isEditing]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file for upload
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        featuredImage: URL.createObjectURL(file) // For preview
      }));
    }
  }, []);


  const calculateReadTime = useCallback((content) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }, []);

  const handleContentChange = useCallback((e) => {
    const content = e.target.value;
    setFormData(prev => ({
      ...prev,
      content,
      readTime: calculateReadTime(content)
    }));
  }, [calculateReadTime]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || (!formData.featuredImage && !formData.imageFile)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('author', formData.author);
      submitData.append('category', formData.category);
      submitData.append('readTime', formData.readTime);
      submitData.append('isPublished', formData.isPublished);
      
      // Add image file if available
      if (formData.imageFile) {
        submitData.append('featuredImage', formData.imageFile);
      } else if (formData.featuredImage && !formData.imageFile) {
        // If editing and no new image, keep existing image URL
        submitData.append('featuredImage', formData.featuredImage);
      }
      
      if (isEditing) {
        await apiService.updateBlog(id, submitData);
        toast.success('Blog post updated successfully');
      } else {
        await apiService.createBlog(submitData);
        toast.success('Blog post created successfully');
      }
      
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving blog:', error);
      setError('Failed to save blog post');
      toast.error('Failed to save blog post');
    } finally {
      setSaving(false);
    }
  }, [formData, isEditing, id, navigate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Blog</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/admin/blog')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Blog Management
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
           
          </div>
        </div>

        <div className="flex items-center gap-3">
         
          
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter blog post title"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Publish this blog post
                </label>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image size={20} />
              Featured Image *
            </h2>
            
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {formData.featuredImage && (
                <div className="relative">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      featuredImage: '', 
                      imageFile: null 
                    }))}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Content *
            </h2>
            
            <textarea
              name="content"
              value={formData.content}
              onChange={handleContentChange}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your blog post content here..."
            />
            
            <div className="mt-2 text-sm text-gray-500">
              Read time: {formData.readTime} minutes
            </div>
          </div>

        
        </div>

        {/* Sidebar */}
        <div className="space-y-6">


        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
