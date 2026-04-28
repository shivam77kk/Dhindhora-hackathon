
export default  {
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
        brand: {
          50: '#f0e8ff', 100: '#d4b8ff', 200: '#b888ff', 300: '#9c58ff',
          400: '#8028ff', 500: '#6C63FF', 600: '#5040e0', 700: '#3a2eb8',
          800: '#241d90', 900: '#0e0b68',
        },
        neon: { purple: '#8B5CF6', pink: '#EC4899', cyan: '#06B6D4', green: '#10B981', orange: '#F97316' },
        dhin: { dark: '#050510', darker: '#020208', card: '#0d0d2b', border: 'rgba(108,99,255,0.2)' },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spinReverse 12s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'text-gradient': 'textGradient 3s linear infinite',
        'wormhole': 'wormholePulse 2s ease-in-out infinite',
        'coin-flip': 'coinFlip 0.6s ease-in-out',
        'music-wave': 'musicWave 1.2s ease-in-out infinite',
        'portal-spin': 'portalSpin 4s linear infinite',
        'gravity-float': 'gravityFloat 8s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        gravityFloat: { '0%': { transform: 'translateY(0) rotate(0deg)' }, '25%': { transform: 'translateY(-30px) rotate(2deg)' }, '50%': { transform: 'translateY(-10px) rotate(-1deg)' }, '75%': { transform: 'translateY(-25px) rotate(1.5deg)' }, '100%': { transform: 'translateY(0) rotate(0deg)' } },
        glowPulse: { '0%, 100%': { boxShadow: '0 0 20px #6C63FF66' }, '50%': { boxShadow: '0 0 60px #6C63FFcc, 0 0 100px #EC489944' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        textGradient: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        wormholePulse: { '0%, 100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.1)', opacity: 0.8 } },
        coinFlip: { '0%': { transform: 'rotateY(0)' }, '50%': { transform: 'rotateY(90deg)' }, '100%': { transform: 'rotateY(0)' } },
        musicWave: { '0%, 100%': { height: '4px' }, '50%': { height: '20px' } },
        portalSpin: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        spinReverse: { '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(at 40% 20%, #6C63FF33 0px, transparent 50%), radial-gradient(at 80% 0%, #EC489933 0px, transparent 50%), radial-gradient(at 0% 50%, #06B6D433 0px, transparent 50%)',
        'anti-gravity': 'radial-gradient(ellipse at 50% 50%, #6C63FF22 0%, transparent 70%), radial-gradient(ellipse at 0% 100%, #EC489922 0%, transparent 60%), radial-gradient(ellipse at 100% 0%, #06B6D422 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};

