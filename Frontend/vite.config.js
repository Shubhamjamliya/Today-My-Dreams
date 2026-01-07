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
    chunkSizeWarningLimit: 2000,
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
        // Simplified chunking to prevent React initialization order issues
        manualChunks: {
          // Core React
          'react-core': [
            'react',
            'react-dom',
            'react-router-dom',
            'react-hot-toast',
            'react-toastify',
            '@react-oauth/google',
          ],
          // UI Libraries & Animations (Heavy)
          'ui-libs': [
            'framer-motion',
            'lucide-react',
            'react-icons',
            '@heroicons/react',
            'react-slick',
            'react-responsive-carousel',
          ],
          // Material UI (Very Heavy, split it out)
          'mui': [
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
          ],
          // Data Visualization (Heavy, likely only used in Admin)
          'vis-libs': [
            'recharts',
          ],
          // Utilities
          'utils': [
            'axios',
            'date-fns',
          ],
          // PDF/Export utilities
          'pdf': [
            'html2canvas',
            'jspdf',
          ],
          // Map libraries
          'maps': [
            'leaflet',
            'react-leaflet',
          ],
        },
        chunkFileNames: 'js/[name]-[hash].js',
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
      '/api': 'http://localhost:5000',
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
      'lucide-react',
    ],
    exclude: [
      'html2canvas',
      'jspdf',
      'leaflet',
      'react-leaflet',
    ],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
