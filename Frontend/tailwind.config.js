/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        'xs': '2px',
        'xl': '40px',
        '2xl': '60px',
      },
      colors: {
        // Eccentric Blue
        'eccentric-blue': {
          50: '#eff6ff',
          500: '#0066ff',
          600: '#0052cc',
          900: '#1e3a8a',
        },
        // Cinema Classic
        'cinema-red': {
          50: '#fef2f2',
          500: '#dc143c',
          600: '#8b0000',
          900: '#7f1d1d',
        },
        // Midnight Purple
        'midnight-purple': {
          50: '#faf5ff',
          500: '#6b46c1',
          600: '#9333ea',
          900: '#581c87',
        },
        // Netflix Dark
        'netflix': {
          50: '#f8fafc',
          500: '#e50914',
          600: '#141414',
          900: '#0f0f0f',
        },
        // Retro Neon
        'retro-pink': {
          50: '#fdf2f8',
          500: '#ff1493',
          600: '#00ff41',
          900: '#831843',
        },
        // Forest Green
        'forest-green': {
          50: '#f0fdf4',
          500: '#059669',
          600: '#10b981',
          900: '#14532d',
        },
        // Sunset Orange
        'sunset-orange': {
          50: '#fff7ed',
          500: '#ff6b35',
          600: '#f97316',
          900: '#9a3412',
        },
        // Monochrome
        'mono': {
          50: '#ffffff',
          500: '#6b7280',
          600: '#374151',
          900: '#000000',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'float-up': 'float-up 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float-up': {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}