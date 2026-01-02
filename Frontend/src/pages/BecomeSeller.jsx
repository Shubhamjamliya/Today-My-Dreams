import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSeller } from '../context/SellerContext';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { Upload, X, ArrowRight, Eye, EyeOff, PartyPopper, Building2, MapPin, Star } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { register, loading, seller } = useSeller();
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    businessType: '',
    location: '',
    description: '',
    startingPrice: '',
    maxPersonsAllowed: 50,
    amenity: [],
    totalHalls: 1,
    enquiryDetails: '',
    bookingOpens: '',
    workingTimes: '',
    workingDates: '',
    foodType: [],
    roomsAvailable: 1,
    bookingPolicy: '',
    additionalFeatures: [],
    included: [],
    excluded: [],
    faq: []
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

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
    if (seller) {
      navigate('/dashboard/profile');
    }
  }, [seller, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedImages.length > 10) {
      toast.error('You can upload a maximum of 10 images.');
      return;
    }

    const newImages = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5MB size limit.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file.`);
        return false;
      }
      return true;
    });

    setSelectedImages(prev => [...prev, ...newImages]);

    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, { file, url: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const { businessName, email, password, confirmPassword } = formData;
    if (!businessName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const { confirmPassword, ...registerData } = formData;
      const submitData = new FormData();
      
      // Add all seller fields to FormData
      Object.keys(registerData).forEach(key => {
        if (registerData[key] !== undefined && registerData[key] !== null) {
          // Handle FAQ array of objects
          if (key === 'faq') {
            submitData.append('faq', JSON.stringify(registerData[key]));
          } else if (Array.isArray(registerData[key])) {
            // Handle other array fields (amenity, foodType, additionalFeatures, included, excluded)
            const filteredArray = registerData[key].filter(item => 
              typeof item !== 'object' && item && item.toString().trim()
            );
            filteredArray.forEach(item => {
              submitData.append(`${key}[]`, item);
            });
          } else {
            submitData.append(key, registerData[key]);
          }
        }
      });
      
      // Add images
      selectedImages.forEach(image => {
        submitData.append('images', image);
      });
      
      await register(submitData);
      toast.success('Welcome! Your seller account is created.');
    } catch (error) {
      const message = error.message || 'An unexpected error occurred.';
      if (message.includes('auth/email-already-in-use')) {
        toast.error('This email is already registered.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  const MultiSelectInput = ({ label, options, selectedValues, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 bg-white">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
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
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-sm text-slate-700">{option}</span>
          </label>
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-slate-500">Selected: {selectedValues.join(", ")}</span>
        </div>
      )}
    </div>
  );

  if (loading && !seller) {
    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-amber-50/50"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        >
            <Loader text="Creating Your Seller Account..." />
        </div>
    );
  }

  return (
    <div 
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
    >
      <div className="max-w-3xl w-full mx-auto space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center"
        >
          <PartyPopper className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold font-serif text-slate-900 sm:text-5xl">
            Become a Celebration Partner
          </h2>
          <p className="mt-4 text-xs text-slate-600">
            Join our curated marketplace of artisans and venue owners. Let's make every event unforgettable.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            Already a celebration partner?{' '}
            <button 
              onClick={() => navigate('/dashboard/auth')} 
              className="text-amber-600 hover:text-amber-700 font-semibold focus:outline-none focus:underline transition-colors"
            >
              Sign in here
            </button>
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="bg-white py-10 px-6 sm:px-10 shadow-2xl shadow-amber-200/50 rounded-2xl border border-amber-200/60"
        >
          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* Basic Information */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-amber-500" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700">Business Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="businessName" 
                    id="businessName" 
                    required 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.businessName} 
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    required 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.email} 
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    id="phone" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.phone} 
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-semibold text-slate-700">Business Type</label>
                  <select 
                    name="businessType" 
                    id="businessType" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.businessType}
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
                  <label htmlFor="location" className="block text-sm font-semibold text-slate-700">Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    id="location" 
                    placeholder="e.g., Bhubaneswar, Odisha" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.location} 
                  />
                </div>

                <div>
                  <label htmlFor="startingPrice" className="block text-sm font-semibold text-slate-700">Starting Price (₹)</label>
                  <input 
                    type="number" 
                    name="startingPrice" 
                    id="startingPrice" 
                    placeholder="e.g., 5000" 
                    min="0" 
                    step="0.01"
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.startingPrice} 
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-slate-700">Address</label>
                  <textarea 
                    name="address" 
                    id="address" 
                    rows={3} 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition resize-none" 
                    onChange={handleChange} 
                    value={formData.address} 
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700">Description</label>
                  <textarea 
                    name="description" 
                    id="description" 
                    rows={4} 
                    placeholder="Describe your venue, services, and what makes it special..." 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition resize-none" 
                    onChange={handleChange} 
                    value={formData.description} 
                  />
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Venue Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="maxPersonsAllowed" className="block text-sm font-semibold text-slate-700">Max Persons Allowed</label>
                  <input 
                    type="number" 
                    name="maxPersonsAllowed" 
                    id="maxPersonsAllowed" 
                    min="1" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.maxPersonsAllowed} 
                  />
                </div>

                <div>
                  <label htmlFor="totalHalls" className="block text-sm font-semibold text-slate-700">Total Halls</label>
                  <input 
                    type="number" 
                    name="totalHalls" 
                    id="totalHalls" 
                    min="1" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.totalHalls} 
                  />
                </div>

                <div>
                  <label htmlFor="roomsAvailable" className="block text-sm font-semibold text-slate-700">Rooms Available</label>
                  <input 
                    type="number" 
                    name="roomsAvailable" 
                    id="roomsAvailable" 
                    min="1" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.roomsAvailable} 
                  />
                </div>

                <div>
                  <label htmlFor="workingTimes" className="block text-sm font-semibold text-slate-700">Working Times</label>
                  <input 
                    type="text" 
                    name="workingTimes" 
                    id="workingTimes" 
                    placeholder="e.g., 9:00 AM - 11:00 PM" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.workingTimes} 
                  />
                </div>

                <div>
                  <label htmlFor="workingDates" className="block text-sm font-semibold text-slate-700">Working Dates</label>
                  <input 
                    type="text" 
                    name="workingDates" 
                    id="workingDates" 
                    placeholder="e.g., Monday to Sunday" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.workingDates} 
                  />
                </div>

                <div>
                  <label htmlFor="bookingOpens" className="block text-sm font-semibold text-slate-700">Booking Opens</label>
                  <input 
                    type="text" 
                    name="bookingOpens" 
                    id="bookingOpens" 
                    placeholder="e.g., 6 months in advance" 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" 
                    onChange={handleChange} 
                    value={formData.bookingOpens} 
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label htmlFor="bookingPolicy" className="block text-sm font-semibold text-slate-700">Booking Policy</label>
                  <textarea 
                    name="bookingPolicy" 
                    id="bookingPolicy" 
                    rows={3} 
                    placeholder="Describe your booking policies, cancellation terms, etc." 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition resize-none" 
                    onChange={handleChange} 
                    value={formData.bookingPolicy} 
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label htmlFor="enquiryDetails" className="block text-sm font-semibold text-slate-700">Enquiry Details</label>
                  <textarea 
                    name="enquiryDetails" 
                    id="enquiryDetails" 
                    rows={3} 
                    placeholder="Contact information for enquiries, special instructions, etc." 
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition resize-none" 
                    onChange={handleChange} 
                    value={formData.enquiryDetails} 
                  />
                </div>
              </div>
            </div>

            {/* Amenities and Features */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Amenities & Features
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MultiSelectInput
                  label="Amenities"
                  options={amenityOptions}
                  selectedValues={formData.amenity}
                  onChange={(value) => handleArrayChange('amenity', value)}
                />
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Food Types</label>
                  <textarea
                    value={formData.foodType.join(', ')}
                    onChange={(e) => {
                      const items = e.target.value.split(/[,\n]/).map(item => item.trim()).filter(item => item);
                      handleArrayChange('foodType', items);
                    }}
                    rows={6}
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition resize-none"
                    placeholder="Vegetarian, Non-Vegetarian, Vegan&#10;or&#10;Vegetarian&#10;Non-Vegetarian&#10;Vegan"
                  />
                  <p className="mt-1 text-xs text-slate-500">Enter food types separated by commas or press Enter for new line. Each item will be shown on a separate line.</p>
                  {formData.foodType.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-slate-500">Current: {formData.foodType.join(", ")}</span>
                    </div>
                  )}
                </div>
                
                <MultiSelectInput
                  label="Additional Features"
                  options={additionalFeaturesOptions}
                  selectedValues={formData.additionalFeatures}
                  onChange={(value) => handleArrayChange('additionalFeatures', value)}
                />
              </div>
            </div>

            {/* Package Details - Included/Excluded/FAQ */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <Star className="w-5 h-5 mr-2 text-indigo-600" />
                Package Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">What's Included (one per line or comma-separated)</label>
                  <textarea
                    value={formData.included.join('\n')}
                    onChange={(e) => {
                      const items = e.target.value.split(/[\n,]/).map(item => item.trim());
                      handleArrayChange('included', items);
                    }}
                    rows={5}
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition resize-none"
                    placeholder="Welcome Drink, Decorations, Music System&#10;or&#10;Welcome Drink&#10;Decorations&#10;Music System"
                  />
                  <p className="mt-1 text-xs text-slate-500">Enter items separated by commas or press Enter for new line. Each item will be shown on a separate line. Empty items will be removed when saving.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">What's Not Included (one per line or comma-separated)</label>
                  <textarea
                    value={formData.excluded.join('\n')}
                    onChange={(e) => {
                      const items = e.target.value.split(/[\n,]/).map(item => item.trim());
                      handleArrayChange('excluded', items);
                    }}
                    rows={5}
                    className="mt-1 block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition resize-none"
                    placeholder="Catering, Photography, Transport&#10;or&#10;Catering&#10;Photography&#10;Transport"
                  />
                  <p className="mt-1 text-xs text-slate-500">Enter items separated by commas or press Enter for new line. Each item will be shown on a separate line. Empty items will be removed when saving.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">FAQ (Frequently Asked Questions)</label>
                  <div className="space-y-4">
                    {formData.faq.map((item, index) => (
                      <div key={index} className="p-4 bg-white border border-slate-300 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-900">Question {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const newFaq = formData.faq.filter((_, i) => i !== index);
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
                            const newFaq = [...formData.faq];
                            newFaq[index] = { ...newFaq[index], question: e.target.value };
                            handleArrayChange('faq', newFaq);
                          }}
                          className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder="Enter question"
                        />
                        <textarea
                          value={item.answer || ''}
                          onChange={(e) => {
                            const newFaq = [...formData.faq];
                            newFaq[index] = { ...newFaq[index], answer: e.target.value };
                            handleArrayChange('faq', newFaq);
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                          placeholder="Enter answer"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        handleArrayChange('faq', [...formData.faq, { question: '', answer: '' }]);
                      }}
                      className="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors"
                    >
                      + Add FAQ
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Add common questions and their answers to help potential clients.</p>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Set Your Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      id="password" 
                      required 
                      minLength="6"
                      className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition pr-10" 
                      onChange={handleChange} 
                      value={formData.password} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none" 
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="confirmPassword" 
                      id="confirmPassword" 
                      required 
                      className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition pr-10" 
                      onChange={handleChange} 
                      value={formData.confirmPassword} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none" 
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Upload */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Gallery Images</h3>
              <div className="space-y-4">
                <div className="flex justify-center p-8 bg-white border-2 border-amber-300 border-dashed rounded-xl hover:bg-amber-50/50 transition-colors cursor-pointer">
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-12 w-12 text-amber-500" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-transparent rounded-md font-semibold text-amber-600 hover:text-amber-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                        <span>Click to upload images</span>
                        <input 
                          id="image-upload" 
                          name="images" 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="sr-only" 
                          onChange={handleImageChange} 
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB each (max 10 images)</p>
                  </div>
                </div>
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={preview.url} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg border-2 border-slate-200 group-hover:border-amber-400 transition-colors" 
                        />
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-lg text-base font-semibold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 transition-all"
              >
                  {loading ? (
                      <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Creating Account...
                      </span>
                  ) : (
                      <span className="flex items-center">
                          Create My Seller Account
                          <ArrowRight className="w-5 h-5 ml-2" />
                      </span>
                  )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Already a celebration partner?{' '}
              <button onClick={() => navigate('/dashboard/auth')} className="text-amber-600 hover:text-amber-700 font-semibold focus:outline-none focus:underline">
                Sign in here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BecomeSeller;