import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { useCity } from '../context/CityContext';

const ContactInfoBar = () => {
  const { selectedCityData } = useCity();
  const { getContactInfo } = useSettings();
  const { phone } = getContactInfo();

  // Get contact number from city data or use global setting
  const contactNumber = selectedCityData?.contactNumber || phone;
  const cityName = selectedCityData?.name || '';

  return (
    <div className="hidden md:block bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          {cityName && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-amber-400" size={14} />
              <span className="font-medium">Location set to: {cityName}</span>
            </div>
          )}
          <a
            href={`tel:${contactNumber}`}
            className="flex items-center gap-2 hover:text-amber-400 transition-colors"
          >
            <FaPhoneAlt className="text-amber-400 animate-pulse" size={14} />
            <span className="font-medium">Call us: {contactNumber}</span>
          </a>

          {/* Partner Vendor CTA */}
          {/* Partner Vendor CTA */}
          <Link
            to="/vendor/register"
            className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 rounded-full font-bold text-xs hover:scale-105 transition-transform shadow-lg shadow-amber-500/20 animate-pulse ml-4"
          >
            🚀 Become our Partner Vendor in your city
          </Link>
        </div>
        <div className="text-gray-400 text-xs">
          ✨ Available  for your celebrations
        </div>
      </div>
    </div>
  );
};

export default ContactInfoBar;

