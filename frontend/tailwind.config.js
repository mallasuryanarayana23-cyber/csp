/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050816',
          card: '#0d1526',
          secondary: '#0a0f1e',
          primary: '#6366f1', // Indigo
          accent: '#10b981', // Emerald
          warning: '#f59e0b', // Amber
          danger: '#ef4444', // Red
          glow: 'rgba(99, 102, 241, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 8px 32px 0 rgba(99, 102, 241, 0.25)',
        'accent-glow': '0 0 20px 2px rgba(16, 185, 129, 0.4)',
        'primary-glow': '0 0 20px 2px rgba(99, 102, 241, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.1 },
          '50%': { opacity: 0.3 },
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        }
      }
    },
  },
  plugins: [],
}
