import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, ImagePlus, AlertCircle, CheckCircle, Plus, Copy, Hash } from 'lucide-react';
import apiService from "../services/api";
import Loader from "../components/Loader";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [product, setProduct] = useState({
    id: "",
    _id: "", // MongoDB ID
    name: "",
    material: "",

    size: "",
    colour: "",
    category: "",
    subCategory: "", // NEW: Added subCategory to state

    utility: "",
    care: "",
    included: [],
    excluded: [],
    price: "",
    regularPrice: "",
    inStock: true,
    isBestSeller: false,
    isTrending: false,
    isMostLoved: false,
    codAvailable: true,
    stock: 10
  });

  const [files, setFiles] = useState({
    mainImage: null,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null,
    image7: null,
    image8: null,
    image9: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    mainImage: "",
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    image6: "",
    image7: "",
    image8: "",
    image9: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "", details: "" });
  const [errorDetails, setErrorDetails] = useState(null);
  const [dragOver, setDragOver] = useState({
    mainImage: false,
    image1: false,
    image2: false,
    image3: false,
    image4: false,
    image5: false,
    image6: false,
    image7: false,
    image8: false,
    image9: false,
  });

  // States for categories and sub-categories
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]); // NEW: State for sub-categories
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  // NOTE: Review logic is unchanged, so it has been removed for brevity.

  // Fetch all categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response.data.categories || response.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        showToast("Failed to load categories", "error");
      }
    };
    fetchCategories();
  }, []);

  // Fetch product data if editing an existing product
  useEffect(() => {
    if (!isNew) {
      apiService.getProduct(id)
        .then((response) => {
          const prod = response.data.product || response.data;
          if (prod) {
            setProduct({
              ...prod,
              id: prod._id,
              _id: prod._id, // Store MongoDB ID separately
              category: prod.category?._id || "", // Set category ID
              subCategory: prod.subCategory?._id || "", // Set subCategory ID
              price: prod.price?.toString() || "",
              regularPrice: prod.regularPrice?.toString() || "",
              stock: prod.stock || 0
            });

            // If a category is already set, fetch its sub-categories
            if (prod.category?._id) {
              fetchSubCategories(prod.category._id);
            }

            // Set preview URLs
            const imageMapping = {
              mainImage: prod.images?.[0] || prod.image || "",
              image1: prod.images?.[1] || "",
              image2: prod.images?.[2] || "",
              image3: prod.images?.[3] || "",
              image4: prod.images?.[4] || "",
              image5: prod.images?.[5] || "",
              image6: prod.images?.[6] || "",
              image7: prod.images?.[7] || "",
              image8: prod.images?.[8] || "",
              image9: prod.images?.[9] || "",
            };
            setPreviewUrls(imageMapping);
          } else {
            showToast("Product not found", "error");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch product:", error);
          showToast("Error loading product", "error");
        });
    }
  }, [id, isNew]);

  // NEW: Function to fetch sub-categories based on a category ID
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await apiService.getSubCategories(categoryId);
      setSubCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sub-categories", error);
      showToast("Could not load sub-categories for the selected category", "error");
      setSubCategories([]); // Clear sub-categories on error
    }
  };

  const showToast = (message, type = "success", details = "") => {
    setToast({ show: true, message, type, details });
    setTimeout(() => setToast({ show: false, message: "", type: "", details: "" }), 8000); // Longer timeout for detailed errors
  };

  const copyMongoId = async () => {
    if (product._id) {
      try {
        await navigator.clipboard.writeText(product._id);
        showToast("MongoDB ID copied to clipboard!", "success");
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = product._id;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast("MongoDB ID copied to clipboard!", "success");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // NEW: Special handling for category change to fetch sub-categories
    if (name === 'category') {
      fetchSubCategories(value);
      // Reset sub-category when parent category changes
      setProduct((prev) => ({
        ...prev,
        category: value,
        subCategory: "",
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur();
  };

  // Additional handler to prevent focus on scroll
  const handleFocus = (e) => {
    e.target.addEventListener('wheel', handleWheel, { passive: false });
  };

  const handleBlur = (e) => {
    e.target.removeEventListener('wheel', handleWheel);
  };

  const handleFile = (file, fieldName) => {
    if (file && file.type.startsWith('image/')) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      const reader = new FileReader();
      reader.onload = () => setPreviewUrls(prev => ({ ...prev, [fieldName]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e, fieldName) => handleFile(e.target.files?.[0], fieldName);
  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [fieldName]: false }));
    handleFile(e.dataTransfer.files[0], fieldName);
  };
  const handleDragOver = (e, fieldName) => { e.preventDefault(); setDragOver(prev => ({ ...prev, [fieldName]: true })); };
  const handleDragLeave = (e, fieldName) => { e.preventDefault(); setDragOver(prev => ({ ...prev, [fieldName]: false })); };
  const removeImage = (fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    setPreviewUrls(prev => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = [
      "name", "material", "size", "colour",
      "category", "utility", "price", "regularPrice", "stock"
    ];

    const missingFields = requiredFields.filter(field => !product[field] || product[field].toString().trim() === "");
    if (missingFields.length > 0) {
      showToast(`Please fill all required fields: ${missingFields.join(", ")}`, "error");
      setLoading(false);
      return;
    }

    // Validate price values
    const price = parseFloat(product.price);
    const regularPrice = parseFloat(product.regularPrice);
    const stock = Number(product.stock);

    if (isNaN(price) || price < 0) {
      showToast("Please enter a valid price", "error");
      setLoading(false);
      return;
    }

    if (isNaN(regularPrice) || regularPrice < 0) {
      showToast("Please enter a valid regular price", "error");
      setLoading(false);
      return;
    }

    if (price > regularPrice) {
      showToast("Price cannot be greater than regular price", "error");
      setLoading(false);
      return;
    }

    if (isNaN(stock) || stock < 0) {
      showToast("Please enter a valid stock quantity", "error");
      setLoading(false);
      return;
    }

    if (isNew && !files.mainImage) {
      showToast("Please upload a main image.", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.keys(product).forEach(key => {
      if (key === 'included' || key === 'excluded') {
        formData.append(key, JSON.stringify(product[key]));
      } else {
        formData.append(key, product[key]);
      }
    });
    Object.keys(files).forEach(key => {
      if (files[key]) formData.append(key, files[key]);
    });

    try {
      // Clear any previous error details
      setErrorDetails(null);

      if (isNew) {
        await apiService.createProduct(formData);
        showToast("Product created successfully!");
      } else {
        await apiService.updateProduct(product.id, formData);
        showToast("Product updated successfully!");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error('=== Error saving product ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Product data being sent:', product);
      console.error('Files being sent:', files);

      // Extract detailed error message
      let errorMessage = "Error saving product";
      let errorDetails = "";

      // Handle network errors specifically
      if (error.isNetworkError || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = "Network Connection Error";
        errorDetails = `Unable to connect to the backend server. Please check:
1. Backend server is running 
2. No firewall blocking the connection
3. Backend server is accessible from the admin panel

Error: ${error.message}`;
      } else if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;

        if (errorData.details) {
          if (Array.isArray(errorData.details)) {
            errorDetails = errorData.details.join(', ');
          } else {
            errorDetails = errorData.details;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show detailed error message in UI
      const fullErrorMessage = errorMessage;
      showToast(fullErrorMessage, "error", errorDetails);

      // Set detailed error information for inline display
      setErrorDetails({
        message: fullErrorMessage,
        details: errorDetails,
        response: error.response?.data,
        status: error.response?.status,
        productData: product,
        filesData: Object.keys(files).map(key => ({
          field: key,
          file: files[key] ? { name: files[key].name, size: files[key].size, type: files[key].type } : null
        }))
      });

      // Also log to console for debugging
      console.error('Full error message:', fullErrorMessage);
      console.error('Error details:', errorDetails);

      // Show additional debug info in development
      if (process.env.NODE_ENV === 'development') {
        console.error('=== DEBUG INFO ===');
        console.error('Product state:', product);
        console.error('Files state:', files);
        console.error('Form data being sent:');
        const debugFormData = new FormData();
        Object.keys(product).forEach(key => debugFormData.append(key, product[key]));
        Object.keys(files).forEach(key => {
          if (files[key]) debugFormData.append(key, files[key]);
        });
        for (let [key, value] of debugFormData.entries()) {
          console.error(`${key}:`, value);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewCategorySubmit = async () => {
    // This function logic is unchanged
  };

  const renderFileInput = (fieldName, label, required = false) => {
    const hasPreview = previewUrls[fieldName] || files[fieldName];
    const isDragging = dragOver[fieldName];
    return (
      <div className="col-span-1">
        <label className="block font-medium mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div
          className={`relative h-48 rounded-lg border-2 border-dashed transition-all duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${hasPreview ? 'bg-gray-50' : 'bg-white'}`}
          onDrop={(e) => handleDrop(e, fieldName)}
          onDragOver={(e) => handleDragOver(e, fieldName)}
          onDragLeave={(e) => handleDragLeave(e, fieldName)}
        >
          {hasPreview ? (
            <div className="relative h-full">
              <img
                src={previewUrls[fieldName]}
                alt={`Preview ${label}`}
                className="w-full h-full object-contain rounded-lg"
              />
              <button type="button" onClick={() => removeImage(fieldName)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <ImagePlus className="w-12 h-12 mb-2" />
              <p className="text-sm">Drag & drop or click</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, fieldName)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {isNew ? "Add New Product" : "Edit Product"}
            </h1>

            {/* MongoDB ID Display */}
            {!isNew && product._id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Hash className="text-blue-600" size={20} />
                    <div>
                      <h3 className="text-blue-800 font-medium text-sm">MongoDB ID</h3>
                      <p className="text-blue-600 text-sm font-mono break-all">{product._id}</p>
                    </div>
                  </div>
                  <button
                    onClick={copyMongoId}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Copy MongoDB ID to clipboard"
                  >
                    <Copy size={16} />
                    <span className="text-sm">Copy</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Details Section */}
              {errorDetails && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <h3 className="text-red-800 font-medium mb-2">Error Details</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-red-700">Message:</span>
                          <span className="ml-2 text-red-600">{errorDetails.message}</span>
                        </div>
                        {errorDetails.details && (
                          <div>
                            <span className="font-medium text-red-700">Details:</span>
                            <span className="ml-2 text-red-600">{errorDetails.details}</span>
                          </div>
                        )}
                        {errorDetails.status && (
                          <div>
                            <span className="font-medium text-red-700">Status Code:</span>
                            <span className="ml-2 text-red-600">{errorDetails.status}</span>
                          </div>
                        )}
                        {errorDetails.response && (
                          <div>
                            <span className="font-medium text-red-700">Server Response:</span>
                            <pre className="ml-2 text-red-600 text-xs mt-1 bg-red-100 p-2 rounded overflow-auto">
                              {JSON.stringify(errorDetails.response, null, 2)}
                            </pre>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-red-700">Files Being Sent:</span>
                          <div className="ml-2 mt-1">
                            {errorDetails.filesData.map((fileInfo, index) => (
                              <div key={index} className="text-red-600 text-xs">
                                {fileInfo.field}: {fileInfo.file ?
                                  `${fileInfo.file.name} (${fileInfo.file.size} bytes, ${fileInfo.file.type})` :
                                  'No file selected'
                                }
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorDetails(null)}
                        className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Hide Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={product.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Material <span className="text-red-500">*</span></label>
                    <input type="text" name="material" value={product.material} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                    {!isAddingNewCategory ? (
                      <div className="flex gap-2">
                        <select
                          name="category"
                          value={product.category}
                          onChange={handleChange}
                          className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>

                      </div>
                    ) : (
                      {/* New Category Form is unchanged */ }
                    )}
                  </div>

                  {/* NEW: Sub-Category Dropdown */}
                  <div>
                    <label className="block font-medium text-gray-700">Sub-Category</label>
                    <select
                      name="subCategory"
                      value={product.subCategory}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                      disabled={!product.category || subCategories.length === 0}
                    >
                      <option value="">
                        {!product.category
                          ? "Select a category first"
                          : subCategories.length === 0
                            ? "No sub-categories found"
                            : "Select a sub-category"
                        }
                      </option>
                      {subCategories.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Other fields: size, colour, weight */}
                  <div>
                    <label className="block font-medium text-gray-700">Size <span className="text-red-500">*</span></label>
                    <input type="text" name="size" value={product.size} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Colour <span className="text-red-500">*</span></label>
                    <input type="text" name="colour" value={product.colour} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>

                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Stock</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700">Price <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleChange}
                      onWheel={handleWheel}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Regular Price <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="regularPrice"
                      value={product.regularPrice}
                      onChange={handleChange}
                      onWheel={handleWheel}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Stock Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={product.stock}
                      onChange={handleChange}
                      onWheel={handleWheel}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
                <div className="grid grid-cols-1 gap-6">

                  <div>
                    <label className="block font-medium text-gray-700">Utility <span className="text-red-500">*</span></label>
                    <textarea name="utility" value={product.utility} onChange={handleChange} rows={3} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Care Instructions  <span className="text-red-500">*</span></label>
                    <textarea name="care" value={product.care} onChange={handleChange} rows={3} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>



                  {/* Excluded Items */}
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">What's Excluded ✗</label>
                    <div className="space-y-2">
                      {product.excluded.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newExcluded = [...product.excluded];
                              newExcluded[index] = e.target.value;
                              setProduct({ ...product, excluded: newExcluded });
                            }}
                            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., Installation not included"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newExcluded = product.excluded.filter((_, i) => i !== index);
                              setProduct({ ...product, excluded: newExcluded });
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setProduct({ ...product, excluded: [...product.excluded, ''] })}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Excluded Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Sections & Toggles */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings & Sections</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="isBestSeller" checked={product.isBestSeller} onChange={handleChange} className="toggle-style" />
                    <span className="text-sm text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="isTrending" checked={product.isTrending} onChange={handleChange} className="toggle-style" />
                    <span className="text-sm text-gray-700">Trending</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="isMostLoved" checked={product.isMostLoved} onChange={handleChange} className="toggle-style" />
                    <span className="text-sm text-gray-700">Most Loved</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="codAvailable" checked={product.codAvailable} onChange={handleChange} className="toggle-style" />
                    <span className="text-sm text-gray-700">COD Available</span>
                  </label>
                </div>
              </div>

              {/* Product Images */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {renderFileInput('mainImage', 'Main Image', true)}
                  {renderFileInput('image1', 'Additional Image 1')}
                  {renderFileInput('image2', 'Additional Image 2')}
                  {renderFileInput('image3', 'Additional Image 3')}
                  {renderFileInput('image4', 'Additional Image 4')}
                  {renderFileInput('image5', 'Additional Image 5')}
                  {renderFileInput('image6', 'Additional Image 6')}
                  {renderFileInput('image7', 'Additional Image 7')}
                  {renderFileInput('image8', 'Additional Image 8')}
                  {renderFileInput('image9', 'Additional Image 9')}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4">
                <button type="button" onClick={() => navigate("/admin/products")} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  {loading && <Loader size="tiny" inline text="" />}
                  <span>{isNew ? "Create Product" : "Update Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Enhanced Toast Notification */}
        {toast.show && (
          <div className={`fixed bottom-4 right-4 max-w-md px-6 py-4 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            }`}>
            <div className="flex items-start space-x-2">
              {toast.type === 'error' ? <AlertCircle size={20} className="mt-0.5 flex-shrink-0" /> : <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{toast.message}</div>
                {toast.details && (
                  <div className="mt-2 text-sm opacity-90">
                    <div className="font-medium">Details:</div>
                    <div className="mt-1 break-words">{toast.details}</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "", details: "" })}
                className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProduct;