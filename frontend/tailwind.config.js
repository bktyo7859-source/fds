/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        champagne: {
          DEFAULT: '#C5A880',
          dark: '#A88B63',
          light: '#EADFCF',
          subtle: '#FAF6F0'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F7F7F5',
          warm: '#F0EFEB',
          border: '#E7E7E7',
          dark: '#141414'
        },
        charcoal: {
          DEFAULT: '#111111',
          graphite: '#343434',
          muted: '#6B6B6B',
          light: '#8E8E8E'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        'luxury-hover': '0 30px 60px -20px rgba(0, 0, 0, 0.1), 0 0 1px 1px rgba(197, 168, 128, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'tactile': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8), 0 2px 6px rgba(0,0,0,0.04)',
        'tactile-pressed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
