/**
 * Tailwind CSS Configuration File
 * Adapted for Verita AI SaaS App design system
 */
module.exports = {
  // Enable class-based dark mode if needed
  // darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: '#22211F',       // Dark hero background
        secondary: '#F5EFE7',     // Cream main background
        accent: '#3476E6',        // Core accent blue

        // Surface & Neutrals
        white: '#FFFFFF',
        black: '#000000',
        surfaceLight: '#FAF8F5',
        surfaceMedium: '#ECECEC',
        borderLight: '#E0DED8',

        // Text 
        textPrimary: '#111111',
        textSecondary: '#3B3B3B',
        textMuted: '#797776',

        // Accent Variants
        blue: {
          DEFAULT: '#3476E6',
          soft: '#D5E3FA',
          border: '#A8C5F6',
          hover: '#1D5BBF',
        },
        green: {
          DEFAULT: '#18C47C',
          soft: '#D2F6E3',
          border: '#A6E7C9',
          hover: '#139962',
        },
        gold: {
          DEFAULT: '#FFB545',
          soft: '#FFF4DB',
          border: '#FFDCA8',
          hover: '#CC9137',
        },
        red: {
          DEFAULT: '#F44336',
          soft: '#FFD6D2',
          border: '#F8AFA7',
          hover: '#C72D1C',
        },
      },
      spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '0.75rem',   // 12px (compact)
        base: '1rem',    // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1' }],
        sm: ['0.875rem', { lineHeight: '1.25' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.2' }],
        '2xl': ['1.5rem', { lineHeight: '1.2' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.04)',
        md: '0 2px 8px 0 rgba(0,0,0,0.07)',
        lg: '0 4px 24px 0 rgba(0,0,0,0.09)',
        elevation: '0 8px 32px 0 rgba(0,0,0,0.14)',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      opacity: {
        disabled: '0.4',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        150: '150ms',
        250: '250ms',
      },
      ringWidth: {
        DEFAULT: '2px',
      },
      ringColor: {
        DEFAULT: '#3476E6',
      },
    },
  },
  variants: {},
  plugins: [],
};
