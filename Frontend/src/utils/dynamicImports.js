// Dynamic imports for heavy dependencies to reduce initial bundle size

// Heavy utility libraries - only load when needed
export const loadHtml2Canvas = () => import('html2canvas');
export const loadJsPDF = () => import('jspdf');

// Maps and location services - only load when needed
export const loadLeaflet = () => import('leaflet');
export const loadReactLeaflet = () => import('react-leaflet');

// Payment processing - only load when needed
export const loadRazorpay = () => import('razorpay');

// Email services - only load when needed
export const loadNodemailer = () => import('nodemailer');

// Cloudinary - only load when needed
export const loadCloudinary = () => import('cloudinary');
export const loadMulterStorageCloudinary = () => import('multer-storage-cloudinary');

// Carousel libraries - only load when needed
export const loadReactSlick = () => import('react-slick');
export const loadReactResponsiveCarousel = () => import('react-responsive-carousel');

// Toast libraries - only load when needed
export const loadReactToastify = () => import('react-toastify');

// Date utilities - only load when needed
export const loadDateFns = () => import('date-fns');
