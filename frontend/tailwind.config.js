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
          // Primary Colors
          DEFAULT: "#04BAF7", // Bright Sky Blue
          primary: "#04BAF7", // Bright Sky Blue
          primaryDark: "#0396D1", // Darker blue for hover states
          primaryLight: "#E5F7FF", // Light blue for backgrounds

          // Secondary Colors
          secondary: "#FFDD04", // Vivid Yellow
          secondaryDark: "#E5C600", // Darker yellow for hover
          secondaryLight: "#FFFADB", // Light yellow for backgrounds

          // Status Colors
          success: "#10B981", // Emerald Green
          successDark: "#059669", // Darker green for hover
          warning: "#FE7D00", // Vivid Orange
          warningDark: "#E56F00", // Darker orange for hover
          danger: "#FF006D", // Bright Magenta Pink
          dangerDark: "#E5005F", // Darker pink for hover
          
          // Icon color
          iconGreen: "#10B981", // Emerald green for icons

          // Special Colors
          purple: "#8F04FF", // Vivid Purple
          purpleDark: "#7A00E5", // Darker purple for hover
          purpleLight: "#F4E5FF", // Light purple for backgrounds

          // UI Colors
          background: "#FFFFFF", // White background
          card: "#FFFFFF", // White for cards
          border: "#E5E7EB", // Light gray border
          borderLight: "#F3F4F6", // Lighter border

          // Text Colors
          heading: "#1F2937", // Dark gray for headings
          text: "#374151", // Medium gray for body text
          muted: "#6B7280", // Muted gray text

          // Sidebar
          sidebar: "#FFFFFF", // White background for sidebar
          sidebarBorder: "#E5E7EB", // Light gray for sidebar borders
          sidebarActive: "#04BAF7", // Primary blue for active states

          // Hover states
          hover: "#0396D1", // Primary hover
          light: "#E5F7FF", // Light blue tint
          dark: "#1F2937", // Dark text
        },
        // Verita color palette with shades
        verita: {
          blue: {
            50: "#E5F7FF",
            100: "#B8E8FF",
            200: "#8AD9FF",
            300: "#5CCAFF",
            400: "#30BBFD",
            500: "#04BAF7", // Primary
            600: "#0396D1",
            700: "#0272AB",
            800: "#014E85",
            900: "#002A5F",
          },
          yellow: {
            50: "#FFFADB",
            100: "#FFF4A3",
            200: "#FFEE6B",
            300: "#FFE833",
            400: "#FFE11C",
            500: "#FFDD04", // Secondary
            600: "#E5C600",
            700: "#CCAF00",
            800: "#B39800",
            900: "#998200",
          },
          orange: {
            50: "#FFF0E5",
            100: "#FFD9B8",
            200: "#FFC28A",
            300: "#FFAB5C",
            400: "#FF942E",
            500: "#FE7D00", // Warning
            600: "#E56F00",
            700: "#CC6200",
            800: "#B35500",
            900: "#994700",
          },
          pink: {
            50: "#FFE5F0",
            100: "#FFB8D9",
            200: "#FF8AC2",
            300: "#FF5CAB",
            400: "#FF2E94",
            500: "#FF006D", // Danger
            600: "#E5005F",
            700: "#CC0054",
            800: "#B30049",
            900: "#99003E",
          },
          lime: {
            50: "#F5FFE5",
            100: "#E6FFB8",
            200: "#D6FF8A",
            300: "#C7FF5C",
            400: "#B7FF2E",
            500: "#ADFF02", // Success
            600: "#94E000",
            700: "#7BC200",
            800: "#62A300",
            900: "#498500",
          },
          purple: {
            50: "#F4E5FF",
            100: "#E2B8FF",
            200: "#D08AFF",
            300: "#BE5CFF",
            400: "#AC2EFF",
            500: "#8F04FF", // Special
            600: "#7A00E5",
            700: "#6600CC",
            800: "#5200B3",
            900: "#3D0099",
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
        "gradient-brand": "linear-gradient(90deg, #04BAF7, #8F04FF, #FF006D)", // Blue to Purple to Pink
        "gradient-verita": "linear-gradient(135deg, #04BAF7, #FFDD04, #FE7D00)", // Blue to Yellow to Orange
        "gradient-success": "linear-gradient(90deg, #ADFF02, #94E000)",
      },
    },
  },
  plugins: [],
};
