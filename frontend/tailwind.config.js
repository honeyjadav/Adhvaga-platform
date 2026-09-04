/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep lagoon teal — primary brand color
        lagoon: {
          50: '#eef7f6',
          100: '#d3ece9',
          200: '#a7d9d3',
          300: '#78c2b9',
          400: '#4aa89d',
          500: '#2f8c81',
          600: '#226e67',
          700: '#1b5651',
          800: '#164440',
          900: '#0f2f2c',
        },
        // Soft sky blue — secondary
        sky: {
          50: '#f0f8fb',
          100: '#dcedf4',
          200: '#b7dbe9',
          300: '#8fc6d9',
          400: '#6fb7c9',
          500: '#4f9db2',
          600: '#3c7d92',
          700: '#32636f',
          800: '#2a505b',
          900: '#23434c',
        },
        // Warm sand — background & neutrals
        sand: {
          50: '#faf8f4',
          100: '#f4f0e7',
          200: '#e8dfcd',
          300: '#d8caa9',
          400: '#c3ae80',
        },
        // Amber — used sparingly for a single warm accent (CTAs, ratings)
        amber: {
          400: '#e3a857',
          500: '#d3903c',
          600: '#b5762c',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(15, 47, 44, 0.18)',
        card: '0 4px 16px -4px rgba(15, 47, 44, 0.12)',
      },
    },
  },
  plugins: [],
};
