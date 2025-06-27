// Example configuration for JP Morgan
// To use this configuration, rename this file to content.ts

import { ContentConfig } from "./content";

const content: ContentConfig = {
  // Client branding
  clientName: "JP Morgan",
  platformName: "Workflows",
  platformFullName: "JP Morgan Workflows Platform",

  // Page titles and metadata
  pageTitleSuffix: "Automation Platform",

  // Welcome messages
  welcomeMessage: "JP Morgan Workflows Platform",
  builderWelcomeMessage: "JP Morgan Workflows Builder",
  builderDescription:
    "JP Morgan workflows. Get started by selecting a workflow template.",

  // Footer
  footerText: "© 2025 JP Morgan Workflows",

  // Brand colors
  colors: {
    primary: "#003087", // JP Morgan blue
    primaryHover: "#002060", // Darker blue for hover
    secondary: "#6B7280", // Gray
    background: "#FFFFFF", // White background
  },
};

// Function to apply colors as CSS variables
export function applyThemeColors() {
  const root = document.documentElement;
  root.style.setProperty("--color-brand-primary", content.colors.primary);
  root.style.setProperty("--color-brand-hover", content.colors.primaryHover);
  root.style.setProperty("--color-brand-secondary", content.colors.secondary);
  root.style.setProperty("--color-brand-background", content.colors.background);
}

export default content;
