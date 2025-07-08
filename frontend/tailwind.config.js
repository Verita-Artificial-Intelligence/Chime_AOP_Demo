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
          // Primary Colors - Dark theme
          DEFAULT: "#000000", // Black
          primary: "#FFFFFF", // White for text/borders on dark
          primaryDark: "#E5E7EB", // Light gray for hover states
          primaryLight: "#1F2937", // Dark gray for backgrounds

          // Secondary Colors
          secondary: "#9CA3AF", // Light gray
          secondaryDark: "#E5E7EB", // Lighter gray for hover
          secondaryLight: "#111827", // Very dark gray for backgrounds

          // Status Colors - Keeping minimal contrast
          success: "#10B981", // Green
          successDark: "#059669", // Darker green for hover
          warning: "#F59E0B", // Orange
          warningDark: "#D97706", // Darker orange for hover
          danger: "#EF4444", // Red
          dangerDark: "#DC2626", // Darker red for hover

          // Special Colors
          purple: "#8B5CF6", // Purple
          purpleDark: "#7C3AED", // Darker purple for hover
          purpleLight: "#1F2937", // Dark gray for backgrounds

          // UI Colors
          background: "#000000", // Black background
          card: "#111827", // Very dark gray for cards
          border: "#374151", // Dark gray border
          borderLight: "#1F2937", // Darker border

          // Text Colors
          heading: "#FFFFFF", // White for headings
          text: "#E5E7EB", // Light gray for body text
          muted: "#9CA3AF", // Muted gray text

          // Sidebar
          sidebar: "#111827", // Dark gray background for sidebar
          sidebarBorder: "#374151", // Dark gray for sidebar borders
          sidebarActive: "#FFFFFF", // White for active states

          // Hover states
          hover: "#1F2937", // Dark gray hover
          light: "#111827", // Very dark gray
          dark: "#FFFFFF", // White
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
        "gradient-brand": "none", // No gradient
        "gradient-verita": "none", // No gradient
        "gradient-success": "none", // No gradient
      },
    },
  },
  plugins: [],
};
