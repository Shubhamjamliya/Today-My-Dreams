import React from 'react';
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
        </div>
        <div className="text-gray-400 text-xs">
          ✨ Available  for your celebrations
        </div>
      </div>
    </div>
  );
};

export default ContactInfoBar;

