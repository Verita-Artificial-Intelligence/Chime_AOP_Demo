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
          DEFAULT: '#FF3008',     // DoorDash Red :contentReference[oaicite:0]{index=0}
          primary: '#FF3008',     // same as DEFAULT :contentReference[oaicite:1]{index=1}
          success: '#00b88b',     // retained from your original setup
          danger: '#ff4d4f',      // retained from your original setup
          background: '#FFFFFF',  // white :contentReference[oaicite:2]{index=2}
          card: '#FFFFFF',        // white :contentReference[oaicite:3]{index=3}
          border: '#F2F2F2',      // light gray for subtle dividers
          heading: '#191919',     // “Cod Gray” :contentReference[oaicite:4]{index=4}
          muted: '#767676',       // moderate gray for less prominent text
          sidebar: '#FFFFFF',     // white background
          sidebarBorder: '#F2F2F2', // matching border
          sidebarActive: '#EB1700', // Scarlet accent :contentReference[oaicite:5]{index=5}
          light: '#A3B9A7',       // retained from your original setup
          dark: '#191919',        // matching heading color :contentReference[oaicite:6]{index=6}
        },
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
        xs: '0 1px 2px 0 rgba(16,30,54,0.03)',
        card: '0 1px 2px 0 rgba(16,30,54,0.03)',
        btn: '0 2px 8px 0 rgba(29, 78, 216, 0.15)',
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(90deg, #FF3008, #D32F2F, #EA5A4D)',
      },
    },
  },
  plugins: [],
}
