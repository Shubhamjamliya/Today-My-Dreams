import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Upload,
  X,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import config from '../config/config';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'review',
    video: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  // --- New State for Upload Progress ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    { value: 'review', label: 'Customer Review' },
    { value: 'work', label: 'Our Work' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'demo', label: 'Demo/How-to' }
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(config.API_URLS.VIDEOS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      } else {
        toast.error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Error fetching videos');
    } finally {
      setLoading(false);
    }
  };
  
  // --- New Upload Function with Progress Tracking ---
  const uploadVideoWithProgress = (token, file) => {
    return new Promise((resolve, reject) => {
      const uploadFormData = new FormData();
      uploadFormData.append('video', file);

      const xhr = new XMLHttpRequest();

      // Listen for progress events
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      
      // Handle successful upload
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(JSON.parse(xhr.responseText));
        }
      };

      // Handle upload errors
      xhr.onerror = () => {
        reject({ error: 'Upload failed due to a network error.' });
      };

      xhr.open('POST', `${config.API_URLS.VIDEOS}/upload`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(uploadFormData);
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }
    
    if (!videoFile && !formData.video) {
      toast.error('Please select a video file');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      let videoUrl = formData.video;

      // Upload video if a new file is selected
      if (videoFile) {
        setIsUploading(true);
        setUploadProgress(0);

        try {
          const uploadData = await uploadVideoWithProgress(token, videoFile);
          videoUrl = uploadData.videoUrl;
          console.log('Video uploaded successfully:', uploadData);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(uploadError.error || 'Failed to upload video');
          setIsUploading(false); // Reset on error
          return; // Stop if upload fails
        } finally {
          setIsUploading(false); // Always reset after upload attempt
        }
      }

      const submitData = {
        ...formData,
        video: videoUrl
      };

      const url = editingVideo 
        ? `${config.API_URLS.VIDEOS}/${editingVideo._id}`
        : config.API_URLS.VIDEOS;
      
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(editingVideo ? 'Video updated successfully' : 'Video created successfully');
        setShowModal(false);
        resetForm();
        fetchVideos();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save video');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Error saving video');
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URLS.VIDEOS}/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Video deleted successfully');
        fetchVideos();
      } else {
        toast.error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Error deleting video');
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      category: video.category || 'review',
      video: video.video || ''
    });
    setVideoPreview(video.video || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'review',
      video: ''
    });
    setEditingVideo(null);
    setVideoFile(null);
    setVideoPreview('');
    // --- Reset upload state on form reset ---
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600 mt-1">Manage your video content for reviews and work showcase</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Video
        </button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {videos.map((video) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
            >
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-100">
                {video.video ? (
                  <video
                    src={video.video}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Play size={40} />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    video.category === 'review' ? 'bg-green-100 text-green-800' :
                    video.category === 'work' ? 'bg-blue-100 text-blue-800' :
                    video.category === 'testimonial' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {categories.find(c => c.value === video.category)?.label}
                  </span>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(video.video, '_blank')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Play size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(video)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Play size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first video to showcase your work and reviews</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Your First Video
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingVideo ? 'Edit Video' : 'Add New Video'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video title"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video File *
                  </label>
                  <div className="mt-1 flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="flex-1">
                       <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    {videoPreview && (
                      <video
                        src={videoPreview}
                        className="w-24 h-16 object-cover rounded-lg border bg-gray-100"
                        controls
                      />
                    )}
                  </div>
                </div>

                {/* --- New Progress Bar UI --- */}
                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}


                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading} // Disable button during upload
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>{editingVideo ? 'Update Video' : 'Create Video'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Videos;