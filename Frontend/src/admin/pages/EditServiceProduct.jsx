import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Upload, X, ImagePlus, AlertCircle, CheckCircle, Plus, Copy, Hash, ArrowLeft } from 'lucide-react';
import apiService from "../services/api";
import Loader from "../components/Loader";
import imageCompression from 'browser-image-compression';

const EditServiceProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === "new";

  const [product, setProduct] = useState({
    id: "",
    _id: "",
    name: "",
    material: "",
    size: "",
    colour: "",
    category: "",
    subCategory: "",
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
    stock: 10,
    module: "service"
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

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories({ module: 'service' });
        let allCats = response.data.categories || response.data || [];
        setCategories(allCats);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        showToast("Failed to load categories", "error");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      apiService.getProduct(id, { module: 'service' })
        .then((response) => {
          const prod = response.data.product || response.data;
          if (prod) {
            setProduct({
              ...prod,
              id: prod._id,
              _id: prod._id,
              category: prod.category?._id || "",
              subCategory: prod.subCategory?._id || "",
              price: prod.price?.toString() || "",
              regularPrice: prod.regularPrice?.toString() || "",
              stock: prod.stock || 0,
              module: "service"
            });

            if (prod.category?._id) {
              fetchSubCategories(prod.category._id);
            }

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
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await apiService.getSubCategories(categoryId, { module: 'service' });
      setSubCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sub-categories", error);
      showToast("Could not load sub-categories for the selected category", "error");
      setSubCategories([]);
    }
  };

  const showToast = (message, type = "success", details = "") => {
    setToast({ show: true, message, type, details });
    setTimeout(() => setToast({ show: false, message: "", type: "", details: "" }), 8000);
  };

  const copyMongoId = async () => {
    if (product._id) {
      try {
        await navigator.clipboard.writeText(product._id);
        showToast("MongoDB ID copied to clipboard!", "success");
      } catch (err) {
        showToast("MongoDB ID copied to clipboard!", "success");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'category') {
      fetchSubCategories(value);
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

  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur();
  };

  const handleFocus = (e) => {
    e.target.addEventListener('wheel', handleWheel, { passive: false });
  };

  const handleBlur = (e) => {
    e.target.removeEventListener('wheel', handleWheel);
  };

  const handleFile = async (file, fieldName) => {
    if (file && file.type.startsWith('image/')) {
      // Show preview immediately with original file
      const reader = new FileReader();
      reader.onload = () => setPreviewUrls(prev => ({ ...prev, [fieldName]: reader.result }));
      reader.readAsDataURL(file);

      // Compress image
      try {
        console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: file.type // Preserve original type if possible, or usually defaults to jpeg/png
        };

        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        setFiles(prev => ({ ...prev, [fieldName]: compressedFile }));
      } catch (error) {
        console.error("Image compression failed, using original file:", error);
        setFiles(prev => ({ ...prev, [fieldName]: file }));
      }
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

    // Correct validation: Allow 0 for stock/price
    const missingFields = requiredFields.filter(field => {
      const value = product[field];
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === "");
    });

    if (missingFields.length > 0) {
      showToast(`Please fill all required fields: ${missingFields.join(", ")}`, "error");
      setLoading(false);
      return;
    }

    const price = parseFloat(product.price);
    const regularPrice = parseFloat(product.regularPrice);
    const stock = Number(product.stock);

    if (isNaN(price) || price < 0 || isNaN(regularPrice) || regularPrice < 0 || price > regularPrice || isNaN(stock) || stock < 0) {
      showToast("Please check pricing and stock values", "error");
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
      setErrorDetails(null);
      if (isNew) {
        await apiService.createProduct(formData);
        showToast("Service Product created successfully!");
      } else {
        await apiService.updateProduct(product.id, formData);
        showToast("Service Product updated successfully!");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error('=== Error saving product ===', error);
      let errorMessage = "Error saving product";
      let errorDetails = "";
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.message;
        errorDetails = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error", errorDetails);
      setErrorDetails({ message: errorMessage, details: errorDetails });
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center mb-8">
              <button
                onClick={() => navigate("/admin/products")}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {isNew ? "Add New Service Product" : "Edit Service Product"}
              </h1>
            </div>

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
                  <button onClick={copyMongoId} className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Copy size={16} />
                    <span className="text-sm">Copy</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {errorDetails && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{errorDetails.message}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information (Service)</h2>
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
                  </div>

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
                        {!product.category ? "Select a category first" : subCategories.length === 0 ? "No sub-categories found" : "Select a sub-category"}
                      </option>
                      {subCategories.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

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

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Stock</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700">Price <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={product.price} onChange={handleChange} onWheel={handleWheel} onFocus={handleFocus} onBlur={handleBlur} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" step="0.01" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Regular Price <span className="text-red-500">*</span></label>
                    <input type="number" name="regularPrice" value={product.regularPrice} onChange={handleChange} onWheel={handleWheel} onFocus={handleFocus} onBlur={handleBlur} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" step="0.01" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Stock Quantity <span className="text-red-500">*</span></label>
                    <input type="number" name="stock" min="0" value={product.stock} onChange={handleChange} onWheel={handleWheel} onFocus={handleFocus} onBlur={handleBlur} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                  </div>
                </div>
              </div>

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

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">What's Excluded ✗</label>
                    <div className="space-y-2">
                      {product.excluded.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input type="text" value={item} onChange={(e) => { const newExcluded = [...product.excluded]; newExcluded[index] = e.target.value; setProduct({ ...product, excluded: newExcluded }); }} className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g., Installation not included" />
                          <button type="button" onClick={() => { const newExcluded = product.excluded.filter((_, i) => i !== index); setProduct({ ...product, excluded: newExcluded }); }} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setProduct({ ...product, excluded: [...product.excluded, ''] })} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-4 h-4" /> Add Excluded Item</button>
                    </div>
                  </div>
                </div>
              </div>

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

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {renderFileInput('mainImage', 'Main Image', true)}
                  {renderFileInput('image1', 'Additional Image 1')}
                  {renderFileInput('image2', 'Additional Image 2')}
                  {renderFileInput('image3', 'Additional Image 3')}
                  {renderFileInput('image4', 'Additional Image 4')}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button type="button" onClick={() => navigate("/admin/products")} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  {loading && <Loader size="tiny" inline text="" />}
                  <span>{isNew ? "Create Service Product" : "Update Service Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        {toast.show && (
          <div className={`fixed bottom-4 right-4 max-w-md px-6 py-4 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            <div className="flex items-start space-x-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{toast.message}</div>
                {toast.details && <div className="mt-2 text-sm opacity-90">{toast.details}</div>}
              </div>
              <button onClick={() => setToast({ show: false, message: "", type: "", details: "" })} className="ml-2 text-white hover:text-gray-200 flex-shrink-0"><X size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditServiceProduct;
