import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Building2, MapPin, Phone, Mail, Star, Users, Calendar, Clock, Utensils, Bed, Shield } from 'lucide-react';
import apiService from "../services/api";
import Loader from "../components/Loader";
import MultiMediaUpload from "../components/MultiMediaUpload";

const EditSeller = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new" || !id;

  console.log("EditSeller component - id:", id, "isNew:", isNew);

  const [seller, setSeller] = useState({
    businessName: "",
    email: "",
    password: "", // Required for new sellers
    phone: "",
    address: "",
    businessType: "",
    location: "",
    startingPrice: "",
    description: "",
    maxPersonsAllowed: 50,
    amenity: [],
    totalHalls: 1,
    enquiryDetails: "",
    bookingOpens: "",
    workingTimes: "",
    workingDates: "",
    foodType: [],
    roomsAvailable: 1,
    bookingPolicy: "",
    additionalFeatures: [],
    included: [],
    excluded: [],
    faq: [],
    verified: false,
    approved: false,
    blocked: false
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Amenities options
  const amenityOptions = [
    "Air Conditioning", "WiFi", "Parking", "Kitchen", "Sound System",
    "Projector", "Stage", "Dance Floor", "Bar", "Outdoor Space",
    "Pool", "Garden", "Terrace", "Balcony", "Elevator",
    "Security", "Catering", "Decoration", "Photography", "DJ"
  ];

  // Food type options
  const foodTypeOptions = [
    "Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "Continental",
    "Indian", "Chinese", "Italian", "Mexican", "Thai", "Mediterranean"
  ];

  // Additional features options
  const additionalFeaturesOptions = [
    "Live Music", "DJ", "Photography", "Videography", "Decoration",
    "Catering", "Transportation", "Accommodation", "Valet Parking",
    "Security", "Cleanup Service", "Event Planning", "Guest Management"
  ];

  useEffect(() => {
    if (!isNew && id && id !== "new") {
      const fetchSeller = async () => {
        try {
          console.log("Fetching seller with ID:", id);
          const response = await apiService.getSeller(id);
          const sellerData = response.data.seller || response.data;

          if (sellerData) {
            console.log('Found seller:', sellerData);
            setSeller({
              ...sellerData,
              startingPrice: sellerData.startingPrice?.toString() || "",
              maxPersonsAllowed: sellerData.maxPersonsAllowed || 50,
              totalHalls: sellerData.totalHalls || 1,
              roomsAvailable: sellerData.roomsAvailable || 1,
              amenity: sellerData.amenity || [],
              foodType: sellerData.foodType || [],
              additionalFeatures: sellerData.additionalFeatures || [],
              included: sellerData.included || [],
              excluded: sellerData.excluded || [],
              faq: sellerData.faq || [],
              verified: sellerData.verified || false,
              approved: sellerData.approved || false,
              blocked: sellerData.blocked || false
            });

            // Set existing media files if any
            if (sellerData.images && Array.isArray(sellerData.images)) {
              // Convert existing image URLs to file-like objects for preview
              const existingFiles = sellerData.images.map(img => ({
                name: img.alt || 'Existing Image',
                url: img.url,
                type: img.type || 'image/jpeg', // Default to image type
                existing: true
              }));
              setMediaFiles(existingFiles);
            }

            if (sellerData.profileImage) {
              setProfileImage({
                name: 'Profile Image',
                url: sellerData.profileImage.url,
                type: sellerData.profileImage.type || 'image/jpeg',
                existing: true
              });
            }
          } else {
            showToast("Seller not found", "error");
          }
        } catch (error) {
          console.error("Failed to fetch seller:", error);
          showToast("Error loading seller", "error");
        }
      };

      fetchSeller();
    }
  }, [id, isNew]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeller((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (field, value) => {
    setSeller((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileImageChange = (file) => {
    setProfileImage(file);
  };

  const handleRemoveProfileImage = async () => {
    if (!isNew && profileImage && profileImage.existing) {
      try {
        setLoading(true);
        await apiService.deleteSellerProfileImage(id);
        setProfileImage(null);
        showToast("Profile image removed successfully", "success");
      } catch (error) {
        console.error("Failed to remove profile image:", error);
        showToast("Failed to remove profile image", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setProfileImage(null);
    }
  };

  const handleRemoveMediaFile = async (fileToRemove, index) => {
    if (!isNew && fileToRemove.existing) {
      try {
        setLoading(true);
        // Find the image ID from the original seller data
        const originalSeller = await apiService.getSeller(id);
        const imageToDelete = originalSeller.data.seller.images.find(img => img.url === fileToRemove.url);

        if (imageToDelete) {
          await apiService.deleteSellerImage(id, imageToDelete._id);
        }

        // Remove from local state
        const updatedFiles = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(updatedFiles);
        showToast("Image removed successfully", "success");
      } catch (error) {
        console.error("Failed to remove image:", error);
        showToast("Failed to remove image", "error");
      } finally {
        setLoading(false);
      }
    } else {
      // For new files, just remove from local state
      const updatedFiles = mediaFiles.filter((_, i) => i !== index);
      setMediaFiles(updatedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Safeguard against undefined ID when not creating a new seller
    if (!isNew && (!id || id === 'undefined')) {
      showToast("Error: No seller ID provided. Cannot update.", "error");
      return;
    }

    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = ["businessName", "email"];
      if (isNew) {
        requiredFields.push("password");
      }
      const missingFields = requiredFields.filter(field => !seller[field]);

      if (missingFields.length > 0) {
        showToast(`Please fill in the following required fields: ${missingFields.join(", ")}`, "error");
        setLoading(false);
        return;
      }

      // Validate starting price if provided
      if (seller.startingPrice && isNaN(parseFloat(seller.startingPrice))) {
        showToast("Please enter a valid starting price", "error");
        setLoading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();

      // Add all seller fields to FormData
      Object.keys(seller).forEach(key => {
        if (seller[key] !== undefined && seller[key] !== null && key !== 'id') {
          // IMPORTANT: Check for FAQ BEFORE checking if it's an array
          // because FAQ is an array of objects and needs special handling
          if (key === 'faq') {
            // FAQ needs to be sent as JSON string
            console.log('FAQ before stringify:', seller[key]);
            formData.append('faq', JSON.stringify(seller[key]));
            console.log('FAQ after stringify:', JSON.stringify(seller[key]));
          } else if (Array.isArray(seller[key])) {
            // Handle other array fields (strings only)
            // Filter out empty strings before sending
            const filteredArray = seller[key].filter(item =>
              typeof item !== 'object' && item && item.toString().trim()
            );
            filteredArray.forEach(item => {
              formData.append(`${key}[]`, item);
            });
          } else {
            formData.append(key, seller[key]);
          }
        }
      });

      // Add profile image
      if (profileImage && !profileImage.existing) {
        formData.append('profileImage', profileImage);
      }

      // Add media files
      mediaFiles.forEach((file, index) => {
        if (!file.existing && file instanceof File) {
          formData.append('images', file);
        }
      });

      if (isNew) {
        console.log("Creating seller with formData keys:", Array.from(formData.keys()));
        console.log("FAQ being sent:", formData.get('faq'));
        await apiService.createSeller(formData);
        showToast("Seller created successfully!");
      } else {
        console.log("Updating seller with ID:", id);
        console.log("FormData keys:", Array.from(formData.keys()));
        console.log("FAQ being sent:", formData.get('faq'));
        // Log all entries except files
        for (let [key, value] of formData.entries()) {
          if (!(value instanceof File)) {
            console.log(`${key}:`, value);
          }
        }
        await apiService.updateSeller(id, formData);
        showToast("Seller updated successfully!");
      }

      navigate("/admin/venue");
    } catch (error) {
      console.error("Failed to save seller", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Error saving seller";

      if (error.response?.data?.errors) {
        // Handle validation errors array
        errorMessage = `Validation errors: ${error.response.data.errors.join(', ')}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const MultiSelectInput = ({ label, options, selectedValues, onChange, placeholder }) => (
    <div>
      <label className="block font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selectedValues, option]);
                } else {
                  onChange(selectedValues.filter(item => item !== option));
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">Selected: {selectedValues.join(", ")}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-8">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                {isNew ? "Add New Seller" : "Edit Seller Details"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700">Business Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="businessName"
                      value={seller.businessName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={seller.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>

                  {isNew && (
                    <div>
                      <label className="block font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        name="password"
                        value={seller.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required
                        placeholder="Enter password for the seller"
                        minLength="6"
                      />
                      <p className="mt-1 text-xs text-gray-500">Minimum 6 characters. The seller will use this to log in.</p>
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={seller.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Business Type</label>
                    <select
                      name="businessType"
                      value={seller.businessType}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="">Select Business Type</option>
                      <option value="Wedding Hall">Wedding Hall</option>
                      <option value="Conference Center">Conference Center</option>
                      <option value="Party Venue">Party Venue</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Banquet Hall">Banquet Hall</option>
                      <option value="Event Space">Event Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={seller.location}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Starting Price (₹)</label>
                    <input
                      type="number"
                      name="startingPrice"
                      value={seller.startingPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      value={seller.address}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={seller.description}
                      onChange={handleChange}
                      rows={4}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Describe your venue, services, and what makes it special..."
                    />
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Venue Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700">Max Persons Allowed</label>
                    <input
                      type="number"
                      name="maxPersonsAllowed"
                      value={seller.maxPersonsAllowed}
                      onChange={handleChange}
                      min="1"
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Total Halls</label>
                    <input
                      type="number"
                      name="totalHalls"
                      value={seller.totalHalls}
                      onChange={handleChange}
                      min="1"
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Rooms Available</label>
                    <input
                      type="number"
                      name="roomsAvailable"
                      value={seller.roomsAvailable}
                      onChange={handleChange}
                      min="1"
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Working Times</label>
                    <input
                      type="text"
                      name="workingTimes"
                      value={seller.workingTimes}
                      onChange={handleChange}
                      placeholder="e.g., 9:00 AM - 11:00 PM"
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Working Dates</label>
                    <input
                      type="text"
                      name="workingDates"
                      value={seller.workingDates}
                      onChange={handleChange}
                      placeholder="e.g., Monday to Sunday"
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">Booking Opens</label>
                    <input
                      type="text"
                      name="bookingOpens"
                      value={seller.bookingOpens}
                      onChange={handleChange}
                      placeholder="e.g., 6 months in advance"
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block font-medium text-gray-700">Booking Policy</label>
                    <textarea
                      name="bookingPolicy"
                      value={seller.bookingPolicy}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Describe your booking policies, cancellation terms, etc."
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block font-medium text-gray-700">Enquiry Details</label>
                    <textarea
                      name="enquiryDetails"
                      value={seller.enquiryDetails}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Contact information for enquiries, special instructions, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Amenities and Features */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <MultiSelectInput
                    label="Amenities"
                    options={amenityOptions}
                    selectedValues={seller.amenity}
                    onChange={(value) => handleArrayChange('amenity', value)}
                  />

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">Food Types</label>
                    <textarea
                      value={seller.foodType.join(', ')}
                      onChange={(e) => {
                        const items = e.target.value.split(/[,\n]/).map(item => item.trim()).filter(item => item);
                        handleArrayChange('foodType', items);
                      }}
                      rows={6}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Vegetarian, Non-Vegetarian, Vegan&#10;or&#10;Vegetarian&#10;Non-Vegetarian&#10;Vegan"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter food types separated by commas or press Enter for new line. Each item will be shown on a separate line.</p>
                    {seller.foodType.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Current: {seller.foodType.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  <MultiSelectInput
                    label="Additional Features"
                    options={additionalFeaturesOptions}
                    selectedValues={seller.additionalFeatures}
                    onChange={(value) => handleArrayChange('additionalFeatures', value)}
                  />
                </div>
              </div>

              {/* Package Details - Included/Excluded/FAQ */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-indigo-600" />
                  Package Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">What's Included (one per line or comma-separated)</label>
                    <textarea
                      value={seller.included.join('\n')}
                      onChange={(e) => {
                        // Split by both newlines and commas
                        const items = e.target.value.split(/[\n,]/).map(item => item.trim());
                        handleArrayChange('included', items);
                      }}
                      rows={5}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Welcome Drink, Decorations, Music System&#10;or&#10;Welcome Drink&#10;Decorations&#10;Music System"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter items separated by commas or press Enter for new line. Each item will be shown on a separate line. Empty items will be removed when saving.</p>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">What's Not Included (one per line or comma-separated)</label>
                    <textarea
                      value={seller.excluded.join('\n')}
                      onChange={(e) => {
                        // Split by both newlines and commas
                        const items = e.target.value.split(/[\n,]/).map(item => item.trim());
                        handleArrayChange('excluded', items);
                      }}
                      rows={5}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Catering, Photography, Transport&#10;or&#10;Catering&#10;Photography&#10;Transport"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter items separated by commas or press Enter for new line. Each item will be shown on a separate line. Empty items will be removed when saving.</p>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">FAQ (Frequently Asked Questions)</label>
                    <div className="space-y-4">
                      {seller.faq.map((item, index) => (
                        <div key={index} className="p-4 bg-white border border-gray-300 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const newFaq = seller.faq.filter((_, i) => i !== index);
                                handleArrayChange('faq', newFaq);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.question || ''}
                            onChange={(e) => {
                              const newFaq = [...seller.faq];
                              newFaq[index] = { ...newFaq[index], question: e.target.value };
                              handleArrayChange('faq', newFaq);
                            }}
                            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Enter question"
                          />
                          <textarea
                            value={item.answer || ''}
                            onChange={(e) => {
                              const newFaq = [...seller.faq];
                              newFaq[index] = { ...newFaq[index], answer: e.target.value };
                              handleArrayChange('faq', newFaq);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Enter answer"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          handleArrayChange('faq', [...seller.faq, { question: '', answer: '' }]);
                        }}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        + Add FAQ
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Add common questions and their answers to help potential clients.</p>
                  </div>
                </div>
              </div>

              {/* Media Upload */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-purple-600" />
                  Photos & Videos
                </h2>



                {/* Media Gallery */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Gallery Images & Videos</label>
                  <MultiMediaUpload
                    files={mediaFiles}
                    onFilesChange={setMediaFiles}
                    onRemoveFile={handleRemoveMediaFile}
                    maxFiles={20}
                    acceptedTypes="image/*,video/*"
                    maxFileSize={50 * 1024 * 1024} // 50MB for videos
                  />
                </div>
              </div>

              {/* Status Settings */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Status Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="verified"
                      checked={seller.verified}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Verified</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="approved"
                      checked={seller.approved}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Approved</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="blocked"
                      checked={seller.blocked}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Blocked</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/venue")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader size="tiny" inline text="" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isNew ? 'Create Seller' : 'Update Seller'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 rounded-lg shadow-lg p-4 max-w-sm w-full transition-all transform duration-300 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}>
          <div className="flex items-center">
            {toast.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-white mr-2" />
            ) : (
              <AlertCircle className="w-6 h-6 text-white mr-2" />
            )}
            <p className="text-white">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSeller;
