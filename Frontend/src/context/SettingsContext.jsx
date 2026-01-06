import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getPublicSettings();
        if (response.data && response.data.success) {
          setSettings(response.data.settings || {});
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Helper to get contact info with fallbacks
  const getContactInfo = () => {
    return {
      email: settings.company_email || 'support@todaymydream.com',
      phone: settings.company_phone || '+91 77398 73442',
      phone2: settings.company_phone_2 || '',
      whatsapp: settings.company_whatsapp || settings.company_phone || '+91 77398 73442',
      address: settings.company_address || 'Prayagraj , Uttar Pradesh ,India',
      socials: {
        facebook: settings.social_facebook || 'https://facebook.com',
        instagram: settings.social_instagram || 'https://instagram.com',
      }
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, getContactInfo }}>
      {children}
    </SettingsContext.Provider>
  );
};
