
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/store/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bau: {
          red: '#E63946',
          blue: '#457B9D',
          navy: '#1D3557',
          yellow: '#F4A261',
          cream: '#F1FAEE',
          black: '#0a0a0a',
          surface: '#141414',
          card: '#1a1a1a',
        },
        brand: {
          400: '#E63946', 500: '#E63946', 600: '#c5303c',
        },
        neon: {
          pink: '#E63946', cyan: '#457B9D', green: '#2A9D8F', orange: '#F4A261',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'text-gradient': 'textGradient 4s linear infinite',
      },
      keyframes: {
        slideUp: { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        textGradient: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },
    },
  },
  plugins: [],
};
