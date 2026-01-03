import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, ImagePlus, AlertCircle, CheckCircle } from 'lucide-react';
import apiService from "../services/api";
import Loader from "../components/Loader";

// Image compression utility
const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          try {
            // Convert blob to File so FormData receives a filename and correct type
            const fileName = file.name ? file.name.replace(/\.[^/.]+$/, '') + '.jpg' : 'image.jpg';
            const newFile = new File([blob], fileName, { type: 'image/jpeg' });
            resolve(newFile);
          } catch (err) {
            // Fallback to blob if File constructor not supported
            console.error('Error creating File from blob:', err);
            resolve(blob);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

const EditHeroCarousel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [item, setItem] = useState({
    title: "",
    isMobile: false,
    buttonText: "Shop Now",
    buttonLink: "/shop",
    isActive: true,
    order: 0
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [compressedFileSize, setCompressedFileSize] = useState(0);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const fetchCarouselItem = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await apiService.getCarouselItem(id);
      const carouselItem = response.data;

      if (!carouselItem) {
        showToast("Carousel item not found", "error");
        navigate('/admin/hero-carousel');
        return;
      }

      setItem({
        ...carouselItem,
        id: carouselItem._id
      });
      if (carouselItem.image) {
        setPreviewUrl(carouselItem.image);
      }
    } catch (error) {
      console.error("Error fetching carousel item:", error);
      showToast("Failed to fetch carousel item", "error");
      navigate('/admin/hero-carousel');
    } finally {
      setInitialLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isNew && id) {
      fetchCarouselItem();
    } else {
      setInitialLoading(false);
    }
  }, [id, isNew, fetchCarouselItem]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setUploadProgress(0);

      // Validate required fields
      if (!item.title) {
        showToast("Title is required", "error");
        setLoading(false);
        return;
      }

      if (isNew && !file) {
        showToast("Image is required", "error");
        setLoading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();

      // Add all item fields to FormData
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined && item[key] !== null && key !== '_id' && key !== 'id') {
          formData.append(key, item[key]);
        }
      });

      // Handle image compression and upload
      if (file) {
        setIsCompressing(true);
        setUploadProgress(10);

        try {
          // Compress image if it's larger than 2MB
          let processedFile = file;
          if (file.size > 2 * 1024 * 1024) { // 2MB threshold
            processedFile = await compressImage(file, 1920, 1080, 0.8);
            setCompressedFileSize(processedFile.size);
            showToast(`Image compressed from ${(file.size / 1024 / 1024).toFixed(1)}MB to ${(processedFile.size / 1024 / 1024).toFixed(1)}MB`, "success");
          }

          setUploadProgress(30);
          formData.append('image', processedFile);
          setUploadProgress(50);
        } catch (_compressionError) {
          console.error('Image compression failed:', _compressionError);
          showToast("Image compression failed, uploading original file", "error");
          formData.append('image', file);
        } finally {
          setIsCompressing(false);
        }
      }

      setUploadProgress(70);

      if (isNew) {
        await apiService.createCarouselItem(formData);
        setUploadProgress(100);
        showToast("Carousel item created successfully");
      } else {
        const itemId = item.id || item._id;
        if (!itemId) {
          showToast("Invalid carousel item ID", "error");
          setLoading(false);
          return;
        }
        await apiService.updateCarouselItem(itemId, formData);
        setUploadProgress(100);
        showToast("Carousel item updated successfully");
      }

      // Small delay to show 100% progress
      setTimeout(() => {
        navigate('/admin/hero-carousel');
      }, 500);

    } catch (error) {
      console.error('Error saving carousel item:', error);
      showToast(error.response?.data?.message || error.message || 'Failed to save carousel item', "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // video detection removed (unused)

  // File validation and handling
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];

    if (!file) return { valid: false, error: 'No file selected' };

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please use JPG, PNG, GIF, WebP, or MP4' };
    }

    return { valid: true };
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      showToast(validation.error, "error");
      e.target.value = ''; // Clear the input
      return;
    }

    setFile(selectedFile);
    setOriginalFileSize(selectedFile.size);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    // Show file size info
    const sizeInMB = (selectedFile.size / 1024 / 1024).toFixed(1);
    showToast(`File selected: ${sizeInMB}MB`, "success");
  };

  if (initialLoading) {
    return (
      <Loader fullScreen text="Loading carousel item..." />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isNew ? 'Add New Carousel Item' : 'Edit Carousel Item'}
        </h1>

        {/* Toast notification */}
        {toast.show && (
          <div className={`mb-4 p-4 rounded-lg flex items-center ${toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Upload (required)</label>
            <div className="border-2 border-dashed rounded-lg p-6 border-gray-300">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded" />
                  <button type="button" onClick={() => { setFile(null); setPreviewUrl(""); setOriginalFileSize(0); setCompressedFileSize(0); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>

                  {/* File size info */}
                  {originalFileSize > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {compressedFileSize > 0 ? (
                        <>
                          Original: {(originalFileSize / 1024 / 1024).toFixed(1)}MB →
                          Compressed: {(compressedFileSize / 1024 / 1024).toFixed(1)}MB
                        </>
                      ) : (
                        `Size: ${(originalFileSize / 1024 / 1024).toFixed(1)}MB`
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-amber-600 hover:text-amber-500">Upload image</span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,video/mp4"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP, MP4 up to 10MB</p>
                </div>
              )}

              {/* Upload Progress */}
              {(loading || isCompressing) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {isCompressing ? 'Compressing image...' : 'Uploading...'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Banner Checkbox */}

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="isMobile"
              name="isMobile"
              checked={item.isMobile}
              onChange={handleInputChange}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="isMobile" className="ml-2 block text-sm text-gray-700">
              our work section
            </label>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={item.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              required
            />
          </div>



          {/* Button Text */}
          <div>
            <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700">
              Button Text
            </label>
            <input
              type="text"
              id="buttonText"
              name="buttonText"
              value={item.buttonText}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          {/* Button Link */}
          <div>
            <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-700">
              Button Link
            </label>
            <input
              type="text"
              id="buttonLink"
              name="buttonLink"
              value={item.buttonLink}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={item.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/hero-carousel')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isCompressing}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${(loading || isCompressing) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isCompressing ? (
                <div className="flex items-center">
                  <Loader size="tiny" inline text="" />
                  <span className="ml-2">Compressing...</span>
                </div>
              ) : loading ? (
                <div className="flex items-center">
                  <Loader size="tiny" inline text="" />
                  <span className="ml-2">{uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Saving...'}</span>
                </div>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHeroCarousel; 