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
          // Primary Colors - All white/gray theme
          DEFAULT: "#FFFFFF", // White
          primary: "#000000", // Black for text/borders
          primaryDark: "#1F2937", // Dark gray for hover states
          primaryLight: "#F9FAFB", // Very light gray for backgrounds

          // Secondary Colors
          secondary: "#6B7280", // Gray
          secondaryDark: "#4B5563", // Darker gray for hover
          secondaryLight: "#F3F4F6", // Light gray for backgrounds

          // Status Colors - Keeping minimal contrast
          success: "#059669", // Green
          successDark: "#047857", // Darker green for hover
          warning: "#D97706", // Orange
          warningDark: "#B45309", // Darker orange for hover
          danger: "#DC2626", // Red
          dangerDark: "#B91C1C", // Darker red for hover

          // Special Colors
          purple: "#7C3AED", // Purple
          purpleDark: "#6D28D9", // Darker purple for hover
          purpleLight: "#F5F3FF", // Light purple for backgrounds

          // UI Colors
          background: "#FFFFFF", // White background
          card: "#FFFFFF", // White for cards
          border: "#E5E7EB", // Light gray border
          borderLight: "#F3F4F6", // Lighter border

          // Text Colors
          heading: "#111827", // Near black for headings
          text: "#374151", // Medium gray for body text
          muted: "#9CA3AF", // Muted gray text

          // Sidebar
          sidebar: "#FFFFFF", // White background for sidebar
          sidebarBorder: "#E5E7EB", // Light gray for sidebar borders
          sidebarActive: "#000000", // Black for active states

          // Hover states
          hover: "#F3F4F6", // Light gray hover
          light: "#F9FAFB", // Very light gray
          dark: "#111827", // Near black
        },
        // Verita color palette with neutral shades
        verita: {
          gray: {
            50: "#F9FAFB",
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827",
          },
          neutral: {
            50: "#FAFAFA",
            100: "#F5F5F5",
            200: "#E5E5E5",
            300: "#D4D4D4",
            400: "#A3A3A3",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#262626",
            900: "#171717",
          },
          slate: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          },
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
        "gradient-brand": "linear-gradient(90deg, #F3F4F6, #E5E7EB, #D1D5DB)", // Light gray gradient
        "gradient-verita": "linear-gradient(135deg, #FFFFFF, #F9FAFB, #F3F4F6)", // White to light gray
        "gradient-success": "linear-gradient(90deg, #059669, #047857)", // Green gradient
      },
    },
  },
  plugins: [],
};
