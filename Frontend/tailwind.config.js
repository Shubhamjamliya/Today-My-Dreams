// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
        display: ['"General Sans"', 'sans-serif'],
      },
      colors: {
        'brand-pink': '#FCD24C',
        'brand-purple': '#FCD24C',
        'brand-light': '#FCD24C',
        'dark-text': '#333333',
        'light-text': '#666666',
        'light': '#FDE68A', // A lighter shade for gradients
        'dark': '#FBBF24',  // A darker shade for hovers
        'custom-dark-blue': '#1D1B4A'
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Add Poppins or another modern font
      },
      screens: {
        'xs': '475px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
}