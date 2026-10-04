/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // LOCKED brand colors - master prompt Section 1. Do not add
        // arbitrary colors elsewhere; use these tokens everywhere.
        bg: '#FFFFFF',
        text: {
          DEFAULT: '#000000',
          secondary: '#1A1A1A',
        },
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1E40AF',
        },
        border: '#E5E7EB',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      borderRadius: {
        card: '8px',
        input: '6px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
