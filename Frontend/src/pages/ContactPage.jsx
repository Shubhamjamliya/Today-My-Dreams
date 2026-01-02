import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { ChevronRightIcon, ChevronLeftIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useCity } from '../context/CityContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

const ContactInfoRow = ({ icon, title, details, href }) => (
  <motion.a
    href={href}
    variants={itemVariants}
    className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
  >
    <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
      {icon}
    </div>
    <div className="flex-grow">
      <h3 className="font-semibold text-stone-800">{title}</h3>
      <p className="text-sm text-stone-500">{details}</p>
    </div>
    <ChevronRightIcon className="w-5 h-5 text-gray-300" />
  </motion.a>
);

const ContactPage = () => {
  const { selectedCityData } = useCity();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const recipientEmail = "support@decoryy.com";
  const subject = encodeURIComponent(`Inquiry from ${formData.name}`);
  const body = encodeURIComponent(
    `Hello,\n\n${formData.message}\n\n---\nFrom: ${formData.name}\nEmail: ${formData.email}`
  );
  const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

  // Get contact number from city data or use default
  const contactNumber = selectedCityData?.contactNumber || '+917739873442';
  const cityName = selectedCityData?.name || 'Arrah';
  const stateName = selectedCityData?.state || 'Bihar';

  return (
    <div className="flex items-center flex-col justify-center">
      {/* Mobile App Frame */}
      <div className="w-full max-w-md md:max-w-5xl h-full bg-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row p-4">

        {/* Left Column (Header + Form) */}
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-200 flex-shrink-0 md:border-b-0 md:border-r">
            <Link to={"/"}>
              <ChevronLeftIcon className="w-6 h-6 text-stone-700" />
            </Link>
            <h1 className="text-xl font-bold text-stone-900">Contact Us</h1>
            <EllipsisHorizontalIcon className="w-6 h-6 text-stone-700" />
          </header>

          <main className="flex-grow overflow-y-auto p-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <h2 className="font-display text-2xl font-bold text-stone-900 mb-4">Send a Message</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input
                      type="text" id="name" placeholder="Your Name"
                      className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      type="email" id="email" placeholder="you@example.com"
                      className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="sr-only">Message</label>
                    <textarea
                      id="message" rows="5" placeholder="How can we help?"
                      className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div>
                    <motion.a
                      href={mailtoLink}
                      className="block text-center w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-amber-600 transform hover:-translate-y-0.5 transition-all duration-300"
                      whileTap={{ scale: 0.98 }}
                    >
                      Send Inquiry
                    </motion.a>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </main>
        </div>

        {/* Right Column (Contact Info) - visible side by side only on desktop */}
        <div className=" md:flex flex-col flex-1 p-6 bg-gray-50 overflow-y-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-4">Get in Touch</h2>
            <ContactInfoRow
              icon={<FaEnvelope className="w-5 h-5" />}
              title="Email Us"
              details={recipientEmail}
              href={`mailto:${recipientEmail}`}
            />
            <ContactInfoRow
              icon={<FaPhoneAlt className="w-5 h-5" />}
              title="Call Us"
              details={contactNumber}
              href={`tel:${contactNumber}`}
            />
            <ContactInfoRow
              icon={<FaMapMarkerAlt className="w-5 h-5" />}
              title="Our Office"
              details={`${cityName}, ${stateName}, India`}
              href="#"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
