import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();

  // Function to force scroll to top
  const forceScrollToTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    // Scroll to top only when the path changes (navigation)
    // We intentionally do NOT listen to 'focus' or 'popstate' to preserve scroll position
    // when switching browser tabs or using back/forward buttons.
    forceScrollToTop();
  }, [pathname]);
};

export default useScrollToTop; 