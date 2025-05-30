/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "Helvetica", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: {
          DEFAULT: "#117ACA", // JP Morgan's primary blue
          primary: "#117ACA", // JP Morgan's primary blue
          primaryDark: "#0E5FA0", // Darker blue for hover states
          primaryLight: "#1B8FE0", // Lighter blue for hover backgrounds
          hover: "#0E5FA0", // Darker blue for hover states
          success: "#4A90A4", // Light blue/teal for success states
          danger: "#ff4d4f", // Keeping existing danger color
          background: "#FFFFFF", // White background
          card: "#FFFFFF", // White for cards
          border: "#E5E7EB", // Light gray border
          heading: "#1F4E79", // Navy/Dark blue for headings
          muted: "#333333", // Dark gray for muted text
          sidebar: "#F8F9FA", // Light gray background for sidebar
          sidebarBorder: "#E0E0E0", // Light gray for sidebar borders
          sidebarActive: "#117ACA", // Primary blue for active states
          light: "#F5F5F5", // Very light gray for sections
          dark: "#2C2C2C", // Dark gray for text
          accent: "#D4AF37", // Gold/tan accent color
        },
        // Adding JP Morgan's color palette
        jpmorgan: {
          50: "#E6F0FA",
          100: "#CCE2F5",
          200: "#99C5EB",
          300: "#66A8E0",
          400: "#338BD6",
          500: "#117ACA", // Primary
          600: "#0E5FA0",
          700: "#0A4576",
          800: "#072A4C",
          900: "#031022",
          navy: "#1F4E79",
          teal: "#4A90A4",
          gold: "#D4AF37",
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
        card: "0.5rem", // More conservative radius for JP Morgan
        btn: "0.25rem", // Smaller radius for buttons
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        none: "none",
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        card: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
        btn: "0 1px 2px 0 rgba(0,0,0,0.05)", // Subtle button shadows
      },
      transitionProperty: {
        colors:
          "color, background-color, border-color, text-decoration-color, fill, stroke",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(90deg, #117ACA, #0E5FA0, #0A4576)",
      },
    },
  },
  plugins: [],
};
