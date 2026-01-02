import React, { useState, useRef } from 'react';
import { Upload, X, ImagePlus, Video, AlertCircle, CheckCircle, GripVertical, Plus } from 'lucide-react';

const MultiMediaUpload = ({ 
  files = [], 
  onFilesChange, 
  onRemoveFile = null, // Custom remove handler
  maxFiles = 20, 
  acceptedTypes = "image/*,video/*",
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  showPreview = true,
  allowReorder = true,
  className = ""
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`);
    }
    
    // Check file type
    const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
    const isAccepted = acceptedTypesArray.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    
    if (!isAccepted) {
      errors.push(`File type ${file.type} is not supported`);
    }
    
    return errors;
  };

  const handleFiles = (newFiles) => {
    const validFiles = [];
    const errors = {};
    
    Array.from(newFiles).forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        errors[`${file.name}_${Date.now()}`] = fileErrors;
      } else {
        validFiles.push(file);
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      setTimeout(() => setUploadErrors({}), 5000);
    }
    
    const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
    onFilesChange(updatedFiles);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    const fileToRemove = files[index];
    
    // If custom remove handler is provided, use it
    if (onRemoveFile) {
      onRemoveFile(fileToRemove, index);
    } else {
      // Default behavior - just remove from local state
      const updatedFiles = files.filter((_, i) => i !== index);
      onFilesChange(updatedFiles);
    }
  };

  const moveFile = (fromIndex, toIndex) => {
    const updatedFiles = [...files];
    const [movedFile] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, movedFile);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (file) => {
    const getFileType = (file) => {
      if (file instanceof File) {
        return file.type;
      } else if (file.type) {
        return file.type;
      }
      // Try to determine type from URL extension
      const url = file.url || '';
      if (url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) {
        return 'video/mp4';
      }
      return 'image/jpeg'; // default to image
    };

    const fileType = getFileType(file);
    if (fileType.startsWith('video/')) {
      return <Video className="w-6 h-6 text-blue-600" />;
    }
    return <ImagePlus className="w-6 h-6 text-green-600" />;
  };

  const formatFileSize = (file) => {
    let bytes = 0;
    if (file instanceof File) {
      bytes = file.size;
    } else if (file.size) {
      bytes = file.size;
    }
    
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileName = (file) => {
    if (file instanceof File) {
      return file.name;
    } else if (file.name) {
      return file.name;
    } else if (file.url) {
      // Extract filename from URL
      const urlParts = file.url.split('/');
      return urlParts[urlParts.length - 1] || 'File';
    }
    return 'Unknown file';
  };

  const renderPreview = (file, index) => {
    // Handle both File objects and existing files with URLs
    const getFileSrc = (file) => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      } else if (file.url) {
        return file.url;
      }
      return '';
    };

    const getFileType = (file) => {
      if (file instanceof File) {
        return file.type;
      } else if (file.type) {
        return file.type;
      }
      // Try to determine type from URL extension
      const url = file.url || '';
      if (url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) {
        return 'video/mp4';
      }
      return 'image/jpeg'; // default to image
    };

    const fileType = getFileType(file);
    const fileSrc = getFileSrc(file);

    if (!fileSrc) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-500 text-xs">No preview</span>
        </div>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <video 
          src={fileSrc} 
          className="w-full h-full object-cover rounded-lg"
          controls
          preload="metadata"
        />
      );
    }
    
    return (
      <img 
        src={fileSrc} 
        alt={`Preview ${index + 1}`}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  };


  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area - Always show if under max files */}
      {files.length < maxFiles && (
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
            files.length === 0 ? 'p-8 min-h-[200px]' : 'p-6'
          } ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Plus className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {files.length === 0 ? 'Upload Photos & Videos' : 'Add More Files'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supports images and videos up to {Math.round(maxFileSize / (1024 * 1024))}MB each
              <br />
              {files.length} of {maxFiles} files uploaded
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}

      {/* Error Messages */}
      {Object.keys(uploadErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Upload Errors:</h4>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.values(uploadErrors).flat().map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            {files.length >= maxFiles && (
              <span className="text-xs text-gray-500">
                Maximum files reached
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map((file, index) => (
              <div key={`${file.name}_${index}`} className="relative group">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {showPreview ? (
                    renderPreview(file, index)
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                  
                  {/* File Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <div className="text-xs truncate" title={getFileName(file)}>
                      {getFileName(file)}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatFileSize(file)}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {allowReorder && index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveFile(index, index - 1)}
                        className="p-1 bg-gray-800 bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
                        title="Move up"
                      >
                        <GripVertical className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 bg-red-600 bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {files.length > 0 && Object.keys(uploadErrors).length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-800">
              {files.length} file{files.length !== 1 ? 's' : ''} ready for upload
            </span>
          </div>
        </div>
      )}

      {/* Fallback message when no files and upload area not shown */}
      {files.length === 0 && files.length >= maxFiles && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-4" />
            <p>Maximum files reached. Remove some files to add more.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiMediaUpload;
