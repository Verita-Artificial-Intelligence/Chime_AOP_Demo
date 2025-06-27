// Client-specific content configuration
// This file contains all text and branding elements that may change per client

export interface ContentConfig {
  clientName: string;
  platformName: string;
  platformFullName: string;
  pageTitleSuffix: string;
  welcomeMessage: string;
  builderWelcomeMessage: string;
  builderDescription: string;
  footerText: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
  };
}

const content: ContentConfig = {
  // Client branding
  clientName: "Chime",
  platformName: "Workflows",
  platformFullName: "Chime Workflows Platform",

  // Page titles and metadata
  pageTitleSuffix: "Workflows Demo",

  // Welcome messages
  welcomeMessage: "Chime Workflow Platform",
  builderWelcomeMessage: "Chime Workflows Builder",
  builderDescription:
    "Chime workflows. Get started by selecting a workflow template.",

  // Footer
  footerText: "© 2025 Chime Workflows",

  // Brand colors
  colors: {
    primary: "#1EC677", // Chime's primary green
    primaryHover: "#17a85f", // Darker shade for hover
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
