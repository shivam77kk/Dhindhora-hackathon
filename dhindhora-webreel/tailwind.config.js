export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1', // Primary Indigo
          600: '#4F46E5',
          900: '#312E81',
        },
        accent: {
          500: '#F59E0B', // Amber
          600: '#D97706',
        },
        neutral: {
          50: '#F9FAFB', // Background
          100: '#F3F4F6',
          200: '#E5E7EB', // Border
          800: '#1F2937',
          900: '#111827', // Text
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'soft-hover': '0 10px 40px rgba(99, 102, 241, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
};
