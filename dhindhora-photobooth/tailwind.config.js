export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#ffffff',
          surface: '#f8f9fa',
          accent1: '#FF2E93', // Vibrant Pink
          accent2: '#00F0FF', // Cyan
          accent3: '#FF8A00', // Orange
          accent4: '#8A2BE2', // Purple
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        brush: ['Caveat', 'cursive'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'paint-splash': 'paintSplash 0.5s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)' },
          '50%': { boxShadow: '0 0 50px rgba(255, 46, 147, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        paintSplash: {
          '0%': { transform: 'scale(0.5)', opacity: 0 },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
