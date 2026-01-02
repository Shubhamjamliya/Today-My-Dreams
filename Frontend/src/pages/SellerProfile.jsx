import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeller } from '../context/SellerContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import {
    FiUser, FiLogOut, FiEdit3, FiImage
} from 'react-icons/fi';

// Animation Variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const SellerProfile = () => {
    const { seller, loading, updateProfile, logout, fetchProfile } = useSeller();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        businessName: '', phone: '', address: '', businessType: '',
        maxPersonsAllowed: '', description: '', startingPrice: '', location: '',
        included: '', excluded: '', faq: '[]'
    });

    const [fullyLoaded, setFullyLoaded] = useState(false);

    // --- DATA FETCHING & MANAGEMENT ---
    useEffect(() => {
        const loadInitialData = async () => {
            setFullyLoaded(false);
            try {
                const token = localStorage.getItem('seller_jwt');
                if (!token) {
                    logout();
                    navigate('/dashboard/auth');
                    return;
                }
                if (!seller) await fetchProfile(token);
            } finally {
                setFullyLoaded(true);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (seller) {
            setFormData({
                businessName: seller.businessName || '',
                phone: seller.phone || '',
                address: seller.address || '',
                businessType: seller.businessType || '',
                location: seller.location || '',
                maxPersonsAllowed: seller.maxPersonsAllowed || '',
                description: seller.description || '',
                startingPrice: seller.startingPrice || '',
                included: seller.included ? (Array.isArray(seller.included) ? seller.included.join('\n') : seller.included) : '',
                excluded: seller.excluded ? (Array.isArray(seller.excluded) ? seller.excluded.join('\n') : seller.excluded) : '',
                faq: seller.faq ? JSON.stringify(seller.faq, null, 2) : '[]',
            });
        }
    }, [seller]);

    // --- EVENT HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Process formData to convert strings to arrays for included/excluded
            const processedData = {
                ...formData,
                included: formData.included ? formData.included.split(/[\n,]/).map(item => item.trim()).filter(item => item) : [],
                excluded: formData.excluded ? formData.excluded.split(/[\n,]/).map(item => item.trim()).filter(item => item) : [],
                faq: formData.faq ? JSON.parse(formData.faq) : []
            };
            await updateProfile(processedData);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to update profile.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/dashboard/auth');
        toast.success("You've been logged out.");
    };

    // --- RENDER LOGIC ---
    if (!fullyLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50/50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
                <Loader size="large" text="Loading Your Dashboard..." />
            </div>
        );
    }

    if (!seller) return null;

    const safeSeller = {
        ...seller,
        businessName: seller.businessName || 'N/A',
        images: Array.isArray(seller.images) ? seller.images : [],
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: FiUser },
    ];

    // --- JSX ---
    return (
        <div className="min-h-screen bg-amber-50/50 font-sans" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDE68A' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-2xl shadow-amber-200/50 overflow-hidden border border-amber-200/60">
                    
                    {/* Header */}
                    <header className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold font-serif text-slate-900">Partner Dashboard</h1>
                                <p className="text-md text-slate-600 mt-1">Welcome back, <span className="font-semibold">{safeSeller.businessName}</span>!</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-300 text-sm font-semibold">
                                    <FiLogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </motion.button>
                            </div>
                        </div>
                    </header>

                    {/* Tabs Navigation */}
                    <nav className="border-b border-slate-200 bg-white">
                        <div className="flex flex-wrap space-x-2 px-4 sm:px-8 py-2">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-3 sm:px-5 py-3 rounded-lg font-semibold transition-all duration-300 text-sm ${
                                        activeTab === tab.id
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-amber-100/60'
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5 mr-2" />
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>
                    </nav>

                    {/* Tab Content */}
                    <main className="p-6 sm:p-8">
                        <AnimatePresence mode="wait">
                            {/* PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <motion.div key="profile" variants={fadeIn} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <h2 className="text-2xl font-bold font-serif text-slate-800">Business Profile</h2>
                                        {!isEditing && (
                                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)} className="flex items-center px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm font-semibold">
                                                <FiEdit3 className="w-4 h-4 mr-2" />
                                                Edit Profile
                                            </motion.button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <motion.form variants={fadeIn} onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                                            {/* --- ✅ UPDATED FORM FIELDS START --- */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} />
                                                <FormField label="Business Type" name="businessType" value={formData.businessType} onChange={handleChange} />
                                                <FormField label="Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                                                <FormField label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Bhubaneswar, Odisha" />
                                                <FormField label="Starting Price (₹)" name="startingPrice" value={formData.startingPrice} onChange={handleChange} type="number" />
                                                <FormField label="Max Persons Allowed" name="maxPersonsAllowed" value={formData.maxPersonsAllowed} onChange={handleChange} type="number" />
                                            
                                            
                                            </div>
                                            <FormField label="Address" name="address" value={formData.address} onChange={handleChange} type="textarea" />
                                            <FormField label="Description" name="description" value={formData.description} onChange={handleChange} type="textarea" />
                                            
                                            {/* Package Details Fields */}
                                            <div className="col-span-2 bg-white p-4 rounded-lg border border-amber-200">
                                                <h4 className="font-semibold text-lg mb-4 text-amber-700">Package Details</h4>
                                                <div className="space-y-4">
                                                    <FormField 
                                                        label="What's Included (comma or line separated)" 
                                                        name="included" 
                                                        value={formData.included} 
                                                        onChange={handleChange} 
                                                        type="textarea"
                                                        placeholder="Welcome Drink, Decorations, Music System&#10;or use Enter for new lines"
                                                    />
                                                    <FormField 
                                                        label="What's Excluded (comma or line separated)" 
                                                        name="excluded" 
                                                        value={formData.excluded} 
                                                        onChange={handleChange} 
                                                        type="textarea"
                                                        placeholder="Catering, Photography, Transport&#10;or use Enter for new lines"
                                                    />
                                                    <FormField 
                                                        label="FAQ (JSON format)" 
                                                        name="faq" 
                                                        value={formData.faq} 
                                                        onChange={handleChange} 
                                                        type="textarea"
                                                        placeholder='[{"question": "What is the cancellation policy?", "answer": "Full refund if cancelled 7 days before"}]'
                                                    />
                                                </div>
                                            </div>
                                            {/* --- ✅ UPDATED FORM FIELDS END --- */}
                                            <div className="flex justify-end gap-4">
                                                <motion.button type="button" onClick={() => setIsEditing(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-300 font-semibold">Cancel</motion.button>
                                                <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm font-semibold">Save Changes</motion.button>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoCard label="Business Name" value={safeSeller.businessName} />
                                            <InfoCard label="Email" value={safeSeller.email} />
                                            <InfoCard label="Phone" value={safeSeller.phone} />
                                            <InfoCard label="Business Type" value={safeSeller.businessType} />
                                            <InfoCard label="Location" value={safeSeller.location} />
                                            <InfoCard label="Starting Price" value={safeSeller.startingPrice ? `₹${safeSeller.startingPrice}` : 'Not provided'} />
                                            <InfoCard label="Max Persons Allowed" value={safeSeller.maxPersonsAllowed} />
                                            <InfoCard label="Total Halls" value={safeSeller.totalHalls || 'Not specified'} />
                                            <InfoCard label="Address" value={safeSeller.address} />
                                            <InfoCard label="Description" value={safeSeller.description} className="md:col-span-2" />
                                            
                                            {/* New Fields */}
                                            {safeSeller.amenity && safeSeller.amenity.length > 0 && (
                                                <InfoCard 
                                                    label="Amenities" 
                                                    value={safeSeller.amenity.join(', ')} 
                                                    className="md:col-span-2" 
                                                />
                                            )}
                {safeSeller.enquiryDetails && (
                    <InfoCard
                        label="Enquiry Details"
                        value={safeSeller.enquiryDetails}
                        className="md:col-span-2"
                    />
                )}
                
                {/* Enhanced Venue Details */}
                {safeSeller.bookingOpens && (
                    <InfoCard
                        label="Booking Opens"
                        value={safeSeller.bookingOpens}
                    />
                )}
                {safeSeller.workingTimes && (
                    <InfoCard
                        label="Working Times"
                        value={safeSeller.workingTimes}
                    />
                )}
                {safeSeller.workingDates && (
                    <InfoCard
                        label="Working Dates"
                        value={safeSeller.workingDates}
                    />
                )}
                {safeSeller.foodType && safeSeller.foodType.length > 0 && (
                    <InfoCard
                        label="Food Types"
                        value={safeSeller.foodType.join(', ')}
                        className="md:col-span-2"
                    />
                )}
                <InfoCard
                    label="Rooms Available"
                    value={safeSeller.roomsAvailable || 'Not specified'}
                />
                {safeSeller.bookingPolicy && (
                    <InfoCard
                        label="Booking Policy"
                        value={safeSeller.bookingPolicy}
                        className="md:col-span-2"
                    />
                )}
                {safeSeller.additionalFeatures && safeSeller.additionalFeatures.length > 0 && (
                    <InfoCard
                        label="Additional Features"
                        value={safeSeller.additionalFeatures.join(', ')}
                        className="md:col-span-2"
                    />
                )}

                {safeSeller.included && safeSeller.included.length > 0 && (
                    <InfoCard
                        label="What's Included"
                        value={safeSeller.included.join(', ')}
                        className="md:col-span-2"
                    />
                )}

                {safeSeller.excluded && safeSeller.excluded.length > 0 && (
                    <InfoCard
                        label="What's Not Included"
                        value={safeSeller.excluded.join(', ')}
                        className="md:col-span-2"
                    />
                )}

                {safeSeller.faq && safeSeller.faq.length > 0 && (
                    <div className="md:col-span-2 bg-slate-50 p-5 rounded-lg border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-500 mb-3">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                            {safeSeller.faq.map((faqItem, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-900 mb-1">Q: {faqItem.question}</h4>
                                    <p className="text-slate-700">A: {faqItem.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                                            
                                            <InfoCard 
                                                label="Approved Status" 
                                                value={safeSeller.approved ? "✅ Approved" : "⏳ Pending"} 
                                            />
                                            <InfoCard 
                                                label="Blocked Status" 
                                                value={safeSeller.blocked ? "🚫 Blocked" : "✔️ Active"} 
                                            />
                                        </div>
                                    )}

                                    {safeSeller.images.length > 0 && (
                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                            <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center"><FiImage className="w-6 h-6 mr-3 text-amber-500" />Your Business Gallery</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {safeSeller.images.map((image, index) => (
                                                    <motion.div key={index} whileHover={{ scale: 1.05 }} className="relative group aspect-square">
                                                        <img src={image.url} alt={`Business image ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md border-2 border-white" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </motion.div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---
const InfoCard = ({ label, value, className = '' }) => (
    <div className={`bg-slate-50 p-5 rounded-lg border border-slate-200 ${className}`}>
        <h3 className="text-sm font-semibold text-slate-500">{label}</h3>
        <p className="text-md text-slate-800 mt-1 break-words">{value || 'Not provided'}</p>
    </div>
);

const FormField = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-slate-700">{label}</label>
        {type === 'textarea' ? (
            <textarea id={name} name={name} value={value} onChange={onChange} rows="4" placeholder={placeholder} className="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" />
        ) : (
            <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition" />
        )}
    </div>
);

export default SellerProfile;