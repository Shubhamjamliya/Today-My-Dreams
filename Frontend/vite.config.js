import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    target: 'es2015',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React and MUI together to ensure React is available for MUI
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/@mui/') || 
              id.includes('node_modules/@emotion/')) {
            return 'react-ui';
          }
          
          // Keep React Router separate
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'animation';
          }
          
          // Icon libraries
          if (id.includes('react-icons') || id.includes('@heroicons') || id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Utility libraries - split large utils
          if (id.includes('axios')) {
            return 'axios';
          }
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          if (id.includes('html2canvas') || id.includes('jspdf')) {
            return 'pdf-utils';
          }
          
          // Maps and location
          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'maps';
          }
          
          // Carousel libraries
          if (id.includes('react-slick') || id.includes('react-responsive-carousel')) {
            return 'carousel';
          }
          
          // Authentication
          if (id.includes('@react-oauth') || id.includes('google')) {
            return 'auth';
          }
          
          // Toast notifications
          if (id.includes('react-hot-toast') || id.includes('react-toastify')) {
            return 'toast';
          }
          
          // Cloudinary and file handling
          if (id.includes('cloudinary') || id.includes('multer')) {
            return 'cloudinary';
          }
          
          // Payment processing
          if (id.includes('razorpay')) {
            return 'payment';
          }
          
          // Email
          if (id.includes('nodemailer')) {
            return 'email';
          }
          
          // Large vendor libraries that should be separate
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': 'http://localhost:5175',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'react-hot-toast',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
    exclude: [
      'html2canvas',
      'jspdf',
      'leaflet',
      'react-leaflet',
    ],
    force: true, // Force re-optimization
  },
  define: {
    // Ensure React is available globally for MUI
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
