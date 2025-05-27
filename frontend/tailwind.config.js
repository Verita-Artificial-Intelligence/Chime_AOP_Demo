/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: {
          DEFAULT: "#1EC677", // Chime's primary green
          primary: "#1EC677", // Chime's primary green
          primaryDark: "#179B5E", // Darker green for hover states
          primaryLight: "#37E192", // Lighter green for hover backgrounds
          success: "#1EC677", // Using primary for success states
          danger: "#ff4d4f", // Keeping existing danger color
          background: "#FFFFFF", // White background like Chime
          card: "#FFFFFF", // White for cards
          border: "#E5E7EB", // Light gray border
          heading: "#0D4029", // Deep green for headings
          muted: "#0D4029", // Deep green for muted text
          sidebar: "#FFFFFF", // White background for sidebar
          sidebarBorder: "#E5E7EB", // Light gray for sidebar borders
          sidebarActive: "#1EC677", // Primary green for active states
          light: "#E9FCF3", // Very light green tint
          dark: "#0D4029", // Deep green
        },
        // Adding Chime's color palette
        chime: {
          50: "#E9FCF3",
          100: "#BCFBDB",
          200: "#90EEC2",
          300: "#64E8AA",
          400: "#37E192",
          500: "#1EC677", // Primary
          600: "#179B5E",
          700: "#116F43",
          800: "#0A4328",
          900: "#03160D",
        },
      },
      fontSize: {
        "heading-1": ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "heading-2": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "heading-3": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "600" }],
      },
      spacing: {
        layout: "1.5rem", // 24px
        section: "3rem", // 48px
        card: "2rem", // 32px
        sidebar: "1.25rem",
        header: "1.5rem",
        btn: "0.75rem 1.5rem",
      },
      borderRadius: {
        card: "1.25rem",
        btn: "0.5rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      boxShadow: {
        none: "none",
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        card: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
        btn: "none", // Remove button shadows
      },
      transitionProperty: {
        colors:
          "color, background-color, border-color, text-decoration-color, fill, stroke",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(90deg, #1EC677, #179B5E, #116F43)",
      },
    },
  },
  plugins: [],
};
