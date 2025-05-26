/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          DEFAULT: '#1EC677',     // Mountain Meadow - Primary
          primary: '#1EC677',     // Mountain Meadow - Core brand green
          success: '#1EC677',     // Using primary for success states
          danger: '#ff4d4f',      // Keeping existing danger color
          background: '#ECF9EE',  // Ottoman - Light tint for app backgrounds
          card: '#FFFFFF',        // White - Surface color for cards
          border: '#ECF9EE',      // Ottoman - Subtle borders
          heading: '#0D4029',     // Bottle Green - Dark accent for headlines
          muted: '#0D4029',       // Bottle Green with opacity for muted text
          sidebar: '#FFFFFF',     // White background for sidebar
          sidebarBorder: '#ECF9EE', // Ottoman for sidebar borders
          sidebarActive: '#1EC677', // Mountain Meadow for active states
          light: '#ECF9EE',       // Ottoman - Light tint
          dark: '#0D4029',        // Bottle Green - Dark accent
        },
        // Adding semantic color names for easier reference
        'mountain-meadow': '#1EC677',
        'bottle-green': '#0D4029',
        'ottoman': '#ECF9EE',
        'neutral-white': '#FFFFFF',
      },
      fontSize: {
        'heading-1': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'heading-3': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
      },
      spacing: {
        'layout': '1.5rem',     // 24px
        'section': '3rem',      // 48px
        'card': '2rem',         // 32px
        'sidebar': '1.25rem',
        'header': '1.5rem',
        btn: '0.75rem 1.5rem',
      },
      borderRadius: {
        'card': '1.25rem',
        btn: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        none: 'none',
        xs: '0 1px 2px 0 rgba(13,64,41,0.03)',
        card: '0 1px 2px 0 rgba(13,64,41,0.03)',
        btn: '0 2px 8px 0 rgba(30,198,119,0.15)',
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(90deg, #1EC677, #0D4029, #ECF9EE)',
      },
    },
  },
  plugins: [],
}
