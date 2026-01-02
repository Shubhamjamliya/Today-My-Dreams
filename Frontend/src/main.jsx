import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';

// Get the Client ID from your environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Prevent browser scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Force scroll to top on page load
const forceScrollToTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

// Handle page load events
window.addEventListener('load', forceScrollToTop);
window.addEventListener('DOMContentLoaded', forceScrollToTop);

// Additional safety for page reload
window.addEventListener('beforeunload', forceScrollToTop);

ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
    {/* 1. Google Provider goes on the outside */}
    <GoogleOAuthProvider clientId={googleClientId}>
      
      {/* 2. Your custom Auth Provider goes on the inside */}
      <AuthProvider>
        
        {/* 3. City Provider for city-based product filtering */}
        <CityProvider>
          
          {/* 4. Your App component can now use all providers */}
          <App />

        </CityProvider>

      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
