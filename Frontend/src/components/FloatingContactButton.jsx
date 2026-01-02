import React, { useState } from 'react';
import { FaPhone, FaWhatsapp, FaTimes, FaComments } from 'react-icons/fa';
import { useCity } from '../context/CityContext';

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCityData } = useCity();

  // Get contact number from city data or use default
  const phoneNumber = selectedCityData?.contactNumber || '+917739873442';
  const whatsappNumber = selectedCityData?.contactNumber || '+917739873442';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    // MODIFIED: Positioned to bottom-left with 'left-4' and aligned items to 'items-start'
    <div className="fixed bottom-16 left-4 z-50 flex flex-col items-start gap-3">
      {/* Contact Options - Show when open */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ease-in-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="group flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          aria-label="Contact via WhatsApp"
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <FaWhatsapp className="w-5 h-5" />
          </div>
        </button>

        {/* Call Button - MODIFIED: Background color changed to orange */}
        <button
          onClick={handleCall}
          className="group flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          aria-label="Call us"
        >
          <div className="flex items-center gap-2 px-4 py-3">
          <FaPhone className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-90'
            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
        }`}
        aria-label={isOpen ? 'Close contact menu' : 'Open contact menu'}
      >
        {isOpen ? (
          <FaTimes className="w-6 h-6 text-white" />
        ) : (
          <FaComments className="w-6 h-6 text-white animate-pulse" />
        )}
      </button>

      {/* Ripple effect on main button - MODIFIED: Positioned to the left */}
      {!isOpen && (
        <div className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-orange-500 animate-ping opacity-20 pointer-events-none" />
      )}
    </div>
  );
};

export default FloatingContactButton;   