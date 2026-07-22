/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pizza: {
          50: '#fffbf0',
          100: '#fef3d6',
          200: '#fde0ad',
          300: '#fbc378',
          400: '#f99d43',
          500: '#f47318',
          600: '#e0530e',
          700: '#ba3a0c',
          800: '#942d0f',
          900: '#772510',
          950: '#411005',
        },
      },
    },
  },
  plugins: [],
}
