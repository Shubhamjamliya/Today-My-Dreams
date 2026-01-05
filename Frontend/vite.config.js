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
          // Core React and UI dependencies - keeping these together prevents resolution issues
          if (id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('framer-motion') ||
            id.includes('lucide-react') ||
            id.includes('@mui/') ||
            id.includes('@emotion/')) {
            return 'vendor-core';
          }

          // Heavy Utilities and static libraries
          if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('pdf-lib') || id.includes('turndown')) {
            return 'pdf-utils';
          }

          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'maps';
          }

          if (id.includes('axios')) {
            return 'network';
          }

          if (id.includes('date-fns')) {
            return 'date-utils';
          }

          // Remaining node_modules go to vendor
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
