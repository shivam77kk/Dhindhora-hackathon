export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vintage: {
          bg:        '#12100e',
          'bg-2':    '#1c1814',
          card:      '#221e19',
          'card-2':  '#2a2520',
          parchment: '#f5e6c8',
          cream:     '#ede0cc',
          gold:      '#c4a35a',
          'gold-light': '#d4b978',
          amber:     '#b07a4b',
          copper:    '#a0694a',
          burgundy:  '#7a3b3b',
          teal:      '#4a7a72',
          sage:      '#7d8b6a',
          text:      '#e0d4be',
          'text-dim':'#9c8e78',
          border:    'rgba(196,163,90,0.2)',
        },
        /* keep brand for compatibility */
        brand: {
          500: '#c4a35a',
          600: '#a8883e',
        },
        neon: { pink: '#c47a6a', cyan: '#7aaa9c', green: '#8b956d', orange: '#c4903a' },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Lora', 'Georgia', 'serif'],
        mono:    ['Special Elite', 'Courier New', 'monospace'],
      },
      animation: {
        'float':       'float 8s ease-in-out infinite',
        'float-slow':  'float 12s ease-in-out infinite',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
        'slide-up':    'slideUp 0.6s ease-out',
        'fade-in':     'fadeIn 0.6s ease-out',
        'shimmer':     'shimmer 3s linear infinite',
        'spin-slow':   'spin 10s linear infinite',
      },
      keyframes: {
        float:      { '0%, 100%': { transform: 'translateY(0)' },     '50%': { transform: 'translateY(-15px)' } },
        glowPulse:  { '0%, 100%': { boxShadow: '0 0 15px rgba(196,163,90,0.2)' }, '50%': { boxShadow: '0 0 40px rgba(196,163,90,0.35)' } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(24px)' },  to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'vintage-radial': 'radial-gradient(ellipse at 50% 30%, rgba(196,163,90,0.06) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};
