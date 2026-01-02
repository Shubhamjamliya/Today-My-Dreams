import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();

  // Function to force scroll to top
  const forceScrollToTop = () => {
    // Multiple methods to ensure scroll to top works
    window.scrollTo(0, 0);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    // Set scroll position on all possible elements
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
    
    // For older browsers
    if (window.pageYOffset) {
      window.pageYOffset = 0;
    }
    if (window.pageXOffset) {
      window.pageXOffset = 0;
    }
  };

  useEffect(() => {
    // Scroll to top immediately when route changes
    forceScrollToTop();
  }, [pathname]);

  // Handle page load/reload and browser navigation
  useEffect(() => {
    const handlePageLoad = () => {
      // Small delay to ensure DOM is fully loaded
      setTimeout(() => {
        forceScrollToTop();
      }, 0);
    };

    const handleBeforeUnload = () => {
      // Force scroll to top before page unloads
      forceScrollToTop();
    };

    // Handle page load
    handlePageLoad();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', handlePageLoad);
    
    // Handle page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Handle window focus (when returning to tab)
    window.addEventListener('focus', handlePageLoad);
    
    return () => {
      window.removeEventListener('popstate', handlePageLoad);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handlePageLoad);
    };
  }, []);

  // Additional effect to handle any delayed scroll issues
  useEffect(() => {
    const timer = setTimeout(() => {
      forceScrollToTop();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);
};

export default useScrollToTop; 