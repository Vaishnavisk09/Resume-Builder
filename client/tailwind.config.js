/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7155E8',
          50: '#F0ECFF',
          100: '#E0D8FF',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#7155E8',
          600: '#5B3ED6',
          700: '#4529B8',
          800: '#321A9A',
          900: '#21117C',
        },
        navy: {
          DEFAULT: '#17152D',
          light: '#1E1C38',
          dark: '#0F0E1E',
        },
        lavender: '#F0ECFF',
        background: '#F8F8FC',
        'main-text': '#24233A',
        'secondary-text': '#85839A',
        border: '#EBE9F2',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(113, 85, 232, 0.08)',
        'card-hover': '0 8px 24px rgba(113, 85, 232, 0.16)',
        'elevated': '0 4px 16px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
