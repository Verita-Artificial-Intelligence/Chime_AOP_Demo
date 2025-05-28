// Example configuration for JP Morgan
// To use this configuration, rename this file to content.ts

import { ContentConfig } from "./content";

const content: ContentConfig = {
  // Client branding
  clientName: "JP Morgan",
  platformName: "AOPS",
  platformFullName: "JP Morgan AOPS Platform",

  // Page titles and metadata
  pageTitleSuffix: "Automation Platform",

  // Welcome messages
  welcomeMessage: "Welcome to the JP Morgan AOPS Platform",
  builderWelcomeMessage: "Welcome to the JP Morgan AOPS Builder",
  builderDescription:
    "JP Morgan workflows. Get started by selecting a workflow template.",

  // Footer
  footerText: "© 2025 JP Morgan AOPS",

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
