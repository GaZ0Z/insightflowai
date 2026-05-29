/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2596be',
          light: '#3ea8d0',
          dark: '#1e7ea0',
          50: '#f0f9fc',
          100: '#e0f3fa',
          200: '#bce4f4',
          300: '#83ceeb',
          400: '#43b3df',
          500: '#2596be',
          600: '#1b799e',
          700: '#186280',
          800: '#18536b',
          900: '#19465a',
          950: '#0c2d3d',
        },
        navy: {
          50: '#f4f6fa',
          100: '#e9edf5',
          200: '#cbd5e8',
          300: '#9cb2d4',
          400: '#6889bc',
          500: '#476aa3',
          600: '#355285',
          700: '#2c436b',
          800: '#273859',
          900: '#23314d',
          950: '#0f172a', // Deep slate background
        }
      },
      borderRadius: {
        'large': '12px',
      }
    },
  },
  plugins: [],
}
