import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { cityAPI } from '../services/api';

const CityContext = createContext();

export const useCity = () => {
    const context = useContext(CityContext);
    if (!context) {
        throw new Error('useCity must be used within a CityProvider');
    }
    return context;
};

export const CityProvider = ({ children }) => {
    const [selectedCity, setSelectedCity] = useState(() => {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const cityFromUrl = urlParams.get('city');

        if (cityFromUrl) {
            // Save to localStorage
            localStorage.setItem('selectedCity', cityFromUrl);
            return cityFromUrl;
        }

        // Get from localStorage or return null (no default city)
        return localStorage.getItem('selectedCity') || null;
    });

    const [selectedCityId, setSelectedCityId] = useState(() => {
        return localStorage.getItem('selectedCityId') || null;
    });

    const [selectedCityData, setSelectedCityData] = useState(() => {
        const storedData = localStorage.getItem('selectedCityData');
        return storedData ? JSON.parse(storedData) : null;
    });

    const [shouldShowCityModal, setShouldShowCityModal] = useState(() => {
        // Show modal on first load if no city is selected
        return !localStorage.getItem('selectedCity');
    });

    // Update localStorage when city changes
    useEffect(() => {
        if (selectedCity) {
            localStorage.setItem('selectedCity', selectedCity);
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedCityId) {
            localStorage.setItem('selectedCityId', selectedCityId);
        }
    }, [selectedCityId]);

    useEffect(() => {
        if (selectedCityData) {
            localStorage.setItem('selectedCityData', JSON.stringify(selectedCityData));
        }
    }, [selectedCityData]);

    // Fetch full city details when city is selected
    useEffect(() => {
        const fetchCityDetails = async () => {
            if (selectedCity) {
                try {
                    const response = await cityAPI.getCities();
                    const cities = response.data.cities || [];
                    const cityData = cities.find(city => city.name === selectedCity);
                    if (cityData) {
                        setSelectedCityData(cityData);
                        setSelectedCityId(cityData._id);
                    }
                } catch (error) {
                    // Error fetching city details
                }
            }
        };
        fetchCityDetails();
    }, [selectedCity]);

    // Watch for URL parameter changes
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const cityFromUrl = urlParams.get('city');

        if (cityFromUrl && cityFromUrl !== selectedCity) {
            setSelectedCity(cityFromUrl);

            // Show notification
            toast.success(`📍 Location set to ${cityFromUrl}`, {
                duration: 3000,
                position: 'top-center',
            });

            // Clean up URL (remove the city parameter) after capturing it
            if (window.history && window.history.replaceState) {
                urlParams.delete('city');
                const newUrl = urlParams.toString()
                    ? `${window.location.pathname}?${urlParams.toString()}`
                    : window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, []);

    const updateCity = async (cityName, cityId = null, cityData = null) => {
        const isChanging = selectedCity && selectedCity !== cityName;

        // Update localStorage
        localStorage.setItem('selectedCity', cityName);
        if (cityId) {
            localStorage.setItem('selectedCityId', cityId);
        }
        if (cityData) {
            localStorage.setItem('selectedCityData', JSON.stringify(cityData));
        }

        // Show notification
        toast.success(`📍 Location set to ${cityName}`, {
            duration: 2000,
            position: 'top-center',
        });

        // If city is changing (not first selection), refresh the page
        if (isChanging) {
            setTimeout(() => {
                window.location.reload();
            }, 500); // Small delay to show the toast
        } else {
            // First time selection, just update state
            setSelectedCity(cityName);
            setSelectedCityId(cityId);
            setSelectedCityData(cityData);
            setShouldShowCityModal(false);
        }
    };

    const value = {
        selectedCity,
        selectedCityId,
        selectedCityData,
        setSelectedCity,
        setSelectedCityId,
        setSelectedCityData,
        updateCity,
        shouldShowCityModal,
        setShouldShowCityModal
    };

    return (
        <CityContext.Provider value={value}>
            {children}
        </CityContext.Provider>
    );
};

// export default CityContext;

